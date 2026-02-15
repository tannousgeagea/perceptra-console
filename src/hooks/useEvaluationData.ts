import { useState, useCallback } from "react";
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

// Mock data generators
const generateMockSummary = (): MetricsSummary => ({
  precision: 0.852,
  recall: 0.785,
  f1_score: 0.817,
  tp: 1245,
  fp: 298,
  fn: 457,
  edit_rate: 0.321,
  hallucination_rate: 0.148,
  miss_rate: 0.215,
  precision_change: 0.023,
  recall_change: -0.012,
  f1_change: 0.005,
  edit_rate_change: 0.031,
  hallucination_change: -0.02,
  miss_rate_change: 0.018,
});

const generateMockClassMetrics = (): ClassMetrics[] => [
  { class_id: 1, class_name: "Person", color: "#10b981", precision: 0.92, recall: 0.88, f1_score: 0.90, tp: 450, fp: 38, fn: 61 },
  { class_id: 2, class_name: "Car", color: "#3b82f6", precision: 0.87, recall: 0.82, f1_score: 0.84, tp: 312, fp: 47, fn: 69 },
  { class_id: 3, class_name: "Bike", color: "#f59e0b", precision: 0.78, recall: 0.71, f1_score: 0.74, tp: 189, fp: 53, fn: 77 },
  { class_id: 4, class_name: "Truck", color: "#8b5cf6", precision: 0.85, recall: 0.79, f1_score: 0.82, tp: 156, fp: 28, fn: 41 },
  { class_id: 5, class_name: "Bus", color: "#ec4899", precision: 0.81, recall: 0.76, f1_score: 0.78, tp: 98, fp: 23, fn: 31 },
  { class_id: 6, class_name: "Motorcycle", color: "#14b8a6", precision: 0.73, recall: 0.68, f1_score: 0.70, tp: 40, fp: 15, fn: 19 },
];

const generateMockEditDistribution = (): EditTypeDistribution[] => [
  { type: "Perfect", count: 1360, percentage: 68 },
  { type: "Minor Edit", count: 440, percentage: 22 },
  { type: "Major Edit", count: 140, percentage: 7 },
  { type: "Class Change", count: 60, percentage: 3 },
];

const generateMockTrends = (days: number): TemporalTrend[] => {
  const trends: TemporalTrend[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some variation
    const noise = () => (Math.random() - 0.5) * 0.1;
    
    trends.push({
      date: date.toISOString().split('T')[0],
      precision: Math.max(0.6, Math.min(0.95, 0.85 + noise())),
      recall: Math.max(0.55, Math.min(0.9, 0.78 + noise())),
      f1_score: Math.max(0.58, Math.min(0.92, 0.81 + noise())),
      edit_rate: Math.max(0.2, Math.min(0.5, 0.32 + noise())),
    });
  }
  
  return trends;
};

const generateMockAnomalies = (): Anomaly[] => [
  {
    id: "anom-1",
    date: "2024-08-15",
    severity: "critical",
    metric_name: "F1 Score",
    message: "F1 Score dropped 8.2% (Critical)",
    previous_value: 0.817,
    current_value: 0.735,
    change_percentage: -8.2,
  },
  {
    id: "anom-2",
    date: "2024-08-12",
    severity: "warning",
    metric_name: "Edit Rate",
    message: "Edit rate increased 5.1% (Warning)",
    previous_value: 0.283,
    current_value: 0.334,
    change_percentage: 5.1,
  },
];

const generateMockAlerts = (): Alert[] => [
  {
    id: 1,
    severity: "critical",
    metric_name: "F1 Score",
    message: "F1 Score critically low: 73.5%",
    current_value: 0.735,
    threshold: 0.75,
    created_at: "2024-08-15T02:03:00Z",
    is_acknowledged: false,
  },
  {
    id: 2,
    severity: "critical",
    metric_name: "Recall",
    message: "Recall dropped 10.2% in 24h",
    current_value: 0.72,
    threshold: 0.75,
    created_at: "2024-08-15T02:03:00Z",
    is_acknowledged: false,
  },
  {
    id: 3,
    severity: "warning",
    metric_name: "Hallucination Rate",
    message: "Hallucination rate elevated",
    current_value: 0.182,
    threshold: 0.15,
    created_at: "2024-08-14T23:30:00Z",
    is_acknowledged: false,
  },
  {
    id: 4,
    severity: "warning",
    metric_name: "Edit Rate",
    message: "Edit rate above normal",
    current_value: 0.35,
    threshold: 0.30,
    created_at: "2024-08-13T10:15:00Z",
    is_acknowledged: true,
  },
];

