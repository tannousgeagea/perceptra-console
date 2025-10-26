export type Status = 'running' | 'completed' | 'failed' | 'pending';

interface MetricPoint {
  epoch: number;
  [key: string]: number;
}

interface ModelVersion {
  id: number;
  version: number;
} 

export interface TrainingSession {
  id: string;
  modelName: string;
  projectName: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  progress: number;
  metrics?: {
    accuracy?: number;
    f1Score?: number;
    precision?: number;
    recall?: number;
    [key: string]: number | undefined;
  };
  configuration?: {
    epochs: number;
    batchSize: number;
    learningRate: number;
    optimizer: string;
    [key: string]: number | string;
  };
  logs?: string[];
  model_version: ModelVersion;
  metricsData?: MetricPoint[]
}

export interface Project {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  name: string;
}