import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import type {
  MetricsSummary,
  ClassMetrics,
  EditTypeDistribution,
  TemporalTrend,
  Anomaly,
  Alert,
  PriorityImage,
  SamplingStrategy,
} from "@/types/evaluation";

const EMPTY_SUMMARY: MetricsSummary = {
  precision: 0, recall: 0, f1_score: 0, tp: 0, fp: 0, fn: 0,
  edit_rate: 0, hallucination_rate: 0, miss_rate: 0,
  precision_change: 0, recall_change: 0, f1_change: 0,
  edit_rate_change: 0, hallucination_change: 0, miss_rate_change: 0,
};

/** GET /temporal/projects/{id}/alerts, as the API sends it. */
interface RawAlert {
  id: number;
  severity: string;
  metric_name: string;
  message: string;
  current_value: number;
  previous_value: number | null;
  threshold_value: number | null;
  change_percent: number | null;
  is_acknowledged: boolean;
  alert_date: string;
}

const CLASS_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#ef4444", "#f97316",
  "#06b6d4", "#a855f7",
];

export const useEvaluationData = (projectId?: string) => {
  const queryClient = useQueryClient();
  const [trendDays, setTrendDays] = useState(30);
  // Same default as the Active Learning tab's selector, so the first list matches what it shows.
  const [priorityStrategy, setPriorityStrategy] = useState<SamplingStrategy>("hybrid");
  const [priorityLimit, setPriorityLimit] = useState(20);

  // ── Summary ──────────────────────────────────────────────────────────────
  const summaryQuery = useQuery<MetricsSummary>({
    queryKey: ["evaluation-summary", projectId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/evaluation/projects/${projectId}/summary`);
      if (!res.ok) throw new Error("Failed to fetch evaluation summary");
      const data = await res.json();
      return {
        precision: data.precision ?? 0,
        recall: data.recall ?? 0,
        f1_score: data.f1_score ?? 0,
        tp: data.tp ?? 0,
        fp: data.fp ?? 0,
        fn: data.fn ?? 0,
        edit_rate: data.edit_rate ?? 0,
        hallucination_rate: data.hallucination_rate ?? 0,
        miss_rate: data.miss_rate ?? 0,
        precision_change: 0,
        recall_change: 0,
        f1_change: 0,
        edit_rate_change: 0,
        hallucination_change: 0,
        miss_rate_change: 0,
      } as MetricsSummary;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  // ── Class metrics ────────────────────────────────────────────────────────
  const classMetricsQuery = useQuery<ClassMetrics[]>({
    queryKey: ["evaluation-classes", projectId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/evaluation/projects/${projectId}/classes`);
      if (!res.ok) throw new Error("Failed to fetch class metrics");
      const data: any[] = await res.json();
      return data.map((cls, i) => ({
        class_id: cls.class_id ?? i,
        class_name: cls.class_name ?? `Class ${i}`,
        color: CLASS_COLORS[i % CLASS_COLORS.length],
        precision: cls.precision ?? 0,
        recall: cls.recall ?? 0,
        f1_score: cls.f1_score ?? 0,
        tp: cls.tp ?? 0,
        fp: cls.fp ?? 0,
        fn: cls.fn ?? 0,
      }));
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  // ── Temporal trends ──────────────────────────────────────────────────────
  const trendsQuery = useQuery<TemporalTrend[]>({
    queryKey: ["evaluation-trends", projectId, trendDays],
    queryFn: async () => {
      const res = await apiFetch(
        `/api/v1/temporal/projects/${projectId}/trends?days=${trendDays}`
      );
      if (!res.ok) throw new Error("Failed to fetch trends");
      const data = await res.json();
      return (data.trends ?? []).map((t: any) => ({
        date: typeof t.date === "string" ? t.date.split("T")[0] : t.date,
        precision: t.precision ?? 0,
        recall: t.recall ?? 0,
        f1_score: t.f1_score ?? 0,
        edit_rate: t.edit_rate ?? 0,
      }));
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  const fetchTrends = useCallback((days: number) => {
    setTrendDays(days);
  }, []);

  // ── Alerts (and anomalies: alerts that record a jump from the previous snapshot) ──
  const alertsQuery = useQuery<RawAlert[]>({
    queryKey: ["evaluation-alerts", projectId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/temporal/projects/${projectId}/alerts`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 60 * 1000,
  });

  const alerts = useMemo<Alert[]>(
    () =>
      (alertsQuery.data ?? []).map((a) => ({
        id: a.id,
        severity: a.severity as Alert["severity"],
        metric_name: a.metric_name,
        message: a.message,
        current_value: a.current_value ?? 0,
        threshold: a.threshold_value ?? 0,
        created_at: a.alert_date,
        is_acknowledged: a.is_acknowledged ?? false,
      })),
    [alertsQuery.data],
  );

  // A jump between two daily snapshots, within the trend chart's range.
  const anomalies = useMemo<Anomaly[]>(() => {
    const since = Date.now() - trendDays * 86_400_000;
    return (alertsQuery.data ?? [])
      .filter(
        (a) =>
          a.change_percent != null &&
          a.previous_value != null &&
          (a.severity === "critical" || a.severity === "warning") &&
          new Date(a.alert_date).getTime() >= since,
      )
      .map((a) => ({
        id: String(a.id),
        date: a.alert_date.split("T")[0],
        severity: a.severity as Anomaly["severity"],
        metric_name: a.metric_name,
        message: a.message,
        previous_value: a.previous_value as number,
        current_value: a.current_value,
        change_percentage: a.change_percent as number,
      }));
  }, [alertsQuery.data, trendDays]);

  // ── How reviewers changed predictions ────────────────────────────────────
  const editTypesQuery = useQuery<EditTypeDistribution[]>({
    queryKey: ["evaluation-edit-types", projectId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/evaluation/projects/${projectId}/edit-types`);
      if (!res.ok) throw new Error("Failed to fetch edit types");
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const res = await apiFetch(
        `/api/v1/temporal/projects/${projectId}/alerts/${alertId}/acknowledge`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to acknowledge alert");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-alerts", projectId] });
    },
  });

  const acknowledgeAlert = useCallback(
    (alertId: number) => acknowledgeAlertMutation.mutate(alertId),
    [acknowledgeAlertMutation]
  );

  // Alert thresholds: their own hook (useAlertThresholds), used by AlertThresholdsCard.

  // ── Priority images (active learning) ───────────────────────────────────
  const priorityQuery = useQuery<PriorityImage[]>({
    queryKey: ["evaluation-priority", projectId, priorityStrategy, priorityLimit],
    queryFn: async () => {
      const strategyParam = priorityStrategy.replace('-', '_');
      const res = await apiFetch(
        `/api/v1/active-learning/projects/${projectId}/suggest?strategy=${strategyParam}&limit=${priorityLimit}`
      );
      if (!res.ok) throw new Error("Failed to fetch priority images");
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });

  const generatePriorityQueue = useCallback(
    (strategy: SamplingStrategy, batchSize: number) => {
      setPriorityStrategy(strategy);
      setPriorityLimit(batchSize);
    },
    []
  );

  // ── Reload everything on this page ───────────────────────────────────────
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({
      predicate: (q) =>
        String(q.queryKey[0]).startsWith("evaluation-") && q.queryKey[1] === projectId,
    });
  }, [queryClient, projectId]);

  const isFetching =
    summaryQuery.isFetching ||
    classMetricsQuery.isFetching ||
    trendsQuery.isFetching ||
    alertsQuery.isFetching;

  // ── Combined loading state ───────────────────────────────────────────────
  const isLoading =
    summaryQuery.isLoading ||
    classMetricsQuery.isLoading ||
    trendsQuery.isLoading ||
    alertsQuery.isLoading;

  return {
    isLoading,
    isFetching,
    refresh,
    summary: summaryQuery.data ?? EMPTY_SUMMARY,
    classMetrics: classMetricsQuery.data ?? [],
    editDistribution: editTypesQuery.data ?? [],
    trends: trendsQuery.data ?? [],
    anomalies,
    alerts,
    priorityImages: priorityQuery.data ?? [],
    priorityLoading: priorityQuery.isFetching,
    priorityStrategy,
    priorityLimit,
    fetchTrends,
    acknowledgeAlert,
    generatePriorityQueue,
  };
};
