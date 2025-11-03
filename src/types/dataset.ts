export interface Annotation {
  id: string;
  annotation_uid: string;
  type: string | null;
  class_id: string;
  class_name: string;
  color: string;
  data: [number, number, number, number];
  source: string;
  confidence?: number | null;
  reviewed?: boolean;
  is_active: boolean;
  created_at?: string;
  created_by?: string;
}

export interface ProjectImage {
  id: string;
  image_id: string;
  name: string;
  original_filename: string;
  width: number;
  height: number;
  aspect_ratio: number;
  file_format: string;
  file_size: number;
  file_size_mb: number;
  megapixels: number;
  storage_key: string;
  checksum: string;
  source_of_origin: string;
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
  tags: string[];
  storage_profile: {
    id: string;
    name: string;
    backend: string;
  };
  download_url: string;
  status: 'annotated' | 'unannotated' | 'reviewed';
  annotated: boolean;
  reviewed: boolean;
  marked_as_null: boolean;
  priority: number;
  job_assignment_status: 'assigned' | 'waiting' | 'excluded' | null;
  added_at: string;
  annotations: Annotation[];
}

export interface ProjectImagesResponse {
  total: number;
  annotated: number;
  unannotated: number;
  reviewed: number;
  images: ProjectImage[];
}

export interface ProjectImagesParams {
  skip?: number;
  limit?: number;
  q?: string;
  status?: 'annotated' | 'unannotated' | 'reviewed';
  annotated?: boolean;
}

export interface ParsedProjectQuery {
  text: string;
  status?: 'annotated' | 'unannotated' | 'reviewed';
  annotated?: boolean;
  reviewed?: boolean;
  markedNull?: boolean;
  jobStatus?: 'assigned' | 'waiting' | 'excluded';
  tags: string[];
  filename?: string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minAnnotations?: number;
  maxAnnotations?: number;
  sort?: string;
}
