import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { useProjectPermissions } from '@/hooks/usePermissions';

/**
 * Who may change a similarity scan and its results (server rule, similarity.py):
 * the editor role where the scan looks — in the project for a project scan,
 * in the organization for a datalake scan. Deleting duplicates removes images
 * from the datalake, so it needs an organization admin.
 *
 * The flags are false while permissions load, so nothing flashes disabled.
 */
export const useScanPermissions = (projectId?: string | null) => {
  const { hasEditPermission, hasAdminPermission, permissionsLoading } = useCurrentOrganization();
  const project = useProjectPermissions(projectId ?? undefined);
  const loading = permissionsLoading || project.isLoading;

  const canWrite = projectId ? project.can('edit') : hasEditPermission;
  const cannotWrite = !loading && !canWrite;
  const cannotDelete = !permissionsLoading && !hasAdminPermission;

  return {
    cannotWrite,
    writeReason: cannotWrite
      ? projectId
        ? 'Needs the editor role in this project'
        : 'Needs the editor role in the organization'
      : undefined,
    cannotDelete,
    deleteReason: cannotDelete ? 'Deleting images needs an organization admin' : undefined,
  };
};
