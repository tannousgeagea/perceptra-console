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
  /** Field alerts (edge devices): where it happened; empty for project-wide alerts. */
  site?: { site_id: string; name: string } | null;
  device?: { device_id: string; name: string } | null;
}

/** One metric's alert thresholds (rates 0-1) for a project. */
export interface AlertThreshold {
  metric: string;
  warning_threshold: number;
  critical_threshold: number;
  higher_is_better: boolean;
  condition: 'lt' | 'gt'; // alert when below (lt) or above (gt)
  default_warning: number;
  default_critical: number;
}

/** GET/PUT /temporal/projects/{id}/thresholds */
export interface ThresholdSettings {
  thresholds: AlertThreshold[];
  /** Server-wide notification channels (not per project). */
  notify_slack: boolean;
  notify_email: boolean;
}

export interface PriorityScores {
  uncertainty: number;
  rarity: number;
  error_prone: number;
  density: number;
}

export interface PriorityImage {
  image_id: string;
  image_name: string;
  /** What "create job from images" takes. */
  project_image_id: number;
  priority_score: number;
  priority_rank: number;
  reasons: string[];
  thumbnail_url: string | null;
  num_predictions: number;
  lowest_confidence: number | null;
  classes: string[];
  scores: PriorityScores | null;
  /** Name of the open job it's already in; it can't go into another one. */
  in_open_job: string | null;
}

export type SamplingStrategy = 'uncertainty' | 'diversity' | 'error-prone' | 'hybrid';

export interface ActiveLearningConfig {
  strategy: SamplingStrategy;
  batch_size: number;
}
