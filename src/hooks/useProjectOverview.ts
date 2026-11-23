// hooks/useProjectOverview.ts
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import type { OrganizationHome, ProjectOverview } from '@/types/overview';

/** Every project the caller can open, with its pipeline; refreshes every 30 s while training runs. */
export const useOrganizationHome = () => {
  const orgId = useAuth().getCurrentOrganization()?.id;
  return useQuery({
    queryKey: ['organization-home', orgId],
    queryFn: async (): Promise<OrganizationHome> => {
      const res = await apiFetch('/api/v1/organizations/home');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.detail === 'string' ? body.detail : `Request failed (${res.status})`);
      }
      return res.json();
    },
    enabled: !!orgId,
    refetchInterval: (query) => ((query.state.data?.running.length ?? 0) > 0 ? 30_000 : false),
  });
};

/** The project's whole pipeline in one request; refreshes every 30 s while a training run or a rollout is active. */
export const useProjectOverview = (projectId?: string) => {
  const orgId = useAuth().getCurrentOrganization()?.id;
  return useQuery({
    queryKey: ['project-overview', orgId, projectId],
    queryFn: async (): Promise<ProjectOverview> => {
      const res = await apiFetch(`/api/v1/projects/${projectId}/overview`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.detail === 'string' ? body.detail : `Request failed (${res.status})`);
      }
      return res.json();
    },
    enabled: !!projectId && !!orgId,
    refetchInterval: (query) => {
      const d = query.state.data;
      return (d?.training.running ?? 0) > 0 || (d?.fleet?.active_rollouts ?? 0) > 0 ? 30_000 : false;
    },
  });
};
