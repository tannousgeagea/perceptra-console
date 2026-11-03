import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentOrganization } from './useAuthHelpers';
import { fetchProjectImageDetails } from './useProjectImage';
import type { ProjectImageOut } from '@/types/image';

interface UseImagePreloadOptions {
  projectId: string;
  imageIds: string[];
  currentIndex: number;
  /** How many images to warm ahead of / behind the current one. */
  ahead?: number;
  behind?: number;
}

/** Decoded image files, kept so the browser doesn't drop them before they are shown. */
const decoded = new Map<string, HTMLImageElement>();
const MAX_DECODED = 12;

const warmImageFile = (url: string) => {
  if (decoded.has(url)) return;
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  // decode() downloads *and* decodes off the main thread, so the swap is instant.
  img.decode?.().catch(() => decoded.delete(url));
  decoded.set(url, img);
  while (decoded.size > MAX_DECODED) {
    decoded.delete(decoded.keys().next().value as string);
  }
};

/**
 * Warms neighbouring images for instant navigation: their details
 * (annotations, metadata) in the query cache, and their image files decoded.
 * Nearest images go first.
 */
export const useImagePreload = ({
  projectId,
  imageIds,
  currentIndex,
  ahead = 3,
  behind = 1,
}: UseImagePreloadOptions) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const orgId = currentOrganization?.id;

  useEffect(() => {
    if (!orgId || !imageIds.length || currentIndex < 0) return;

    const order: string[] = [];
    for (let i = 1; i <= Math.max(ahead, behind); i++) {
      if (i <= ahead && imageIds[currentIndex + i]) order.push(imageIds[currentIndex + i]);
      if (i <= behind && imageIds[currentIndex - i]) order.push(imageIds[currentIndex - i]);
    }

    let cancelled = false;
    // Let the current image settle before competing for bandwidth.
    const timeoutId = setTimeout(async () => {
      for (const imageId of order) {
        if (cancelled) return;
        const queryKey = ['projectImageDetails', orgId, projectId, imageId];
        try {
          await queryClient.prefetchQuery({
            queryKey,
            queryFn: () => fetchProjectImageDetails(orgId, projectId, imageId),
            staleTime: 60_000,
          });
        } catch {
          continue; // prefetching is best-effort
        }
        const details = queryClient.getQueryData<ProjectImageOut>(queryKey);
        if (!cancelled && details?.image?.download_url) warmImageFile(details.image.download_url);
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [currentIndex, imageIds, projectId, orgId, ahead, behind, queryClient]);
};
