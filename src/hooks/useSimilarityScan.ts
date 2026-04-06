import { useCallback, useRef, useEffect } from 'react';
import { useSimilarityStore } from '@/stores/similarityStore';
import * as api from '@/lib/similarity';
import type { ScanConfig, SimilarityCluster, SimilarityImage } from '@/types/similarity';

/**
 * Hook for the Datalake server-side similarity scan.
 * Handles starting scans, polling for progress, and fetching results.
 */
export function useSimilarityScan() {
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const store = useSimilarityStore();

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = undefined;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => stopPolling, [stopPolling]);

  const startScan = useCallback(async (config: ScanConfig) => {
    store.setScanConfig(config);
    store.setActiveScan({
      scan_id: '',
      status: 'queued',
      total_images: 0,
      images_processed: 0,
      clusters_found: 0,
      progress: 0,
      eta_seconds: 0,
    });

    try {
      const job = await api.startScan(config);
      store.setActiveScan(job);

      // --- Simulated progress for demo ---
      let progress = 0;
      let clustersFound = 0;
      const totalImages = 2000 + Math.floor(Math.random() * 3000);

      stopPolling();
      pollRef.current = setInterval(() => {
        progress += 3 + Math.random() * 8;
        if (progress > 85) progress += Math.random() * 2;
        clustersFound += Math.random() > 0.6 ? 1 : 0;

        if (progress >= 100) {
          progress = 100;
          stopPolling();

          // Generate mock results
          const mockClusters = generateMockClusters(8 + Math.floor(Math.random() * 20));
          const totalDupes = mockClusters.reduce((s, c) => s + c.images.length - 1, 0);

          store.setActiveScan({
            scan_id: job.scan_id,
            status: 'complete',
            total_images: totalImages,
            images_processed: totalImages,
            clusters_found: mockClusters.length,
            progress: 100,
            eta_seconds: 0,
          });
          store.setScanResults(mockClusters, mockClusters.length, totalDupes, 1);
          store.setResultsOpen(true);
        } else {
          store.setActiveScan({
            scan_id: job.scan_id,
            status: 'running',
            total_images: totalImages,
            images_processed: Math.floor((progress / 100) * totalImages),
            clusters_found: clustersFound,
            progress: Math.min(progress, 99),
            eta_seconds: Math.max(1, Math.floor((100 - progress) / 8)),
          });
        }
      }, 1500);
    } catch {
      store.setActiveScan(null);
    }
  }, [store, stopPolling]);

  const cancelScan = useCallback(() => {
    stopPolling();
    store.setActiveScan(null);
  }, [store, stopPolling]);

  const archiveDuplicates = useCallback(async (clusterId: string) => {
    await api.performClusterAction(clusterId, 'archive_duplicates');
    store.removeCluster(clusterId);
  }, [store]);

  const deleteDuplicates = useCallback(async (clusterId: string) => {
    await api.performClusterAction(clusterId, 'delete_duplicates');
    store.removeCluster(clusterId);
  }, [store]);

  const markReviewed = useCallback(async (clusterId: string) => {
    await api.performClusterAction(clusterId, 'mark_reviewed');
    store.markClusterReviewed(clusterId);
  }, [store]);

  const setRepresentative = useCallback(async (clusterId: string, imageId: string) => {
    await api.performClusterAction(clusterId, 'set_representative', { representative_id: imageId });
    store.setRepresentative(clusterId, imageId);
  }, [store]);

  const bulkAction = useCallback(async (action: 'archive_duplicates' | 'delete_duplicates' | 'mark_reviewed') => {
    const ids = Array.from(store.selectedClusterIds);
    await api.performBulkAction(ids, action);
    if (action === 'mark_reviewed') {
      ids.forEach((id) => store.markClusterReviewed(id));
    } else {
      ids.forEach((id) => store.removeCluster(id));
    }
    store.clearClusterSelection();
  }, [store]);

  return {
    scanConfig: store.scanConfig,
    activeScan: store.activeScan,
    scanResults: store.scanResults,
    scanFilters: store.scanFilters,
    scanTotalClusters: store.scanTotalClusters,
    scanTotalDuplicates: store.scanTotalDuplicates,
    selectedClusterIds: store.selectedClusterIds,
    reviewedClusterIds: store.reviewedClusterIds,
    resultsOpen: store.resultsOpen,
    startScan,
    cancelScan,
    archiveDuplicates,
    deleteDuplicates,
    markReviewed,
    setRepresentative,
    bulkAction,
    setScanFilter: store.setScanFilter,
    setScanSort: store.setScanSort,
    toggleClusterSelection: store.toggleClusterSelection,
    selectAllClusters: store.selectAllClusters,
    clearClusterSelection: store.clearClusterSelection,
    setResultsOpen: store.setResultsOpen,
    resetScan: store.resetScan,
  };
}

// --- Mock data generator ---
function generateMockClusters(count: number): SimilarityCluster[] {
  const clusters: SimilarityCluster[] = [];
  for (let i = 0; i < count; i++) {
    const imageCount = 2 + Math.floor(Math.random() * 5);
    const images: SimilarityImage[] = [];
    for (let j = 0; j < imageCount; j++) {
      images.push({
        id: `img-${i}-${j}`,
        filename: `IMG_${1000 + i * 10 + j}.jpg`,
        url: `https://picsum.photos/seed/${i * 10 + j}/800/600`,
        thumbnail_url: `https://picsum.photos/seed/${i * 10 + j}/180/140`,
        width: 800,
        height: 600,
        file_size: 500000 + Math.floor(Math.random() * 2000000),
        upload_date: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
        similarity_score: j === 0 ? 1.0 : 0.7 + Math.random() * 0.28,
        is_representative: j === 0,
        datasets: j % 3 === 0
          ? [{ id: 'd1', name: 'Training Set A' }, { id: 'd2', name: 'Validation Set' }]
          : [{ id: 'd1', name: 'Training Set A' }],
      });
    }
    clusters.push({
      id: `cluster-${i}`,
      images,
      avg_similarity: images.reduce((s, img) => s + img.similarity_score, 0) / images.length,
      status: 'unreviewed',
    });
  }
  return clusters;
}
