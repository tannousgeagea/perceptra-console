
export type ModelSize = 'nano' | 'small' | 'medium' | 'large' | 'xlarge';

export type ModelType =
  | 'classification'
  | 'object-detection'
  | 'segmentation'
  | 'llm'
  | 'vlm';

export type ModelStatus = 
  | 'draft' 
  | 'training' 
  | 'trained' 
  | 'failed' 
  | 'deployed';

export type VersionTag = 
  | 'production' 
  | 'staging' 
  | 'baseline' 
  | 'experimental';

export type ModelTask = 
  | 'classification' 
  | 'object-detection' 
  | 'segmentation' 
  | 'llm' 
  | 'vlm';

export type ModelFramework = 
  | 'yolo'
  | 'pytorch'
  | 'tensorflow'
  | 'onnx'
  | 'custom';

export type DeploymentStatus =
  | 'not_deployed'
  | 'staging'
  | 'production'
  | 'retired'
  | 'deploying'
  | 'deployed'
  | 'failed';

// Champion/challenger evaluation
export interface ModelEvaluation {
  evaluation_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  challenger_version_id: string | null;
  champion_version_id: string | null;
  challenger_metrics: Record<string, number>;
  champion_metrics: Record<string, number>;
  improvement_delta: number | null;
  recommendation: 'promote' | 'keep_champion' | 'inconclusive' | null;
  auto_promoted: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface ModelEvaluationList {
  count: number;
  results: ModelEvaluation[];
}

// Retraining policy
export interface RetrainingPolicy {
  policy_id: string;
  model_id: string;
  is_active: boolean;
  trigger_type: 'annotation_count' | 'correction_rate' | 'time_elapsed' | 'combined';
  min_new_annotations: number;
  min_correction_rate: number | null;
  max_days_since_training: number | null;
  lookback_days: number;
  auto_create_dataset_version: boolean;
  auto_submit_training: boolean;
  compute_profile_id: string | null;
  min_hours_between_runs: number;
  last_triggered_at: string | null;
  created_at: string;
}

export interface RetrainingPolicyCreate {
  trigger_type?: string;
  min_new_annotations?: number;
  min_correction_rate?: number | null;
  max_days_since_training?: number | null;
  lookback_days?: number;
  auto_create_dataset_version?: boolean;
  auto_submit_training?: boolean;
  compute_profile_id?: string | null;
  min_hours_between_runs?: number;
}

export interface Dataset {
  id: string;
  name: string;
  version?: string;
  itemCount?: number;
  createdAt?: string;
}

export interface ModelArtifacts {
  checkpoint?: string;
  onnx?: string;
  logs?: string;
  weights?: string;
}

export interface TrainingConfig {
  batchSize?: number;
  learningRate?: number;
  epochs?: number;
  optimizer?: string;
  scheduler?: string;
  [key: string]: any;
}

export interface ModelFormData {
  name: string;
  description: string;
  task: ModelTask | "";
  framework: string;
  modelSize: ModelSize | "";
  tags: string[];
  config: {
    batchSize: number;
    learningRate: number;
    epochs: number;
    optimizer: string;
    scheduler: string;
  };
}

export interface ModelCreateRequest {
  name: string;
  description?: string;
  task: string;
  framework: string;
  tags?: string[];
  config: {
    batchSize: number;
    learningRate: number;
    epochs: number;
    optimizer: string;
    scheduler: string;
  };
}

export interface ModelUpdateRequest {
  name?: string;
  description?: string;
  tags?: string[];
  config?: Record<string, any>;
}

export interface ModelItem {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  accuracy: number;
  speed: 'fast' | 'medium' | 'slow';
  version_id?: string;
}

export interface ModelArtifact {
  checkpoint?: string;
  onnx?: string;
  logs?: string;
}

export interface DatasetInfo {
  id: string;
  name: string;
  version: string;
  item_count: number;
  created_at: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  type: ModelType;
  task: ModelTask;
  framework: ModelFramework;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  projectId: string;
  projectName?: string;
  versions: ModelVersion[];
  latestVersion?: ModelVersion;
  productionVersion?: ModelVersion;
  currentProductionVersion?: string;
  tags: string[];
}

export interface ModelVersion {
  id: string;
  version_number: number;
  version_name?: string;
  status: string;
  deployment_status: string;
  model_size?: string;
  metrics: Record<string, any>;
  config: Record<string, any>;
  dataset?: DatasetInfo;
  artifacts: ModelArtifact;
  tags: VersionTag[];
  created_by?: string;
  created_at: string;
  deployed_at?: string;
}

export interface ModelDetail {
  id: string;
  name: string;
  description: string;
  task: ModelTask;
  framework: string;
  tags: string[];
  project_id: string;
  project_name: string;
  versions: ModelVersion[];
  latest_version?: ModelVersion;
  production_version?: ModelVersion;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ModelListItem {
  id: string;
  name: string;
  description: string;
  task: ModelTask;
  framework: string;
  tags: string[];
  version_count: number;
  latest_version_number?: number;
  latest_status?: string;
  latest_version_model_size?: string;
  has_production_version?: boolean;
  production_version_number?: number;
  production_version_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingTriggerRequest {
  dataset_version_id: string;
  parent_version_id?: string | null;
  config?: Record<string, any>;
  version_name?: string;
  compute_profile_id?: string;
}

export interface TrainingTriggerResponse {
  model_version_id: string;
  version_number: number;
  training_session_id: string;
  task_id: string;
  status: string;
  message: string;
  compute_provider: string;
  instance_type: string;
}

// Training session for progress tracking
export interface TrainingSession {
  id: string;
  modelVersionId: string;
  status: 'queued' | 'initializing' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  currentStep?: number;
  totalSteps?: number;
  metrics: Record<string, number>;
  logs: TrainingLogEntry[];
  startedAt?: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface TrainingLogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  epoch?: number;
  step?: number;
  metrics?: Record<string, number>;
}

// Compute profiles
export interface ComputeProfile {
  id: string;
  name: string;
  description: string;
  instanceType: string;
  gpuType?: string;
  gpuCount?: number;
  isDefault: boolean;
}

// Upload version types
export interface UploadVersionRequest {
  version_name?: string;
  metrics?: Record<string, number>;
  config?: TrainingConfig;
  dataset_id?: string;
}

// Mock compute profiles
export const ComputeProfiles: ComputeProfile[] = [
  {
    id: "compute-001",
    name: "Standard GPU",
    description: "Single NVIDIA T4 GPU, suitable for most training tasks",
    instanceType: "n1-standard-8",
    gpuType: "NVIDIA T4",
    gpuCount: 1,
    isDefault: true
  },
  {
    id: "compute-002",
    name: "High Performance",
    description: "NVIDIA A100 GPU for large models and fast training",
    instanceType: "a2-highgpu-1g",
    gpuType: "NVIDIA A100",
    gpuCount: 1,
    isDefault: false
  },
  {
    id: "compute-003",
    name: "Multi-GPU",
    description: "4x NVIDIA V100 GPUs for distributed training",
    instanceType: "n1-highmem-32",
    gpuType: "NVIDIA V100",
    gpuCount: 4,
    isDefault: false
  },
  {
    id: "compute-004",
    name: "CPU Only",
    description: "No GPU, for lightweight models or testing",
    instanceType: "n1-standard-4",
    gpuType: undefined,
    gpuCount: 0,
    isDefault: false
  }
];