import { SplitType } from "./split";

/**
 * Query parameters for listing versions
 */
export interface ListVersionsParams {
  skip?: number;
  limit?: number;
  export_status?: string;
}

export interface VersionCreate {
  version_name: string;
  description?: string;
  export_format: 'yolo' | 'coco' | 'pascal_voc' | 'tfrecord' | 'custom';
  export_config?: Record<string, any>;
}

export interface VersionUpdate {
  version_name?: string;
  description?: string;
  export_config?: Record<string, any>;
}

export interface VersionImageAdd {
  project_image_ids: number[];
  split: SplitType;
}

export interface DatasetVersion {
  id: string;
  version_id: string;
  version_name: string;
  version_number: number;
  description: string | null;
  export_format: string;
  export_status: 'pending' | 'processing' | 'completed' | 'failed';
  total_images: number;
  total_annotations: number;
  train_count: number;
  val_count: number;
  test_count: number;
  file_size: number | null;
  is_ready: boolean;
  created_at: string;
  exported_at: string | null;
  created_by: string | null;
}

/**
 * Version image response type
 */
export interface VersionImage {
  id: string;
  project_image_id: string;
  image_id: string;
  name: string;
  split: SplitType;
  annotation_count: number;
  added_at: string;
  download_url: string;
}

/**
 * List version images response type
 */
export interface ListVersionImagesResponse {
  total: number;
  images: VersionImage[];
}

/**
 * Add images to version response type
 */
export interface AddVersionImagesResponse {
  message: string;
  added_count: number;
  split: string;
}

export interface VersionStatistics {
  total_images: number;
  total_annotations: number;
  splits: {
    train: number;
    val: number;
    test: number;
  };
  class_distribution: Record<string, number>;
  average_annotations_per_image: number;
}

export interface DatasetVersionsResponse {
  total: number;
  versions: DatasetVersion[];
}

/**
 * Query parameters for listing version images
 */
export interface ListVersionImagesParams {
  skip?: number;
  limit?: number;
  split?: SplitType;
  q?: string;
}
