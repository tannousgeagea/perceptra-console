
export interface AnnotationData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

export interface Annotation {
  id: string;
  annotation_uid: string;
  type: string;
  class_id: number;
  class_name: string;
  color: string;
  data: AnnotationData;
  source?: string;
  confidence?: number;
  reviewed: boolean;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

export interface AnnotationsListResponse {
  count: number;
  annotations: Annotation[];
}

export interface ListAnnotationsParams {
  include_inactive?: boolean;
}