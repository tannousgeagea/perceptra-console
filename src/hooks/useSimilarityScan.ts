import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSimilarityStore } from '@/stores/similarityStore';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import {
  createScan,
  getScan,
  getScanResults,
  performClusterAction,
  performBulkClusterAction,
  cancelScan as cancelScanApi,
  similarityKeys,
} from '@/hooks/useSimilarity';
import type {
  ScanConfig,
  ScanJob,
  SimilarityCluster,
  SimilarityImage,
  ScanSummary,
  ClusterSummary,
  ClusterMember,
} from '@/types/similarity';

// ============================================================
// Adapters — map real API shapes → legacy component shapes
// ============================================================

function adaptScanToJob(scan: ScanSummary): ScanJob {
  return {
    scan_id: scan.scan_id,
    status: scan.status,
    total_images: scan.total_images,
    images_processed: scan.hashed_images,
    clusters_found: scan.clusters_found,
    progress: scan.progress,
    eta_seconds: scan.eta_seconds ?? 0,
  };
}

function adaptMember(member: ClusterMember): SimilarityImage {
  return {
    id: member.image.image_id,
    filename: member.image.original_filename || member.image.name,
    url: member.image.download_url ?? '',
    thumbnail_url: member.image.download_url ?? '',
    width: member.image.width,
    height: member.image.height,
    file_size: member.image.file_size,
    upload_date: member.image.created_at,
    similarity_score: member.similarity_score,
    is_representative: member.role === 'representative',
    datasets: [],
  };
}

function adaptCluster(cluster: ClusterSummary): SimilarityCluster {
  return {
    id: cluster.cluster_id,
    images: (cluster.members ?? []).map(adaptMember),
    avg_similarity: cluster.avg_similarity,
    status: cluster.status,
  };
}

// ============================================================
// Hook
// ============================================================

/**
 * Orchestrates the DataLake server-side similarity scan workflow.
 * Uses real API endpoints; adapts responses to the legacy SimilarityCluster
 * shape so DataLake UI components require no changes.
 */
export function useSimilarityScan() {
  const store = useSimilarityStore();
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const orgId = currentOrganization?.id ?? '';

  // Active scan ID tracked locally — drives the polling loop
  const [scanId, setScanId] = useState<string | null>(null);

  // -------------------------------------------------------
  // Live polling — 2s interval while scan is active
  // -------------------------------------------------------
  useEffect(() => {
    if (!scanId || !orgId) return;

    let stopped = false;

    const poll = async () => {
      try {
        const scan = await getScan(orgId, scanId);
        if (stopped) return;

        store.setActiveScan(adaptScanToJob(scan));

        if (scan.status === 'completed') {
          // Fetch full results including member images
          const results = await getScanResults(orgId, scanId, {}, {}, true);
          if (stopped) return;
          const clusters = results.clusters.map(adaptCluster);
          store.setScanResults(
            clusters,
            results.total_clusters,
            results.total_duplicates,
            1
          );
          store.setResultsOpen(true);
          // Invalidate the shared similarity query cache
          queryClient.invalidateQueries({ queryKey: similarityKeys.all(orgId) });
        } else if (scan.status === 'failed' || scan.status === 'cancelled') {
          // Terminal failure — nothing more to fetch
          queryClient.invalidateQueries({ queryKey: similarityKeys.all(orgId) });
        } else {
          // Still running — schedule next poll
          setTimeout(poll, 2000);
        }
      } catch {
        if (!stopped) {
          store.setActiveScan(null);
        }
      }
    };

    poll();

    return () => {
      stopped = true;
    };
  }, [scanId, orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------
  // Actions
  // -------------------------------------------------------

  const startScan = useCallback(
    async (config: ScanConfig) => {
      if (!orgId) return;

      // Optimistic pending state
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
        const result = await createScan(orgId, {
          scope: config.scope,
          algorithm: config.algorithm,
          similarity_threshold: config.threshold,
          project_id: config.dataset_id,
        });

        store.setActiveScan(adaptScanToJob(result));
        setScanId(result.scan_id);
      } catch {
        store.setActiveScan(null);
      }
    },
    [orgId, store]
  );

  const cancelScan = useCallback(async () => {
    if (scanId && orgId) {
      try {
        await cancelScanApi(orgId, scanId);
      } catch {
        // Best-effort cancel
      }
    }
    setScanId(null);
    store.setActiveScan(null);
  }, [orgId, scanId, store]);

  const archiveDuplicates = useCallback(
    async (clusterId: string) => {
      if (!orgId) return;
      await performClusterAction(orgId, clusterId, { action: 'archive_duplicates' });
      store.removeCluster(clusterId);
    },
    [orgId, store]
  );

  const deleteDuplicates = useCallback(
    async (clusterId: string) => {
      if (!orgId) return;
      await performClusterAction(orgId, clusterId, { action: 'delete_duplicates' });
      store.removeCluster(clusterId);
    },
    [orgId, store]
  );

  const markReviewed = useCallback(
    async (clusterId: string) => {
      if (!orgId) return;
      await performClusterAction(orgId, clusterId, { action: 'mark_reviewed' });
      store.markClusterReviewed(clusterId);
    },
    [orgId, store]
  );

  const setRepresentative = useCallback(
    async (clusterId: string, imageId: string) => {
      if (!orgId) return;
      await performClusterAction(orgId, clusterId, {
        action: 'set_representative',
        new_representative_id: imageId,
      });
      store.setRepresentative(clusterId, imageId);
    },
    [orgId, store]
  );

  const bulkAction = useCallback(
    async (action: 'archive_duplicates' | 'delete_duplicates' | 'mark_reviewed') => {
      if (!orgId) return;
      const ids = Array.from(store.selectedClusterIds);
      if (ids.length === 0) return;

      await performBulkClusterAction(orgId, { cluster_ids: ids, action });

      if (action === 'mark_reviewed') {
        ids.forEach((id) => store.markClusterReviewed(id));
      } else {
        ids.forEach((id) => store.removeCluster(id));
      }
      store.clearClusterSelection();
    },
    [orgId, store]
  );

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
