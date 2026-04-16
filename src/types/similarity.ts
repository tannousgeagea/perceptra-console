export type HashAlgorithm = 'ahash' | 'phash' | 'dhash' | 'whash';
export type ScanScope = 'datalake' | 'project';
export type ScanStatus = 'idle' | 'queued' | 'pending' | 'running' | 'complete' | 'completed' | 'failed' | 'cancelled';
export type ClusterAction = 'archive_duplicates' | 'delete_duplicates' | 'mark_reviewed' | 'set_representative' | 'remove_from_cluster';
export type ClusterStatus = "unreviewed" | "reviewed" | "actioned";
export type MemberRole = "representative" | "duplicate";

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
  scope: ScanScope;
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

export interface CreateScanPayload {
  scope: ScanScope;
  project_id?: string;
  algorithm: HashAlgorithm;
  similarity_threshold: number;   // 0.50–1.00
}
 
export interface CreateScanResponse extends ScanSummary {
  message: string;
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

export interface SimilarityStats {
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
    algorithm: HashAlgorithm;
    threshold: number;
  } | null;
}

// ============================================
// FILTER / QUERY PARAM TYPES
// ============================================

export interface ScanListFilters {
  status?: ScanStatus;
  scope?: ScanScope;
  project_id?: string;
  algorithm?: HashAlgorithm;
}
 
export interface ScanListPagination {
  skip?: number;
  limit?: number;
}

export interface ScanListParams {
  skip?: number;
  limit?: number;
  status?: ScanHistoryStatus;
  scope?: 'datalake' | 'project';
  project_id?: string;
  algorithm?: HashAlgorithm;
}

export interface ClusterResultsFilters {
  status?: ClusterStatus;
  sort?: "size_desc" | "size_asc" | "similarity_desc" | "date_asc";
  min_size?: number;
}
 
export interface ClusterResultsPagination {
  skip?: number;
  limit?: number;
}
 
export interface SimilarImagesParams {
  threshold?: number;   // 0.50–1.00, default 0.80
  algorithm?: HashAlgorithm;
  limit?: number;
}

// ============================================
// CLUSTER TYPES
// ============================================
 
export interface ImageStub {
  image_id: string;
  name: string;
  original_filename: string;
  file_format: string;
  file_size: number;
  file_size_mb: number;
  width: number;
  height: number;
  checksum: string;
  storage_key: string;
  download_url: string;
  created_at: string;
}
 
export interface ClusterMember {
  image: ImageStub;
  role: MemberRole;
  similarity_score: number;       // 0.0–1.0
}
 
export interface ClusterSummary {
  cluster_id: string;
  scan_id: string;
  member_count: number;
  avg_similarity: number;
  max_similarity: number;
  status: ClusterStatus;
  representative: ImageStub | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Only present when fetched with include_members=true
  members?: ClusterMember[];
}
 
export interface ClusterDetail extends ClusterSummary {
  members: ClusterMember[];
  action_history: ClusterActionRecord[];
}
 
export interface ClusterActionRecord {
  action_id: string;
  action_type: ClusterAction;
  performed_by: string | null;
  image_ids: string[];
  meta: Record<string, unknown>;
  performed_at: string;
}
 
export interface ClusterResultsResponse {
  scan_id: string;
  scan_status: ScanStatus;
  total_clusters: number;
  total_duplicates: number;
  page: number;
  page_size: number;
  clusters: ClusterSummary[];
}

// ============================================
// ACTION TYPES
// ============================================
 
export interface ClusterActionPayload {
  action: ClusterAction;
  image_ids?: string[];
  new_representative_id?: string;
}
 
export interface ClusterActionResponse {
  message: string;
  cluster_id: string;
  action: ClusterAction;
  // Action-specific fields
  archived?: number;
  deleted_from_db?: number;
  storage_deleted?: number;
  storage_failed?: number;
  removed?: number;
  affected_image_ids?: string[];
  new_representative_id?: string;
  status?: ClusterStatus;
}
 
export interface BulkClusterActionPayload {
  cluster_ids: string[];
  action: "archive_duplicates" | "delete_duplicates" | "mark_reviewed";
}
 
export interface BulkClusterActionDetail {
  cluster_id: string;
  status: "ok" | "error";
  error?: string;
  [key: string]: unknown;
}
 
export interface BulkClusterActionResponse {
  message: string;
  action: ClusterAction;
  total: number;
  successful: number;
  failed: number;
  details: BulkClusterActionDetail[];
}
 

// ============================================
// SIMILAR IMAGES (per-image endpoint)
// ============================================
 
export interface SimilarImage extends ImageStub {
  similarity_score: number;
}
 
export interface SimilarImagesResponse {
  image_id: string;
  algorithm: HashAlgorithm;
  threshold: number;
  total_found: number;
  similar_images: SimilarImage[];
}