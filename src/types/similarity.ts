export type HashAlgorithm = 'ahash' | 'phash' | 'dhash' | 'whash';
export type ScanScope = 'datalake' | 'project';
export type ScanStatus = 'idle' | 'queued' | 'pending' | 'running' | 'complete' | 'completed' | 'failed' | 'cancelled';
export type ClusterAction = 'archive_duplicates' | 'delete_duplicates' | 'mark_reviewed' | 'set_representative' | 'remove_from_cluster';

export interface SimilarityImage {
  id: string;
  filename: string;
  url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  file_size: number;
  upload_date: string;
  uploader?: string;
  similarity_score: number;
  is_representative: boolean;
  datasets: { id: string; name: string }[];
  hash?: string;
}

export interface SimilarityCluster {
  id: string;
  images: SimilarityImage[];
  avg_similarity: number;
  status: 'unreviewed' | 'reviewed' | 'actioned';
}

export interface ScanJob {
  scan_id: string;
  status: ScanStatus;
  total_images: number;
  images_processed: number;
  clusters_found: number;
  progress: number;
  eta_seconds: number;
}

export interface ScanConfig {
  scope: ScanScope;
  dataset_id?: string;
  threshold: number;
  algorithm: HashAlgorithm;
}

export type ScanFilter = 'all' | 'large' | 'reviewed' | 'actioned';
export type ScanSort = 'size_desc' | 'similarity_desc' | 'date_added';

export interface ScanFilters {
  filter: ScanFilter;
  sort: ScanSort;
  page: number;
  per_page: number;
}

export interface ThresholdPreset {
  label: string;
  value: number;
}

export const THRESHOLD_PRESETS: ThresholdPreset[] = [
  { label: 'Strict', value: 0.9 },
  { label: 'Balanced', value: 0.8 },
  { label: 'Loose', value: 0.7 },
];

export const HASH_ALGORITHMS: { value: HashAlgorithm; label: string; description: string }[] = [
  { value: 'ahash', label: 'Average Hash (ahash)', description: 'Fast, good for general duplicates' },
  { value: 'phash', label: 'Perceptual Hash (phash)', description: 'Slower but more accurate for edited images' },
  { value: 'dhash', label: 'Difference Hash (dhash)', description: 'Good tolerance for crops and rotations' },
  { value: 'whash', label: 'Wavelet Hash (whash)', description: 'High accuracy, handles compression well' },
];

// --- Scan History types ---

export type ScanHistoryStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ScanSummary {
  scan_id: string;
  scope: 'datalake' | 'project';
  project_id: string | null;
  algorithm: HashAlgorithm;
  similarity_threshold: number;
  hamming_threshold: number;
  status: ScanHistoryStatus;
  progress: number;
  total_images: number;
  hashed_images: number;
  clusters_found: number;
  eta_seconds: number | null;
  initiated_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  error_log: string | null;
}

export interface ScanListResponse {
  total: number;
  page: number;
  page_size: number;
  scans: ScanSummary[];
}

export interface ScanStats {
  scans: {
    total: number;
    completed: number;
    running: number;
  };
  clusters: {
    total: number;
    unreviewed: number;
    reviewed: number;
    actioned: number;
    avg_cluster_size: number;
  };
  total_duplicates: number;
  latest_scan: {
    scan_id: string;
    completed_at: string;
    algorithm: string;
    threshold: number;
  } | null;
}

export interface ScanListParams {
  skip?: number;
  limit?: number;
  status?: ScanHistoryStatus;
  scope?: 'datalake' | 'project';
  project_id?: string;
  algorithm?: HashAlgorithm;
}
