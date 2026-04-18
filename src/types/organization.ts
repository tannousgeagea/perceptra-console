export interface OrganizationSummary {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  description?: string;
  user_count: number;
  project_count: number;
  current_user_role: string;
}

export interface OrganizationStatistics {
  total_members: number;
  active_members: number;
  inactive_members: number;
  pending_members: number;
  total_projects: number;
  active_projects: number;
  total_images: number;
}

export interface OrgMemberSummary {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  joined_at: string;
}

export interface OrganizationDetails {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  current_user_role: string;
  current_user_status: string;
  current_user_joined_at: string;
  statistics: OrganizationStatistics;
  recent_members: OrgMemberSummary[];
}

export interface OrgMember {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  joined_at: string;
}

export interface MembersResponse {
  total: number;
  page: number;
  page_size: number;
  members: OrgMember[];
}

export interface OrgProject {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  organization_id: string;
  is_active: boolean;
  created_at: string;
}

export interface ProjectsResponse {
  total: number;
  projects: OrgProject[];
}
