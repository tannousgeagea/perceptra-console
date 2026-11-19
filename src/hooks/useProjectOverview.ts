// hooks/useProjectOverview.ts
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjectOverview } from '@/types/overview';

/** The project's whole pipeline in one request; refreshes every 30 s while a training run is active. */
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
    refetchInterval: (query) => ((query.state.data?.training.running ?? 0) > 0 ? 30_000 : false),
  });
};
