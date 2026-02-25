import { useState, useCallback, useRef } from 'react';
import {
  BulkReviewPayload,
  BulkReviewResponse,
  BulkDeleteProjectImagesPayload,
  BulkDeleteProjectImagesResponse,
  BulkTagImagesPayload,
  BulkTagImagesResponse,
  BulkDeleteImagesPayload,
  BulkDeleteImagesResponse,
} from '@/types/bulk-operation';

import { 
  bulkReviewProjectImages,
  bulkAddTagsToImages,
  bulkDeleteImages,
  bulkDeleteProjectImages,
  bulkMarkImagesAsNull 
} from '@/hooks/useProjectImageBulkOperation';

import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { number } from 'zod';

export type BulkOpStatus = 'idle' | 'running' | 'done' | 'failed' | 'cancelled';
export type BulkOpType = 'review' | 'delete' | 'tag' | 'mark_null';
export interface BulkOperationState {
  type: BulkOpType;
  total: number;
  processed: number;
  failed: number;
  status: BulkOpStatus;
}

// Simulates progress animation while waiting for a real API call
function useSimulatedProgress() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);
  const startSimulation = useCallback(
    (
      total: number,
      type: BulkOpType,
      setState: React.Dispatch<React.SetStateAction<BulkOperationState | null>>
    ) => {
      cancelledRef.current = false;
      setState({ type, total, processed: 0, failed: 0, status: 'running' });
      // Animate progress: fast at first, slowing down as it approaches ~90%
      let simulated = 0;
      intervalRef.current = setInterval(() => {
        if (cancelledRef.current) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        const remaining = total - simulated;
        const increment = Math.max(1, Math.floor(remaining * (0.05 + Math.random() * 0.1)));
        simulated = Math.min(simulated + increment, Math.floor(total * 0.92));
        setState((prev) =>
          prev ? { ...prev, processed: simulated } : null
        );
      }, 150 + Math.random() * 200);
    },
    []
  );
  const finishSimulation = useCallback(
    (
      result: { processed: number; failed: number; total: number },
      setState: React.Dispatch<React.SetStateAction<BulkOperationState | null>>
    ) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setState((prev) =>
        prev
          ? {
              ...prev,
              processed: result.total,
              failed: result.failed,
              status: 'done',
            }
          : null
      );
    },
    []
  );
  const failSimulation = useCallback(
    (
      errorMsg: string,
      setState: React.Dispatch<React.SetStateAction<BulkOperationState | null>>
    ) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setState((prev) =>
        prev ? { ...prev, status: 'failed' } : null
      );
    },
    []
  );
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);
  return { startSimulation, finishSimulation, failSimulation, cancel };
}


// Mock API helpers — simulate a backend call with a delay
async function mockBulkReview(payload: BulkReviewPayload): Promise<BulkReviewResponse> {
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
  return {
    message: `${payload.image_ids.length} images reviewed`,
    total_requested: payload.image_ids.length,
    processed: payload.image_ids.length,
    skipped: 0,
    failed: 0,
    final_status: 'reviewed',
  };
}
async function mockBulkDeleteProject(payload: BulkDeleteProjectImagesPayload): Promise<BulkDeleteProjectImagesResponse> {
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
  return {
    message: `${payload.image_ids.length} images deleted`,
    total_requested: payload.image_ids.length,
    processed: payload.image_ids.length,
    deleted: payload.image_ids.length,
    mode: payload.hard_delete ? 'hard_delete' : 'soft_delete',
  };
}
async function mockBulkTag(payload: BulkTagImagesPayload): Promise<BulkTagImagesResponse> {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
  return {
    message: `Tags applied to ${payload.image_ids.length} images`,
    total_images: payload.image_ids.length,
    total_tags_requested: payload.tag_names.length,
    relations_created: payload.image_ids.length * payload.tag_names.length,
  };
}
async function mockBulkDeleteImages(payload: BulkDeleteImagesPayload): Promise<BulkDeleteImagesResponse> {
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
  return {
    message: `${payload.image_ids.length} images deleted`,
    total_requested: payload.image_ids.length,
    deleted_from_db: payload.image_ids.length,
    storage_deleted: payload.image_ids.length,
    storage_failed: 0,
  };
}
/**
 * Unified hook for bulk operations with simulated progress.
 * Fires a single API call to the backend, while animating progress on the frontend.
 */
