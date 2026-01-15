import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentOrganization } from './useAuthHelpers';
import { fetchProjectImageDetails } from './useProjectImage';

interface UseImagePreloadOptions {
  projectId: string;
  imageIds: string[];
  currentIndex: number;
  prefetchNext?: boolean;
  prefetchPrev?: boolean;
  prefetchCount?: number;
}

/**
 * Preloads adjacent images for instant navigation
 * - Prefetches React Query data (annotations, metadata)
 * - Preloads browser image cache (actual image file)
 */
export const useImagePreload = ({
  projectId,
  imageIds,
  currentIndex,
  prefetchNext = true,
  prefetchPrev = true,
  prefetchCount = 1,
}: UseImagePreloadOptions) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();

  useEffect(() => {
    if (!currentOrganization) return;
    if (!imageIds.length) return;

    const imagesToPreload: string[] = [];

    // Next images
    if (prefetchNext) {
      for (let i = 1; i <= prefetchCount; i++) {
        const nextIndex = currentIndex + i;
        if (nextIndex < imageIds.length) {
          imagesToPreload.push(imageIds[nextIndex]);
        }
      }
    }

    // Previous images
    if (prefetchPrev) {
      for (let i = 1; i <= prefetchCount; i++) {
        const prevIndex = currentIndex - i;
        if (prevIndex >= 0) {
          imagesToPreload.push(imageIds[prevIndex]);
        }
      }
    }

    // Prefetch image details (includes annotations from API response)
    imagesToPreload.forEach((imageId) => {
      queryClient.prefetchQuery({
        queryKey: ["projectImageDetails", currentOrganization.id, projectId, imageId],
        queryFn: () => fetchProjectImageDetails(currentOrganization.id, projectId, imageId),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    });

    // Preload actual image files in browser cache
    const preloadImages = async () => {
      for (const imageId of imagesToPreload) {
        const imageData = queryClient.getQueryData([
          "projectImageDetails",
          currentOrganization.id,
          projectId,
          imageId
        ]) as any;
        
        if (imageData?.image?.download_url) {
          const img = new Image();
          img.src = imageData.image.download_url;
          // Browser caches the image automatically
        }
      }
    };

    // Small delay to let current image settle
    const timeoutId = setTimeout(preloadImages, 100);
    
    return () => clearTimeout(timeoutId);
  }, [currentIndex, imageIds, projectId, currentOrganization, prefetchNext, prefetchPrev, prefetchCount, queryClient]);
};