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
  // The counts above (total_images … test_count) describe the last export
  // file; these describe the version itself.
  images_in_version?: number | null;
  /** Augmented copies in the export: in total_images, in no split. */
  augmented_images?: number;
  /** Images the export leaves out: no labels at all. */
  not_exported_no_labels?: number;
  /** Images the export leaves out: only model predictions (include_predictions off). */
  not_exported_predictions_only?: number;
  /** Images were added or removed after the last export. */
  changed_since_export?: boolean;
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

export interface AugmentationConfig {
  horizontal_flip: boolean;
  vertical_flip: boolean;
  rotation_limit: number;
  brightness_contrast: boolean;
  blur: boolean;
  noise: boolean;
}

export interface ExportConfig {
  export_format: 'yolo' | 'coco' | 'pascal_voc' | 'tfrecord' | 'custom';
  image_size?: number;
  image_quality: number;
  normalize: boolean;
  include_difficult: boolean;
  include_predictions: boolean;
  min_annotation_area: number;
  augment: boolean;
  augmentation_factor: number;
  augmentation_config: AugmentationConfig;
}

export interface DownloadDatasetResponse {
  download_url: string;
  file_size: number;
  format: string;
}


export interface ExportDatasetResponse {
  message: string;
  version_id: string;
  status: string;
  config: ExportConfig;
  estimated_time: string;
}