const generateMockThresholds = (): AlertThreshold[] => [
  { metric: "F1 Score", warning_threshold: 0.70, critical_threshold: 0.60, slack_enabled: true, email_enabled: true, condition: "lt" },
  { metric: "Precision", warning_threshold: 0.75, critical_threshold: 0.65, slack_enabled: true, email_enabled: false, condition: "lt" },
  { metric: "Recall", warning_threshold: 0.70, critical_threshold: 0.60, slack_enabled: true, email_enabled: true, condition: "lt" },
  { metric: "Edit Rate", warning_threshold: 0.30, critical_threshold: 0.50, slack_enabled: false, email_enabled: true, condition: "gt" },
];

const generateMockPriorityImages = (): PriorityImage[] => [
  {
    image_id: "img-1023",
    image_name: "img_1023.jpg",
    priority_score: 0.92,
    reasons: ["High confidence false positive"],
    thumbnail_url: "/placeholder.svg",
  },
  {
    image_id: "img-2047",
    image_name: "img_2047.jpg",
    priority_score: 0.87,
    reasons: ["Under-represented class: bicycle"],
    thumbnail_url: "/placeholder.svg",
  },
  {
    image_id: "img-3156",
    image_name: "img_3156.jpg",
    priority_score: 0.78,
    reasons: ["Mixed confidence predictions"],
    thumbnail_url: "/placeholder.svg",
  },
  {
    image_id: "img-4289",
    image_name: "img_4289.jpg",
    priority_score: 0.75,
    reasons: ["Similar to known errors"],
    thumbnail_url: "/placeholder.svg",
  },
  {
    image_id: "img-5102",
    image_name: "img_5102.jpg",
    priority_score: 0.71,
    reasons: ["Low confidence predictions"],
    thumbnail_url: "/placeholder.svg",
  },
];

export const useEvaluationData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary] = useState<MetricsSummary>(generateMockSummary);
  const [classMetrics] = useState<ClassMetrics[]>(generateMockClassMetrics);
  const [editDistribution] = useState<EditTypeDistribution[]>(generateMockEditDistribution);
  const [trends, setTrends] = useState<TemporalTrend[]>(() => generateMockTrends(30));
  const [anomalies] = useState<Anomaly[]>(generateMockAnomalies);
  const [alerts, setAlerts] = useState<Alert[]>(generateMockAlerts);
  const [thresholds, setThresholds] = useState<AlertThreshold[]>(generateMockThresholds);
  const [priorityImages, setPriorityImages] = useState<PriorityImage[]>(generateMockPriorityImages);

  const fetchTrends = useCallback((days: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setTrends(generateMockTrends(days));
      setIsLoading(false);
    }, 300);
  }, []);

  const acknowledgeAlert = useCallback((alertId: number) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, is_acknowledged: true } : alert
      )
    );
  }, []);

  const updateThresholds = useCallback((newThresholds: AlertThreshold[]) => {
    setThresholds(newThresholds);
  }, []);

  const generatePriorityQueue = useCallback(
    (strategy: SamplingStrategy, batchSize: number) => {
      setIsLoading(true);
      setTimeout(() => {
        // Simulate different ordering based on strategy
        const images = generateMockPriorityImages().slice(0, batchSize);
        setPriorityImages(images);
        setIsLoading(false);
      }, 500);
    },
    []
  );

  return {
    isLoading,
    summary,
    classMetrics,
    editDistribution,
    trends,
    anomalies,
    alerts,
    thresholds,
    priorityImages,
    fetchTrends,
    acknowledgeAlert,
    updateThresholds,
    generatePriorityQueue,
  };
};
