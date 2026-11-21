import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import { useRealtime, useRealtimeEvent } from "@/contexts/RealtimeContext";
import { TrainingSession } from "@/types/training_session";

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

/** Payload of the "training.epoch" live event (training/epochs.py). */
interface EpochEvent {
  session: number;
  status: string;
  epoch: number;
  total_epochs: number;
  progress: number;
  eta_seconds: number | null;
  at: string;
  metrics: Record<string, number>;
}

/**
 * One training run. While it runs, each finished epoch arrives over the
 * project's live stream and is added to the cached run straight away; the
 * server copy is refreshed now and then for what only it computes (best
 * epoch, stall). Without a live stream it falls back to polling.
 */
export const useTrainingSessionDetail = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { status: streamStatus } = useRealtime();
  const key = ["training-session", sessionId];

  useRealtimeEvent((event) => {
    if (event.type !== "training.epoch" && event.type !== "training.status") return;
    const data = event.data as Partial<EpochEvent>;
    if (String(data.session) !== sessionId) return;

    if (event.type === "training.status") {
      queryClient.invalidateQueries({ queryKey: key });
      return;
    }
    const ep = data as EpochEvent;
    queryClient.setQueryData<TrainingSession>(key, (old) => {
      if (!old) return old;
      const others = (old.epochMetrics ?? []).filter((e) => e.epoch !== ep.epoch);
      const epochMetrics = [...others, { epoch: ep.epoch, timestamp: ep.at, is_best: false, metrics: ep.metrics }]
        .sort((a, b) => a.epoch - b.epoch);
      return {
        ...old,
        status: ep.status as TrainingSession["status"],
        currentEpoch: Math.max(old.currentEpoch, ep.epoch),
        totalEpochs: ep.total_epochs || old.totalEpochs,
        progress: ep.progress,
        etaSeconds: ep.eta_seconds,
        lastEpochAt: ep.at,
        stalledSeconds: null, // an epoch just arrived
        currentMetrics: ep.metrics,
        epochMetrics,
      };
    });
    // Best epoch and best metrics are the server's call: refresh quietly.
    queryClient.invalidateQueries({ queryKey: key });
  });

  return useQuery<TrainingSession>({
    queryKey: key,
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
      if (data && TERMINAL_STATUSES.has(data.status)) return false;
      // Live: epochs are pushed; refresh once a minute for the stall check.
      // Not live: poll.
      return streamStatus === "live" ? 60_000 : 5_000;
    },
  });
};
