import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import type {
  MetricsSummary,
  ClassMetrics,
  EditTypeDistribution,
  TemporalTrend,
  Anomaly,
  Alert,
  AlertThreshold,
  PriorityImage,
  SamplingStrategy,
} from "@/types/evaluation";

const EMPTY_SUMMARY: MetricsSummary = {
  precision: 0, recall: 0, f1_score: 0, tp: 0, fp: 0, fn: 0,
  edit_rate: 0, hallucination_rate: 0, miss_rate: 0,
  precision_change: 0, recall_change: 0, f1_change: 0,
  edit_rate_change: 0, hallucination_change: 0, miss_rate_change: 0,
};

const CLASS_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#ef4444", "#f97316",
  "#06b6d4", "#a855f7",
];

export const useEvaluationData = (projectId?: string) => {
  const queryClient = useQueryClient();
  const [trendDays, setTrendDays] = useState(30);
  const [priorityStrategy, setPriorityStrategy] = useState<SamplingStrategy>("uncertainty");
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

  // ── Alerts ───────────────────────────────────────────────────────────────
  const alertsQuery = useQuery<Alert[]>({
    queryKey: ["evaluation-alerts", projectId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/temporal/projects/${projectId}/alerts`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data: any[] = await res.json();
      return data.map((a) => ({
        id: a.id,
        severity: a.severity,
        metric_name: a.metric_name,
        message: a.message,
        current_value: a.current_value ?? 0,
        threshold: a.threshold_value ?? 0,
        created_at: a.alert_date,
        is_acknowledged: a.is_acknowledged ?? false,
      }));
    },
    enabled: !!projectId,
    staleTime: 60 * 1000,
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

  // ── Thresholds ───────────────────────────────────────────────────────────
  const thresholdsQuery = useQuery<AlertThreshold[]>({
    queryKey: ["evaluation-thresholds", projectId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/temporal/projects/${projectId}/thresholds`);
      if (!res.ok) throw new Error("Failed to fetch thresholds");
      const data: any[] = await res.json();
      return data.map((t) => ({
        metric: t.metric,
        warning_threshold: t.warning_threshold,
        critical_threshold: t.critical_threshold,
        slack_enabled: false,
        email_enabled: true,
        condition: t.condition ?? (t.higher_is_better ? "lt" : "gt"),
      }));
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000,
  });

  const updateThresholds = useCallback((_newThresholds: AlertThreshold[]) => {
    // Threshold persistence requires a backend PUT endpoint (Phase 2+).
    // Local-only update is intentionally omitted.
  }, []);

  // ── Priority images (active learning) ───────────────────────────────────
  const priorityQuery = useQuery<PriorityImage[]>({
    queryKey: ["evaluation-priority", projectId, priorityStrategy, priorityLimit],
    queryFn: async () => {
      const strategyParam = priorityStrategy.replace('-', '_');
      const res = await apiFetch(
        `/api/v1/active-learning/projects/${projectId}/suggest?strategy=${strategyParam}&limit=${priorityLimit}`
      );
      if (!res.ok) throw new Error("Failed to fetch priority images");
      const data: any[] = await res.json();
      return data.map((img) => ({
        image_id: img.image_id,
        image_name: img.image_name,
        priority_score: img.priority_score ?? 0,
        reasons: img.reasons ?? [],
        thumbnail_url: "",
      }));
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

  // ── Combined loading state ───────────────────────────────────────────────
  const isLoading =
    summaryQuery.isLoading ||
    classMetricsQuery.isLoading ||
    trendsQuery.isLoading ||
    alertsQuery.isLoading;

  return {
    isLoading,
    summary: summaryQuery.data ?? EMPTY_SUMMARY,
    classMetrics: classMetricsQuery.data ?? [],
    editDistribution: [] as EditTypeDistribution[],
    trends: trendsQuery.data ?? [],
    anomalies: [] as Anomaly[],
    alerts: alertsQuery.data ?? [],
    thresholds: thresholdsQuery.data ?? [],
    priorityImages: priorityQuery.data ?? [],
    fetchTrends,
    acknowledgeAlert,
    updateThresholds,
    generatePriorityQueue,
  };
};
