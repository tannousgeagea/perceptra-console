// hooks/usePermissions.ts
//
// What the signed-in person may do, as computed by the server with the same
// rule it enforces (memberships/roles.py). Nothing here encodes role rules:
// adding a role or changing who may do what is a server-only change.
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import type {
  ProjectPermission,
  ProjectPermissions,
  RoleCatalog,
} from '@/types/permissions';

async function getJson<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

/** Every org and project role, in order, with descriptions and the permission matrix. */
export const useRoleCatalog = () => {
  // Signed-out pages use org helpers too; don't call the API without a session.
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['role-catalog'],
    queryFn: () => getJson<RoleCatalog>('/api/v1/roles'),
    enabled: isAuthenticated,
    staleTime: Infinity,
  });
};

/**
 * Role names that can be given to a member, least privileged first. Project
 * roles leave out owner-level roles: project ownership isn't handed out here.
 */
export const useAssignableRoles = (scope: 'org' | 'project'): string[] => {
  const { data } = useRoleCatalog();
  if (!data) return [];
  if (scope === 'org') return data.org_roles.map((r) => r.name);
  const owners = new Set(data.project_permissions.own ?? []);
  return data.project_roles.map((r) => r.name).filter((name) => !owners.has(name));
};

// Org-level checks: useCurrentOrganization().hasAdminPermission etc., which
// read this catalog with the person's org role.

/**
 * The person's permissions in one project (org admins and owners have them
 * all). With no projectId, nothing is fetched and `can` is always false.
 */
export const useProjectPermissions = (projectId?: string) => {
  const currentOrganization = useAuth().getCurrentOrganization();
  const orgId = currentOrganization?.id;
  const query = useQuery({
    queryKey: ['project-permissions', projectId, orgId],
    queryFn: () => getJson<ProjectPermissions>(`/api/v1/projects/${projectId}/permissions`),
    enabled: !!projectId && !!orgId,
    staleTime: 60_000,
    retry: false,
  });
  const granted = new Set(query.data?.permissions ?? []);
  return {
    projectRole: query.data?.project_role ?? null,
    can: (permission: ProjectPermission) => granted.has(permission),
    isLoading: !!projectId && query.isLoading,
  };
};
