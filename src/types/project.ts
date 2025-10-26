

// Types
export interface AnnotationClass {
  class_id: number;
  name: string;
  color?: string;
  description?: string;
}

export interface AnnotationGroup {
  name: string;
  description?: string;
  classes: AnnotationClass[];
}

export interface ProjectCreateData {
  name: string;
  description?: string;
  thumbnail_url?: string;
  project_type_name: string;
  visibility_name: string;
  organization_id?: number;
  annotation_groups: AnnotationGroup[];
}

export interface AnnotationClassResponse {
  id: number;
  class_id: number;
  name: string;
  color?: string;
  description?: string;
  created_at: string;
}

export interface AnnotationGroupResponse {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  classes: AnnotationClassResponse[];
}

export interface ProjectResponse {
  id: number;
  name: string;
  description?: string;
  thumbnail_url?: string;
  project_type_name: string;
  visibility_name: string;
  organization_id?: number;
  created_at: string;
  last_edited: string;
  is_active: boolean;
  images?: number
  annotation_groups: AnnotationGroupResponse[];
}

export interface ProjectStatistic {
  total_images: number;
  total_annotations: number;
  annotation_groups: number;
}

export interface Project {
  id: number;
  project_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  project_type_name: string;
  visibility_name: string;
  organization_id?: number;
  created_at: string;
  last_edited: string;
  is_active: boolean;
  images?: number;
  statistics: ProjectStatistic;
  annotation_groups: AnnotationGroupResponse[];
}
