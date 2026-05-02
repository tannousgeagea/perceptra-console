import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import { TrainingSession } from "@/types/training_session";

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

export const useTrainingSessionDetail = (sessionId: string) => {
  return useQuery<TrainingSession>({
    queryKey: ["training-session", sessionId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/training-sessions/${sessionId}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to fetch session (${res.status})`);
      }

      return res.json();
    },
    enabled: !!sessionId,
    staleTime: 5000,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      return TERMINAL_STATUSES.has(data.status) ? false : 3000;
    },
  });
};
