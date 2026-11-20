// hooks/useMonitoringLoop.ts
//
// The pieces that close the monitoring -> data loop: a project's alert
// thresholds, creating a job from chosen images (active learning), and a
// model's deployment history.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import type { ThresholdSettings } from '@/types/evaluation';

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  } catch {
    // not JSON
  }
  return `Request failed (${res.status})`;
}

export const useAlertThresholds = (projectId?: string) => {
  const orgId = useAuth().getCurrentOrganization()?.id;
  const queryClient = useQueryClient();
  const key = ['evaluation-thresholds', projectId, orgId];

  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<ThresholdSettings> => {
      const res = await apiFetch(`/api/v1/temporal/projects/${projectId}/thresholds`);
      if (!res.ok) throw new Error(await errorMessage(res));
      return res.json();
    },
    enabled: !!projectId && !!orgId,
  });

  const save = useMutation({
    /** {metric: {warning, critical}}; {} resets every metric to its default. */
    mutationFn: async (values: Record<string, { warning: number; critical: number }>): Promise<ThresholdSettings> => {
      const res = await apiFetch(`/api/v1/temporal/projects/${projectId}/thresholds`, {
        method: 'PUT',
        body: JSON.stringify({ thresholds: values }),
      });
      if (!res.ok) throw new Error(await errorMessage(res));
      return res.json();
    },
    onSuccess: (data) => queryClient.setQueryData(key, data),
  });

  return { ...query, save };
};

export interface JobFromImagesResult {
  job_id: number;
  name: string;
  status: string;
  image_count: number;
  skipped_in_open_job: number[];
  not_found: number[];
}

export const useCreateJobFromImages = (projectId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name: string;
      description?: string;
      assignee_id?: number;
      project_image_ids: number[];
    }): Promise<JobFromImagesResult> => {
      const res = await apiFetch(`/api/v1/projects/${projectId}/jobs/from-images`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await errorMessage(res));
      return res.json();
    },
    onSuccess: () => {
      for (const key of ['evaluation-priority', 'project-overview', 'projectJobs', 'jobs', 'projectImages']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
};

export interface DeploymentEntry {
  id: number;
  version_id: string;
  version_number: number;
  version_name: string;
  target_env: 'staging' | 'production';
  deployed_by: string | null;
  deployed_at: string;
  undeployed_at: string | null;
  is_active: boolean;
  ended_by: 'moved_to_production' | 'moved_to_staging' | 'replaced' | 'undeployed' | null;
  replaced_by_version: string | null;
}

export const useDeploymentHistory = (modelId?: string) => {
  const orgId = useAuth().getCurrentOrganization()?.id;
  return useQuery({
    queryKey: ['model-deployments', orgId, modelId],
    queryFn: async (): Promise<DeploymentEntry[]> => {
      const res = await apiFetch(`/api/v1/models/${modelId}/deployments`);
      if (!res.ok) throw new Error(await errorMessage(res));
      return res.json();
    },
    enabled: !!modelId && !!orgId,
  });
};
