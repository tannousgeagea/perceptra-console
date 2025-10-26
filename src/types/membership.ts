export type Role = 'admin' | 'editor' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  userCount?: number;
  projectCount?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  organizationId: string;
  memberCount?: number;
}

export interface ProjectMembership {
  projectId: string;
  userId: string;
  role: Role;
  organizationId?: string;
}

export interface OrganizationMember extends User {
  role: Role
}

export interface ProjectMember extends User {
  role: Role;
}

export interface UserProfile extends User {
  organizations: {
    organization: Organization;
    projects: Project[];
  }[];
  projectMemberships: {
    project: Project;
    role: Role;
    organization: Organization;
  }[];
}