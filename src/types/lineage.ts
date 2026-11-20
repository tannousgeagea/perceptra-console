// GET /api/v1/models/{id}/versions/{version}/lineage and GET /api/v1/models/{id}/compare

export interface LineageVersionRef {
  version_id: string;
  version_number: number;
  label: string;
  status: string;
  deployment_status: string;
  created_at: string;
}

export interface LineageVersion extends LineageVersionRef {
  model_size: string;
  created_by: string | null;
  deployed_at: string | null;
  tags: string[];
  metrics: Record<string, unknown>;
  config: Record<string, unknown>;
  error_message: string | null;
}

export interface DatasetSummary {
  id: number;
  version_number: number;
  label: string;
  total_images: number;
  total_annotations: number;
  train_count: number;
  val_count: number;
  test_count: number;
  created_at: string;
  /** Active objects per class on the dataset's images, largest first. */
  classes: { name: string; count: number }[];
}

export interface TrainingSummary {
  /** Numeric id: the session page's URL uses it. */
  id: number;
  status: string;
  started_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  epochs_run: number | null;
  total_epochs: number | null;
  best_metrics: Record<string, unknown>;
  compute_resource: string | null;
}

export interface VersionLineage {
  version: LineageVersion;
  parent: LineageVersionRef | null;
  children: LineageVersionRef[];
  previous: LineageVersionRef | null;
  next: LineageVersionRef | null;
  production: LineageVersionRef | null;
  dataset: DatasetSummary | null;
  training: TrainingSummary | null;
  deployments: {
    target_env: string;
    deployed_at: string;
    undeployed_at: string | null;
    is_active: boolean;
    deployed_by: string | null;
  }[];
}

export type MetricVerdict = 'improved' | 'worse' | 'same';

export interface MetricChange {
  key: string;
  a: number | null;
  b: number | null;
  delta: number | null;
  better: 'higher' | 'lower' | null;
  verdict: MetricVerdict | null;
}

export interface ClassChange {
  name: string;
  a: number;
  b: number;
  delta: number;
  /** Objects of this class on the images only B trained on. */
  in_added_images: number;
}

export interface VersionComparison {
  a: LineageVersion;
  b: LineageVersion;
  a_training: TrainingSummary | null;
  b_training: TrainingSummary | null;
  production_version_id: string | null;
  metrics: MetricChange[];
  settings_changed: { key: string; a: unknown; b: unknown }[];
  settings_identical: number;
  data: {
    same_dataset: boolean;
    a: DatasetSummary | null;
    b: DatasetSummary | null;
    only_a: number;
    only_b: number;
    shared: number;
    moved_split: number;
    classes: ClassChange[];
  };
}