export function useBulkOperations(projectId?: string) {
  const [operation, setOperation] = useState<BulkOperationState | null>(null);
  const { currentOrganization } = useCurrentOrganization();
  const {
    startSimulation,
    finishSimulation,
    failSimulation,
    cancel,
  } = useSimulatedProgress();

  // =========================
  // BULK REVIEW
  // =========================
  const runBulkReview = useCallback(
    async (imageIds: string[], approved = true) => {
      if (!currentOrganization)
        throw new Error("No organization selected");
      if (!projectId)
        throw new Error("No project selected");

      const total = imageIds.length;
      startSimulation(total, "review", setOperation);

      try {
        const result: BulkReviewResponse =
          await bulkReviewProjectImages(
            currentOrganization.id,
            projectId,
            {
              image_ids: imageIds.map(Number),
              approved,
            }
          );

        finishSimulation(
          {
            processed: result.processed,
            failed: result.failed,
            total: result.total_requested,
          },
          setOperation
        );

        return result;
      } catch (e) {
        failSimulation(
          e instanceof Error ? e.message : "Failed",
          setOperation
        );
        throw e;
      }
    },
    [
      currentOrganization,
      projectId,
      startSimulation,
      finishSimulation,
      failSimulation,
    ]
  );

  // =========================
  // BULK DELETE (PROJECT IMAGE)
  // =========================
  const runBulkDeleteProject = useCallback(
    async (imageIds: string[], hardDelete = false) => {
      if (!currentOrganization)
        throw new Error("No organization selected");
      if (!projectId)
        throw new Error("No project selected");

      const total = imageIds.length;
      startSimulation(total, "delete", setOperation);

      try {
        const result: BulkDeleteProjectImagesResponse =
          await bulkDeleteProjectImages(
            currentOrganization.id,
            projectId,
            {
              image_ids: imageIds.map(Number),
              hard_delete: hardDelete,
            }
          );

        finishSimulation(
          {
            processed:
              result.processed ??
              result.deleted ??
              total,
            failed: 0,
            total: result.total_requested,
          },
          setOperation
        );

        return result;
      } catch (e) {
        failSimulation(
          e instanceof Error ? e.message : "Failed",
          setOperation
        );
        throw e;
      }
    },
    [
      currentOrganization,
      projectId,
      startSimulation,
      finishSimulation,
      failSimulation,
    ]
  );

  // =========================
  // BULK TAG
  // =========================
  const runBulkTag = useCallback(
    async (imageIds: string[], tags: string[]) => {
      if (!currentOrganization)
        throw new Error("No organization selected");

      const total = imageIds.length;
      startSimulation(total, "tag", setOperation);

      try {
        const result: BulkTagImagesResponse =
          await bulkAddTagsToImages(
            currentOrganization.id,
            {
              image_ids: imageIds,
              tag_names: tags,
            }
          );

        finishSimulation(
          {
            processed: result.total_images,
            failed: 0,
            total: result.total_images,
          },
          setOperation
        );

        return result;
      } catch (e) {
        failSimulation(
          e instanceof Error ? e.message : "Failed",
          setOperation
        );
        throw e;
      }
    },
    [
      currentOrganization,
      startSimulation,
      finishSimulation,
      failSimulation,
    ]
  );

  // =========================
  // BULK DELETE IMAGES (STORAGE)
  // =========================
  const runBulkDeleteImages = useCallback(
    async (imageIds: string[]) => {
      if (!currentOrganization)
        throw new Error("No organization selected");

      const total = imageIds.length;
      startSimulation(total, "delete", setOperation);

      try {
        const result: BulkDeleteImagesResponse =
          await bulkDeleteImages(
            currentOrganization.id,
            {
              image_ids: imageIds,
            }
          );

        finishSimulation(
          {
            processed: result.deleted_from_db,
            failed: result.storage_failed,
            total: result.total_requested,
          },
          setOperation
        );

        return result;
      } catch (e) {
        failSimulation(
          e instanceof Error ? e.message : "Failed",
          setOperation
        );
        throw e;
      }
    },
    [
      currentOrganization,
      startSimulation,
      finishSimulation,
      failSimulation,
    ]
  );

  const cancelOperation = useCallback(() => {
    cancel();
    setOperation((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
  }, [cancel]);

  const clearOperation = useCallback(() => {
    setOperation(null);
  }, []);
  
  return {
    operation,
    runBulkReview,
    runBulkDeleteProject,
    runBulkTag,
    runBulkDeleteImages,
    cancelOperation,
    clearOperation,
  };
}