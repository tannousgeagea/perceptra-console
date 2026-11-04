import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/services/apiClient';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { invalidateJobImages } from '@/hooks/useJobImages';
import { useAnnotationGeometry } from './AnnotationGeometryContext';
import { useAnnotationState } from './AnnotationStateContext';
import type { Box } from '@/types/annotation';
import type { ProjectImageOut } from '@/types/image';
import { annotationsToBoxes } from '@/components/annotation-tool/boxes';

/**
 * Every annotation change in the annotator goes through here:
 *
 *  - the canvas updates instantly (optimistic),
 *  - the change is persisted in the background through a single ordered
 *    write queue (so rapid undo/redo can never reach the server out of order),
 *  - and it is recorded as one undoable step.
 *
 * The server "save" endpoint is an upsert keyed by annotation_uid that also
 * revives soft-deleted annotations, so every step has an exact inverse:
 * create ⇄ delete, update(before → after) ⇄ update(after → before).
 */

type Op =
  | { kind: 'create'; box: Box }
  | { kind: 'delete'; box: Box }
  | { kind: 'update'; before: Box; after: Box }
  | { kind: 'batch'; ops: Op[] };

interface Step {
  label: string;
  op: Op;
}

export type SaveState = 'idle' | 'saving' | 'error';

interface ClassChoice {
  name: string;
  color: string;
  classId?: number;
}

interface AnnotationCommands {
  /** Replace the canvas with an image's saved annotations and start a fresh history. */
  load: (image: ProjectImageOut) => void;
  /**
   * Persist a box as one undoable step (`patch` = final geometry from a drag,
   * which may not have rendered yet). Unlabeled drafts and no-op edits are ignored.
   */
  commit: (id: string, patch?: Partial<Box>, meta?: { timeSeconds?: number | null }) => void;
  /** Give a box a class and save it in one step (e.g. a number key). */
  setClass: (id: string, choice: ClassChoice) => void;
  remove: (id: string) => void;
  /** Throw away unsaved local edits: back to the saved state, or gone if never saved. */
  revert: (id: string) => void;
  /** Add copies of boxes (new ids) as one step; skips ones already on the canvas. Returns how many were added. */
  paste: (boxes: Box[]) => number;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undoLabel?: string;
  redoLabel?: string;
  saveState: SaveState;
  retryFailed: () => void;
  /** Unsaved drafts, writes in flight, or failed writes. */
  hasUnsavedWork: boolean;
}

const AnnotationCommandsContext = createContext<AnnotationCommands | undefined>(undefined);

const MAX_HISTORY = 100;

/** Works on plain-HTTP LAN deployments too, where crypto.randomUUID is unavailable. */
const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const sameBox = (a: Box, b: Box) =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height && a.label === b.label;

const iou = (a: Box, b: Box) => {
  const ix = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const inter = ix * iy;
  const union = a.width * a.height + b.width * b.height - inter;
  return union > 0 ? inter / union : 0;
};

const inverse = (op: Op): Op => {
  switch (op.kind) {
    case 'create': return { kind: 'delete', box: op.box };
    case 'delete': return { kind: 'create', box: op.box };
    case 'update': return { kind: 'update', before: op.after, after: op.before };
    case 'batch': return { kind: 'batch', ops: [...op.ops].reverse().map(inverse) };
  }
};

const describe = (op: Op): string => {
  switch (op.kind) {
    case 'create': return `Add ${op.box.label}`;
    case 'delete': return `Delete ${op.box.label}`;
    case 'update':
      return op.before.label !== op.after.label
        ? `Relabel ${op.before.label} → ${op.after.label}`
        : `Adjust ${op.after.label}`;
    case 'batch': return `${op.ops.length} changes`;
  }
};

const toPayload = (box: Box) => ({
  annotation_type: 'box',
  annotation_class_name: box.label,
  data: [box.x, box.y, box.x + box.width, box.y + box.height],
  annotation_uid: box.id,
  annotation_source: 'manual',
  confidence: 1.0,
});

async function failure(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => null);
  return new Error(typeof body?.detail === 'string' ? body.detail : fallback);
}

