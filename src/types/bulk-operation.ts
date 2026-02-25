

export interface BulkReviewPayload {
  image_ids: number[];
  approved: boolean;
  feedback?: string;
}

export interface BulkReviewResponse {
  message: string;
  total_requested: number;
  processed: number;
  skipped: number;
  failed: number;
  final_status: string;
}

export interface BulkMarkNullPayload {
  image_ids: number[];
  is_null: boolean;
  reason?: string;
}

export interface BulkMarkNullResponse {
  message: string;
  total_requested: number;
  processed: number;
  skipped: number;
  failed: number;
  operation: string;
}

export interface BulkDeleteProjectImagesPayload {
  image_ids: number[];
  hard_delete: boolean;
}

export interface BulkDeleteProjectImagesResponse {
  message: string;
  total_requested: number;
  processed?: number;
  skipped?: number;
  deleted?: number;
  mode: "soft_delete" | "hard_delete";
}

export interface BulkTagImagesPayload {
  image_ids: string[];
  tag_names: string[];
}

export interface BulkTagImagesResponse {
  message: string;
  total_images: number;
  total_tags_requested: number;
  relations_created: number;
}

export interface BulkDeleteImagesPayload {
  image_ids: string[];
}

export interface BulkDeleteImagesResponse {
  message: string;
  total_requested: number;
  deleted_from_db: number;
  storage_deleted: number;
  storage_failed: number;
}