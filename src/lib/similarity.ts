import type {
  ScanConfig, ScanJob, SimilarityCluster, ScanFilters, ClusterAction,
  ScanListParams, ScanListResponse, ScanStats, ScanSummary,
} from '@/types/similarity';

const API_BASE = '/api/v1/similarity';

// --- Existing endpoints ---

export async function startScan(config: ScanConfig): Promise<ScanJob> {
  return {
    scan_id: `scan-${Date.now()}`,
    status: 'queued',
    total_images: 0,
    images_processed: 0,
    clusters_found: 0,
    progress: 0,
    eta_seconds: 0,
  };
}

export async function getScanStatus(scanId: string): Promise<ScanJob> {
  void scanId;
  return { scan_id: scanId, status: 'running', total_images: 0, images_processed: 0, clusters_found: 0, progress: 0, eta_seconds: 0 };
}

export async function getScanResults(
  scanId: string,
  filters: ScanFilters
): Promise<{ clusters: SimilarityCluster[]; total_clusters: number; total_duplicates: number; total_pages: number }> {
  void scanId;
  void filters;
  return { clusters: [], total_clusters: 0, total_duplicates: 0, total_pages: 0 };
}

export async function performClusterAction(
  clusterId: string,
  action: ClusterAction,
  payload?: { image_ids?: string[]; representative_id?: string }
): Promise<void> {
  void clusterId;
  void action;
  void payload;
}

export async function performBulkAction(
  clusterIds: string[],
  action: ClusterAction
): Promise<void> {
  void clusterIds;
  void action;
}

// --- Mock data for visualization ---

const MOCK_SCANS: ScanSummary[] = [
  {
    scan_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    scope: 'datalake',
    project_id: null,
    algorithm: 'phash',
    similarity_threshold: 0.8,
    hamming_threshold: 13,
    status: 'completed',
    progress: 100,
    total_images: 4218,
    hashed_images: 4218,
    clusters_found: 28,
    eta_seconds: null,
    initiated_by: 'tannous',
    started_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    completed_at: new Date(Date.now() - 3 * 3600_000 + 192_000).toISOString(),
    created_at: new Date(Date.now() - 3 * 3600_000 - 10_000).toISOString(),
    error_log: null,
  },
  {
    scan_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    scope: 'project',
    project_id: 'proj-waste-site-a',
    algorithm: 'ahash',
    similarity_threshold: 0.9,
    hamming_threshold: 6,
    status: 'running',
    progress: 63,
    total_images: 1520,
    hashed_images: 957,
    clusters_found: 12,
    eta_seconds: 8,
    initiated_by: 'sarah',
    started_at: new Date(Date.now() - 45_000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 60_000).toISOString(),
    error_log: null,
  },
  {
    scan_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    scope: 'datalake',
    project_id: null,
    algorithm: 'dhash',
    similarity_threshold: 0.7,
    hamming_threshold: 19,
    status: 'failed',
    progress: 41,
    total_images: 8300,
    hashed_images: 3403,
    clusters_found: 5,
    eta_seconds: null,
    initiated_by: 'alex',
    started_at: new Date(Date.now() - 24 * 3600_000).toISOString(),
    completed_at: new Date(Date.now() - 24 * 3600_000 + 120_000).toISOString(),
    created_at: new Date(Date.now() - 24 * 3600_000 - 5_000).toISOString(),
    error_log: 'Traceback (most recent call last):\n  File "worker.py", line 42, in process_scan\n    raise MemoryError("Insufficient memory to hash batch of 500 images")\nMemoryError: Insufficient memory to hash batch of 500 images',
  },
  {
    scan_id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    scope: 'project',
    project_id: 'proj-solar-panels',
    algorithm: 'whash',
    similarity_threshold: 0.85,
    hamming_threshold: 10,
    status: 'completed',
    progress: 100,
    total_images: 920,
    hashed_images: 920,
    clusters_found: 3,
    eta_seconds: null,
    initiated_by: 'tannous',
    started_at: new Date(Date.now() - 48 * 3600_000).toISOString(),
    completed_at: new Date(Date.now() - 48 * 3600_000 + 55_000).toISOString(),
    created_at: new Date(Date.now() - 48 * 3600_000 - 8_000).toISOString(),
    error_log: null,
  },
  {
    scan_id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    scope: 'datalake',
    project_id: null,
    algorithm: 'phash',
    similarity_threshold: 0.8,
    hamming_threshold: 13,
    status: 'cancelled',
    progress: 22,
    total_images: 6000,
    hashed_images: 1320,
    clusters_found: 7,
    eta_seconds: null,
    initiated_by: 'sarah',
    started_at: new Date(Date.now() - 72 * 3600_000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 72 * 3600_000 - 3_000).toISOString(),
    error_log: null,
  },
  {
    scan_id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
    scope: 'datalake',
    project_id: null,
    algorithm: 'ahash',
    similarity_threshold: 0.9,
    hamming_threshold: 6,
    status: 'pending',
    progress: 0,
    total_images: 2100,
    hashed_images: 0,
    clusters_found: 0,
    eta_seconds: null,
    initiated_by: 'alex',
    started_at: null,
    completed_at: null,
    created_at: new Date(Date.now() - 30_000).toISOString(),
    error_log: null,
  },
];

// --- Scan History endpoints (mock) ---

export async function fetchScans(params: ScanListParams = {}): Promise<ScanListResponse> {
  await new Promise((r) => setTimeout(r, 300));
  let filtered = [...MOCK_SCANS];
  if (params.status) filtered = filtered.filter((s) => s.status === params.status);
  if (params.scope) filtered = filtered.filter((s) => s.scope === params.scope);
  if (params.algorithm) filtered = filtered.filter((s) => s.algorithm === params.algorithm);
  const skip = params.skip ?? 0;
  const limit = params.limit ?? 20;
  return {
    total: filtered.length,
    page: Math.floor(skip / limit) + 1,
    page_size: limit,
    scans: filtered.slice(skip, skip + limit),
  };
}

export async function fetchScan(scanId: string): Promise<ScanSummary> {
  await new Promise((r) => setTimeout(r, 200));
  const scan = MOCK_SCANS.find((s) => s.scan_id === scanId);
  if (!scan) throw new Error('Scan not found');
  return { ...scan };
}

export async function fetchScanStats(): Promise<ScanStats> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    scans: { total: 6, completed: 2, running: 1 },
    clusters: { total: 55, unreviewed: 38, reviewed: 12, actioned: 5, avg_cluster_size: 3.4 },
    total_duplicates: 94,
    latest_scan: {
      scan_id: MOCK_SCANS[0].scan_id,
      completed_at: MOCK_SCANS[0].completed_at!,
      algorithm: MOCK_SCANS[0].algorithm,
      threshold: MOCK_SCANS[0].similarity_threshold,
    },
  };
}

export async function cancelScan(scanId: string): Promise<ScanSummary> {
  await new Promise((r) => setTimeout(r, 300));
  const scan = MOCK_SCANS.find((s) => s.scan_id === scanId);
  if (!scan) throw new Error('Scan not found');
  return { ...scan, status: 'cancelled' };
}
