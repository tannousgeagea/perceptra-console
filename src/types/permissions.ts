// types/permissions.ts
//
// Shapes of the role and permission endpoints. The server's
// memberships/roles.py is the single source of truth; the console never keeps
// its own copy of role lists or rules, it asks the API.

export interface RoleInfo {
  name: string;
  rank: number;
  description: string;
}

/** GET /api/v1/roles */
export interface RoleCatalog {
  org_roles: RoleInfo[];
  project_roles: RoleInfo[];
  org_permissions: Record<string, string[]>;
  project_permissions: Record<string, string[]>;
  org_roles_with_project_bypass: string[];
}

/** GET /api/v1/organizations/permissions */
export interface OrgPermissions {
  role: string | null;
  permissions: string[];
}

/** GET /api/v1/projects/:projectId/permissions */
export interface ProjectPermissions {
  org_role: string | null;
  project_role: string | null;
  permissions: string[];
}

/** Org permission names (memberships/roles.py PERMISSION_TO_ORG_ROLES). */
export type OrgPermission =
  | 'read' | 'write' | 'admin' | 'view' | 'operate' | 'edit' | 'manage' | 'own' | 'owner';

/** Project permission names (memberships/roles.py PERMISSION_TO_PROJECT_ROLES). */
export type ProjectPermission =
  | 'read' | 'write' | 'view' | 'annotate' | 'review' | 'edit' | 'manage' | 'admin' | 'own' | 'owner';
