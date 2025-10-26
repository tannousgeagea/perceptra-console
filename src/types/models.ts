
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

export interface Dataset {
  id: string;
  name: string;
  itemCount?: number;
  createdAt?: string;
}


export interface ModelVersion {
  id: string;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  status: ModelStatus;
  metrics: Record<string, number>;
  tags: VersionTag[];
  config?: Record<string, any>;
  artifacts?: {
    onnx?: string;
    weights?: string;
    logs?: string;
  };
  datasetUsed?: Dataset | null;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  type: ModelType;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  projectId: string;
  versions: ModelVersion[];
  currentProductionVersion?: string;
  tags: string[];
}

export interface ModelItem {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  accuracy: number;
  speed: 'fast' | 'medium' | 'slow';
}