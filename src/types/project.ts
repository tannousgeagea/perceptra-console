

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

export interface UserBasicInfo {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
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
  created_by?: UserBasicInfo;
  updated_by?: UserBasicInfo;
  user_role: string;
  last_edited: string;
  is_active: boolean;
  images?: number;
  statistics: ProjectStatistic;
  annotation_groups: AnnotationGroupResponse[];
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  project_type_id?: number;
  visibility_id?: number;
  thumbnail_url?: string;
  is_active?: boolean;
  settings?: Record<string, any>;
}

export type SortField = 'name' | 'created_at' | 'total_images' | 'total_annotations';
export type SortDirection = 'asc' | 'desc';