export const AnnotationCommandsProvider: React.FC<{
  projectId: string;
  image: ProjectImageOut;
  children: React.ReactNode;
}> = ({ projectId, image, children }) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { boxes, addBox, deleteBox, setAllBoxes } = useAnnotationGeometry();
  const { selectedBox, setSelectedBox } = useAnnotationState();

  const boxesRef = useRef(boxes);
  boxesRef.current = boxes;
  const imageRef = useRef(image);
  imageRef.current = image;

  /** Last state of each box the server has been asked to store. */
  const savedRef = useRef(new Map<string, Box>());
  const pastRef = useRef<Step[]>([]);
  const futureRef = useRef<Step[]>([]);
  const [, setHistoryVersion] = useState(0);
  const bumpHistory = () => setHistoryVersion((v) => v + 1);

  // ── Background write queue ────────────────────────────────────────────
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const failedRef = useRef<(() => Promise<void>)[]>([]);
  const [pending, setPending] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const wroteRef = useRef(new Set<string>());

  const enqueue = useCallback((task: () => Promise<void>, imageUid: string) => {
    setPending((n) => n + 1);
    queueRef.current = queueRef.current
      .then(task)
      .then(
        () => { wroteRef.current.add(imageUid); },
        (error: Error) => {
          failedRef.current.push(task);
          setFailedCount(failedRef.current.length);
          toast.error(`Couldn't save annotation: ${error.message}`, {
            id: 'annotation-save-error',
            action: { label: 'Retry', onClick: () => retryRef.current() },
          });
        }
      )
      .finally(() => setPending((n) => n - 1));
  }, []);

  const retryRef = useRef(() => {});
  const retryFailed = useCallback(() => {
    const tasks = failedRef.current;
    failedRef.current = [];
    setFailedCount(0);
    tasks.forEach((task) => enqueue(task, imageRef.current.image.image_id));
  }, [enqueue]);
  retryRef.current = retryFailed;

  // Once the queue drains, refresh what other screens show (counts, cached details).
  useEffect(() => {
    if (pending > 0 || wroteRef.current.size === 0) return;
    wroteRef.current.forEach((imageUid) =>
      queryClient.invalidateQueries({
        queryKey: ['projectImageDetails', currentOrganization?.id, projectId, imageUid],
        refetchType: 'none',
      })
    );
    wroteRef.current.clear();
    invalidateJobImages(queryClient);
  }, [pending, queryClient, currentOrganization?.id, projectId]);

  const persist = useCallback((saves: Box[], deletes: string[], meta?: { timeSeconds?: number | null }) => {
    // Captured now: a write queued on this image still lands here after navigating on.
    const projectImageId = Number(imageRef.current.id);
    const imageUid = imageRef.current.image.image_id;

    deletes.forEach((id) =>
      enqueue(async () => {
        const response = await apiFetch(`/api/v1/projects/${projectId}/annotations/${id}`, {
          method: 'DELETE',
        });
        // Already gone is fine — the goal state is reached.
        if (!response.ok && response.status !== 404) throw await failure(response, 'delete failed');
      }, imageUid)
    );

    if (saves.length === 1) {
      enqueue(async () => {
        const response = await apiFetch(
          `/api/v1/projects/${projectId}/images/${projectImageId}/annotations`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...toPayload(saves[0]),
              annotation_time_seconds: meta?.timeSeconds ?? undefined,
            }),
          }
        );
        if (!response.ok) throw await failure(response, 'save failed');
      }, imageUid);
    } else if (saves.length > 1) {
      enqueue(async () => {
        const response = await apiFetch(`/api/v1/projects/${projectId}/annotations/batch`, {
          method: 'POST',
          body: JSON.stringify({ project_image_id: projectImageId, annotations: saves.map(toPayload) }),
        });
        if (!response.ok) throw await failure(response, 'save failed');
      }, imageUid);
    }
  }, [enqueue, projectId]);

  // ── Applying steps ────────────────────────────────────────────────────
  /** Apply an op to the canvas + saved map, collecting the writes it needs. */
  const applyLocal = useCallback((op: Op, saves: Map<string, Box>, deletes: Set<string>) => {
    switch (op.kind) {
      case 'create':
      case 'update': {
        const box = op.kind === 'create' ? op.box : op.after;
        addBox({ ...box });
        savedRef.current.set(box.id, { ...box });
        saves.set(box.id, box);
        deletes.delete(box.id);
        break;
      }
      case 'delete':
        deleteBox(op.box.id);
        savedRef.current.delete(op.box.id);
        deletes.add(op.box.id);
        saves.delete(op.box.id);
        break;
      case 'batch':
        op.ops.forEach((child) => applyLocal(child, saves, deletes));
        break;
    }
  }, [addBox, deleteBox]);

  const apply = useCallback((op: Op, meta?: { timeSeconds?: number | null }) => {
    const saves = new Map<string, Box>();
    const deletes = new Set<string>();
    applyLocal(op, saves, deletes);
    persist([...saves.values()], [...deletes], meta);
  }, [applyLocal, persist]);

  const record = useCallback((op: Op) => {
    pastRef.current = [...pastRef.current, { label: describe(op), op }].slice(-MAX_HISTORY);
    futureRef.current = [];
    bumpHistory();
  }, []);

  const commitBox = useCallback((box: Box, meta?: { timeSeconds?: number | null }) => {
    if (!box.label?.trim()) return; // a draft — saved once it has a class
    const before = savedRef.current.get(box.id);
    if (before && sameBox(before, box)) return;
    const op: Op = before ? { kind: 'update', before, after: { ...box } } : { kind: 'create', box: { ...box } };
    apply(op, meta);
    record(op);
  }, [apply, record]);

  const commit = useCallback<AnnotationCommands['commit']>((id, patch, meta) => {
    const box = boxesRef.current.get(id);
    if (box) commitBox({ ...box, ...patch }, meta);
  }, [commitBox]);

  const setClass = useCallback<AnnotationCommands['setClass']>((id, choice) => {
    const box = boxesRef.current.get(id);
    if (!box) return;
    commitBox({ ...box, label: choice.name, color: choice.color, class_id: choice.classId ?? box.class_id });
  }, [commitBox]);

  const undoRef = useRef(() => {});

  /**
   * What the server holds for a box. Labeled boxes added outside this engine
   * (e.g. accepted AI suggestions, saved by their own endpoint) count as saved.
   */
  const savedSnapshot = (id: string): Box | undefined => {
    const saved = savedRef.current.get(id);
    if (saved) return saved;
    const box = boxesRef.current.get(id);
    return box?.label?.trim() ? { ...box } : undefined;
  };

  const remove = useCallback((id: string) => {
    const saved = savedSnapshot(id);
    if (selectedBox === id) setSelectedBox(null);
    if (!saved) {
      deleteBox(id); // an unlabeled draft — never saved, nothing to undo
      return;
    }
    const op: Op = { kind: 'delete', box: saved };
    apply(op);
    record(op);
    toast(`Deleted ${saved.label}`, {
      id: 'annotation-history',
      duration: 3000,
      action: { label: 'Undo', onClick: () => undoRef.current() },
    });
  }, [apply, record, deleteBox, selectedBox, setSelectedBox]);

  const revert = useCallback((id: string) => {
    const saved = savedSnapshot(id);
    if (saved) addBox({ ...saved });
    else deleteBox(id);
  }, [addBox, deleteBox]);

  const paste = useCallback((source: Box[]) => {
    const existing = [...boxesRef.current.values()];
    const copies = source
      .filter((b) => b.label && !existing.some((e) => e.label === b.label && iou(e, b) > 0.9))
      .map((b) => ({ ...b, id: newId() }));
    if (copies.length === 0) return 0;
    const op: Op = { kind: 'batch', ops: copies.map((box) => ({ kind: 'create', box })) };
    apply(op);
    record(op);
    return copies.length;
  }, [apply, record]);

  const undo = useCallback(() => {
    const step = pastRef.current[pastRef.current.length - 1];
    if (!step) return;
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current, step];
    setSelectedBox(null);
    apply(inverse(step.op));
    bumpHistory();
    toast(`Undo: ${step.label}`, { id: 'annotation-history', duration: 1500 });
  }, [apply, setSelectedBox]);
  undoRef.current = undo;

  const redo = useCallback(() => {
    const step = futureRef.current[futureRef.current.length - 1];
    if (!step) return;
    futureRef.current = futureRef.current.slice(0, -1);
    pastRef.current = [...pastRef.current, step];
    setSelectedBox(null);
    apply(step.op);
    bumpHistory();
    toast(`Redo: ${step.label}`, { id: 'annotation-history', duration: 1500 });
  }, [apply, setSelectedBox]);

  const load = useCallback((next: ProjectImageOut) => {
    const loaded = annotationsToBoxes(next);
    savedRef.current = new Map(loaded.map((b) => [b.id, { ...b }]));
    pastRef.current = [];
    futureRef.current = [];
    setAllBoxes(loaded);
    bumpHistory();
  }, [setAllBoxes]);

  // Unlabeled boxes, or saved boxes edited but not yet committed.
  const hasDraft = useMemo(() => {
    for (const box of boxes.values()) {
      if (!box.label?.trim()) return true;
      const saved = savedRef.current.get(box.id);
      if (saved && !sameBox(saved, box)) return true;
    }
    return false;
  }, [boxes]);

  const past = pastRef.current;
  const future = futureRef.current;
  const value: AnnotationCommands = {
    load,
    commit,
    setClass,
    remove,
    revert,
    paste,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undoLabel: past[past.length - 1]?.label,
    redoLabel: future[future.length - 1]?.label,
    saveState: failedCount > 0 ? 'error' : pending > 0 ? 'saving' : 'idle',
    retryFailed,
    hasUnsavedWork: hasDraft || pending > 0 || failedCount > 0,
  };

  return <AnnotationCommandsContext.Provider value={value}>{children}</AnnotationCommandsContext.Provider>;
};

export const useAnnotationCommands = () => {
  const context = useContext(AnnotationCommandsContext);
  if (!context) throw new Error('useAnnotationCommands must be used within an AnnotationCommandsProvider');
  return context;
};
