import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { useProjectDetails } from '@/hooks/useProjectDetails';

/** Project roles allowed to send images back (mirrors ProjectContext.can_review on the server). */
const REVIEW_ROLES = new Set(['reviewer', 'editor', 'admin', 'owner']);

/**
 * Whether the current user may send images back to their annotator in this
 * project: org admins and owners, or project reviewers and above. The server
 * enforces the same rule; this only decides what the UI offers.
 */
export const useCanReview = (projectId?: string): boolean => {
  const { hasAdminPermission } = useCurrentOrganization();
  const { data: project } = useProjectDetails(projectId);
  if (hasAdminPermission) return true;
  return REVIEW_ROLES.has((project?.user_role ?? '').toLowerCase());
};
