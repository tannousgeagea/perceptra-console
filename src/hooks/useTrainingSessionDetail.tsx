import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { TrainingSession } from "@/types/training_session";

export const useTrainingSessionDetail = (sessionId: string) => {
  return useQuery<TrainingSession>({
    queryKey: ["training-session", sessionId],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/api/v1/training-sessions/${sessionId}`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to fetch session detail");
      }

      return await res.json();
    },
    enabled: !!sessionId,
    staleTime: 5000,
    refetchInterval: 3000, // optional live refresh
  });
};
