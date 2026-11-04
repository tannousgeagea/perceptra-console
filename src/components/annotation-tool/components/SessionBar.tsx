import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Check, ClipboardCopy, Loader, Redo2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/ui/tooltip';
import { useAnnotationCommands } from '@/contexts/AnnotationCommandsContext';
import { medianMsPerImage, useAnnotationPaceStore } from '@/stores/annotationPaceStore';
import type { Box } from '@/types/annotation';
import type { JobImageCounts } from '@/types/image';
import { cn } from '@/lib/utils';
import { isTypingTarget } from '../hotkeys';

interface SessionBarProps {
  /** Job progress; omitted outside a job. */
  counts?: JobImageCounts;
  /** Pace is tracked per scope (the job). */
  scope: string | null;
  /** Boxes of the previous image in the list, or null when there is none. */
  loadPreviousBoxes?: () => Promise<Box[] | null>;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

const formatDuration = (ms: number) => {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

const IconAction = ({
  label, shortcut, disabled, onClick, children,
}: {
  label: string;
  shortcut: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      {/* span keeps the tooltip working while the button is disabled */}
      <span>
        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={disabled} onClick={onClick} aria-label={label}>
          {children}
        </Button>
      </span>
    </TooltipTrigger>
    <TooltipContent>
      {label} <kbd className="ml-1 rounded border border-border px-1 text-[10px]">{shortcut}</kbd>
    </TooltipContent>
  </Tooltip>
);

const SaveIndicator = () => {
  const { saveState, retryFailed } = useAnnotationCommands();

  if (saveState === 'error') {
    return (
      <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-xs text-destructive" onClick={retryFailed}>
        <AlertTriangle className="h-3.5 w-3.5" />
        Not saved · Retry
      </Button>
    );
  }
  return (
    <span
      className="flex w-[68px] items-center gap-1.5 text-xs text-muted-foreground"
      aria-live="polite"
    >
      {saveState === 'saving' ? (
        <><Loader className="h-3.5 w-3.5 animate-spin" />Saving…</>
      ) : (
        <><Check className="h-3.5 w-3.5 text-emerald-500" />Saved</>
      )}
    </span>
  );
};

const JobProgress = ({ counts }: { counts: JobImageCounts }) => {
  const finishedAt = useAnnotationPaceStore((s) => s.finishedAt);
  const msPerImage = medianMsPerImage(finishedAt);
  const done = counts.total - counts.unannotated;
  const pct = counts.total ? Math.round((done / counts.total) * 100) : 0;
  const perHour = msPerImage ? Math.round(3_600_000 / msPerImage) : null;
  const eta = msPerImage && counts.unannotated ? formatDuration(msPerImage * counts.unannotated) : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex min-w-[150px] cursor-default flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="font-medium tabular-nums text-foreground">
              {done.toLocaleString()} / {counts.total.toLocaleString()}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {perHour ? `${perHour}/h${eta ? ` · ~${eta} left` : ''}` : `${pct}%`}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        <div className="space-y-0.5">
          <div>{counts.unannotated.toLocaleString()} to annotate</div>
          <div>{counts.annotated.toLocaleString()} annotated · {counts.reviewed.toLocaleString()} reviewed</div>
          <div>{counts.dataset.toLocaleString()} completed{counts.marked_null ? ` · ${counts.marked_null} empty` : ''}</div>
          <div className="pt-1 text-muted-foreground">
            {perHour ? 'Pace is from the images you finished this session (breaks excluded).' : 'Pace shows after a few images.'}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Right side of the annotator header: save status, undo/redo, copy labels
 * from the previous image, and job progress with the annotator's pace.
 */
const SessionBar = ({ counts, scope, loadPreviousBoxes }: SessionBarProps) => {
  const { undo, redo, canUndo, canRedo, undoLabel, redoLabel, paste } = useAnnotationCommands();
  const setScope = useAnnotationPaceStore((s) => s.setScope);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => setScope(scope), [scope, setScope]);

  const copyPrevious = async () => {
    if (!loadPreviousBoxes || isCopying) return;
    setIsCopying(true);
    try {
      const boxes = await loadPreviousBoxes();
      if (boxes === null) {
        toast.info('There is no previous image in this list');
      } else if (boxes.length === 0) {
        toast.info('The previous image has no annotations');
      } else {
        const added = paste(boxes);
        if (added) toast.success(`Copied ${added} annotation${added === 1 ? '' : 's'} from the previous image`, { id: 'annotation-history' });
        else toast.info('Those annotations are already here');
      }
    } catch {
      toast.error("Couldn't load the previous image");
    } finally {
      setIsCopying(false);
    }
  };

  // Latest handlers for the one window listener.
  const actionsRef = useRef({ undo, redo, copyPrevious });
  actionsRef.current = { undo, redo, copyPrevious };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e)) return; // text fields keep their own undo
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) actionsRef.current.redo();
        else actionsRef.current.undo();
      } else if (mod && key === 'y') {
        e.preventDefault();
        actionsRef.current.redo();
      } else if (e.shiftKey && !mod && !e.altKey && key === 'v' && !e.repeat) {
        e.preventDefault();
        void actionsRef.current.copyPrevious();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <SaveIndicator />
      <div className="flex items-center">
        <IconAction label={undoLabel ? `Undo: ${undoLabel}` : 'Undo'} shortcut={`${MOD}+Z`} disabled={!canUndo} onClick={undo}>
          <Undo2 className="h-4 w-4" />
        </IconAction>
        <IconAction label={redoLabel ? `Redo: ${redoLabel}` : 'Redo'} shortcut={`${MOD}+Shift+Z`} disabled={!canRedo} onClick={redo}>
          <Redo2 className="h-4 w-4" />
        </IconAction>
        {loadPreviousBoxes && (
          <IconAction label="Copy annotations from previous image" shortcut="Shift+V" disabled={isCopying} onClick={() => void copyPrevious()}>
            {isCopying ? <Loader className="h-4 w-4 animate-spin" /> : <ClipboardCopy className="h-4 w-4" />}
          </IconAction>
        )}
      </div>
      {counts && counts.total > 0 && (
        <div className={cn('border-l border-border pl-3')}>
          <JobProgress counts={counts} />
        </div>
      )}
    </div>
  );
};

export default SessionBar;
