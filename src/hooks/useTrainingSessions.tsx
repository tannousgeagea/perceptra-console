import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import { TrainingSession } from "@/types/training_session";

export interface TrainingSessionResponse {
  total: number;
  results: TrainingSession[];
}

interface Params {
  projectId?: string;
  /** Filter by model UUID (exact match — use this on the model detail page). */
  modelUuid?: string;
  /** Filter by model name substring (legacy search filter). */
  modelId?: string;
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export const useTrainingSessions = ({
  projectId,
  modelUuid,
  modelId,
  search,
  status,
  limit = 10,
  offset = 0,
  enabled = true,
}: Params) => {
  const query = new URLSearchParams({
    ...(projectId && { project_id: projectId }),
    ...(modelUuid && { model_uuid: modelUuid }),
    ...(modelId && !modelUuid && { model_id: modelId }),
    ...(search && { search }),
    ...(status && { status }),
    limit: String(limit),
    offset: String(offset),
  });

  return useQuery<TrainingSessionResponse>({
    queryKey: ["training-sessions", projectId, modelUuid, modelId, search, status, limit, offset],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/training-sessions?${query.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to fetch training sessions (${res.status})`);
      }
      return res.json();
    },
    enabled,
  });
};
