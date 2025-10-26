// File: hooks/useTrainingProgress.ts
import { useQuery } from "@tanstack/react-query";
import { trainURL } from "@/components/api/base";

export interface TrainingProgress {
  progress: number;
  logs: string[];
  status: "pending" | "running" | "completed" | "failed";
}

export const useTrainingProgress = (sessionId: string | null) => {
  const query = useQuery<TrainingProgress>({
    queryKey: ["training-progress", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("No session ID provided");

      const res = await fetch(`${trainURL}/api/v1/training-sessions/${sessionId}`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to fetch training progress");
      }

      return await res.json();
    },
    enabled: !!sessionId,
    refetchInterval: 3000, // poll every 3 seconds
    staleTime: 2000,
  });

  const { data, isLoading, isError, error } = query;

  return {
    ...query,
    progress: data?.progress ?? 0,
    logs: data?.logs ?? [],
    isComplete: data?.status === "completed" || data?.status === "failed",
    isLoading,
    isError,
    error,
  };
};
