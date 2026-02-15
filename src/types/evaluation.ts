// Evaluation Dashboard Types

export interface MetricsSummary {
  precision: number;
  recall: number;
  f1_score: number;
  tp: number;
  fp: number;
  fn: number;
  edit_rate: number;
  hallucination_rate: number;
  miss_rate: number;
  // Trend changes from previous snapshot
  precision_change: number;
  recall_change: number;
  f1_change: number;
  edit_rate_change: number;
  hallucination_change: number;
  miss_rate_change: number;
}

export interface ClassMetrics {
  class_name: string;
  class_id: number;
  color: string;
  precision: number;
  recall: number;
  f1_score: number;
  tp: number;
  fp: number;
  fn: number;
}

export interface EditTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface TemporalTrend {
  date: string;
  precision: number;
  recall: number;
  f1_score: number;
  edit_rate: number;
}

export interface Anomaly {
  id: string;
  date: string;
  severity: 'critical' | 'warning';
  metric_name: string;
  message: string;
  previous_value: number;
  current_value: number;
  change_percentage: number;
}

export interface Alert {
  id: number;
  severity: 'critical' | 'warning';
  metric_name: string;
  message: string;
  current_value: number;
  threshold: number;
  created_at: string;
  is_acknowledged: boolean;
}

export interface AlertThreshold {
  metric: string;
  warning_threshold: number;
  critical_threshold: number;
  slack_enabled: boolean;
  email_enabled: boolean;
  condition: 'lt' | 'gt'; // less than or greater than
}

export interface PriorityImage {
  image_id: string;
  image_name: string;
  priority_score: number;
  reasons: string[];
  thumbnail_url: string;
}

export type SamplingStrategy = 'uncertainty' | 'diversity' | 'error-prone' | 'hybrid';

export interface ActiveLearningConfig {
  strategy: SamplingStrategy;
  batch_size: number;
}
