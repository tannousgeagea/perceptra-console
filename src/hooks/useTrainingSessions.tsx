// File: hooks/useTrainingSessions.ts
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { TrainingSession } from "@/types/training_session";

export interface TrainingSessionResponse {
  total: number;
  results: TrainingSession[];
}

interface Params {
  projectId?: string;
  modelId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const useTrainingSessions = ({
  projectId,
  modelId,
  search,
  limit = 10,
  offset = 0
}: Params) => {
  const query = new URLSearchParams({
    ...(projectId && { project_id: projectId }),
    ...(modelId && { model_id: modelId }),
    ...(search && { search }),
    limit: String(limit),
    offset: String(offset),
  });

  return useQuery<TrainingSessionResponse>({
    queryKey: ["training-sessions", projectId, modelId, search, limit, offset],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/api/v1/training-sessions?${query.toString()}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to fetch training sessions");
      }
      return res.json();
    },
  });
};
