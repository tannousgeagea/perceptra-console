import { useProjectPermissions } from '@/hooks/usePermissions';

/**
 * Whether the current user may send images back to their annotator in this
 * project (reviewers and above, or org admins). The server decides; this only
 * decides what the UI offers.
 */
export const useCanReview = (projectId?: string): boolean =>
  useProjectPermissions(projectId).can('review');
