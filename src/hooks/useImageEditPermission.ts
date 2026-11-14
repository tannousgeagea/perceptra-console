// hooks/useImageEditPermission.ts
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { useProjectPermissions, useRoleCatalog } from '@/hooks/usePermissions';
import { useProjectDetails } from '@/hooks/useProjectDetails';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import type { ProjectMember } from '@/types/organization';

const displayName = (m: ProjectMember) =>
  `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim() || m.username;

/**
 * Whether the signed-in person may add or change images (upload, tag).
 *
 * The API's rule: "write" in the organization allows it anywhere; inside a
 * project, "write" in that project allows it too. Both answers come from the
 * server, so the console holds no role lists of its own.
 *
 * When they can't, `projectAdmins` lists who can give them the editor role in
 * the project (empty outside a project, or when it has no admins).
 */
export const useImageEditPermission = (projectId?: string) => {
  const { currentOrganization, hasEditPermission, permissionsLoading } = useCurrentOrganization();
  const project = useProjectPermissions(projectId);
  const details = useProjectDetails(projectId);
  const catalog = useRoleCatalog();

  const canEdit = hasEditPermission || project.can('write');
  const isLoading = !canEdit && (permissionsLoading || project.isLoading);

  // Only look up the admins when we need to tell someone whom to ask.
  const askInProject = !canEdit && !isLoading && !!projectId;
  const members = useProjectMembers(
    askInProject ? currentOrganization?.id : undefined,
    askInProject ? projectId : undefined,
  );
  // Whoever may manage the project's members can change their role.
  const managers = new Set(catalog.data?.project_permissions.manage ?? []);
  const projectAdmins = (members.data ?? [])
    .filter((m) => managers.has(m.role))
    .map(displayName);

  return {
    canEdit,
    isLoading,
    orgRole: currentOrganization?.role ?? '',
    projectRole: project.projectRole ?? '',
    projectName: details.data?.name ?? '',
    projectAdmins,
  };
};
