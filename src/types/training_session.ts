export type Status =
  | 'pending'
  | 'queued'
  | 'initializing'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface EpochMetric {
  epoch: number;
  timestamp: string;
  is_best: boolean;
  metrics: Record<string, number>;
}

export interface ModelVersion {
  id: number;
  version: string | number;
}

export interface TrainingSession {
  id: string;
  session_id: string;
  modelName: string;
  projectName: string;
  modelVersionId: string;
  modelVersionName: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  duration?: string;
  estimatedTimeRemaining?: string;
  computeResource?: string;
  triggeredBy?: string;
  currentMetrics?: Record<string, number>;
  bestMetrics?: Record<string, number>;
  configuration?: Record<string, string | number | boolean>;
  logs?: string[];
  errorMessage?: string;
  errorTraceback?: string;
  epochMetrics?: EpochMetric[];
  // Backward compat for hooks that use model_version.id
  model_version: ModelVersion;
}

export interface Project {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  name: string;
}
