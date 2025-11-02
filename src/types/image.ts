  
export interface ImageCardGridProps {
    images: ImageData[];
    onImageClick?: (index: number) => void;
    className?: string;
    columnCount?: {
      sm: number; // Small screens (mobile)
      md: number; // Medium screens (tablet)
      lg: number; // Large screens (desktop)
    };
  }

export type ViewMode = 'grid' | 'table';

export interface ParsedQuery {
  text: string;
  tags: string[];
  classes?: string[];
  split?: 'train' | 'val' | 'test';
  minHeight?: number;
  maxHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  backend?: string;
  filename?: string;
  sort?: string;
  minAnnotations?: number;
  maxAnnotations?: number;
  job?: string;
  likeImage?: string;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  results: T[];
}

export interface ImageRecord {
  id: string;
  image_id: string;
  name: string;
  original_filename: string;
  file_format: string;
  file_size: number;
  file_size_mb: number;
  width: number;
  height: number;
  aspect_ratio: number;
  megapixels: number;
  storage_profile: {
    id: string;
    name: string;
    backend: string;
  };
  storage_key: string;
  checksum: string;
  source_of_origin: string;
  tags: string[];
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  download_url: string;
}

export interface ImagesResponse {
  total: number;
  page: number;
  page_size: number;
  images: ImageRecord[];
}

export interface ImagesParams extends PaginationParams {
  from_date?: string;
  to_date?: string;
  project_id?: string;
  q?: string;
  tag?: string;
  search?: string;
}


export interface Annotation {
  id: string;
  annotation_uid: string;
  type: string | null;
  class_id: string;
  class_name: string;
  color: string;
  data: [number, number, number, number]; 
  source: string;
  confidence?: number;
  reviewed?: boolean;
  is_active: boolean;
  create_at?: string;
  created_by?: string;
}

export interface JobImage {
  id: string;
  image_id: string;
  name: string;
  width: number;
  height: number;
  storage_key: string;
  download_url: string;
  status: string;
  annotated: boolean;
  reviewed: boolean;
  priority: number;
  added_at: string;
  annotations: Annotation[];
}

export interface JobInfo {
  id: string;
  name: string;
  status: string;
  assignee: string | null;
}

export interface JobImagesResponse {
  total: number;
  unannotated: number;
  reviewed: number;
  annotated: number;
  job: JobInfo;
  images: JobImage[];
}

export interface ProjectImageResponse {
  total: number;
  images: JobImage[];
}

export interface ProjectImageOut {
  id: string;
  image: ImageRecord;
  status?: string;
  annotated: boolean;
  reviewed: boolean;
  finalized: boolean;
  marked_as_null: boolean;
  priority?: number;
  job_assignment_status?: string;
  mode?: {
    id: string;
    mode: string;
  } | null;
  metadata?: Record<string, any>;
  added_by?: string;
  reviewed_by?: string;
  added_at: string;
  reviewed_at?: string;
  updated_at: string;
  jobs: JobImage[];
  annotations: Annotation[];
}


export  type ImageSize = 'sm' | 'md' | 'lg' 

export interface ImageCardProps {
    image: JobImage;
    index: number;
    onClick?: (index: number) => void;
    className?: string;
    highlightColor?: string; // Allow customization of highlight color
    size?: ImageSize; // Different size options
  }