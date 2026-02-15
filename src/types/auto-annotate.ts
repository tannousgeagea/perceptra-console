export interface AIModel {
  id: string;
  name: string;
  version: string;
  supportedTypes: AnnotationType[];
  description: string;
  accuracy: number;
}

export type AnnotationType = 'bounding-box' | 'polygon' | 'segmentation' | 'classification';

export interface LabelConfig {
  name: string;
  color: string;
  aliases?: string[];
}

export interface AutoAnnotateSession {
  id: string;
  status: 'pending' | 'processing' | 'paused' | 'completed' | 'cancelled' | 'failed';
  modelId: string;
  modelName: string;
  labels: string[];
  totalImages: number;
  processedImages: number;
  successCount: number;
  failedCount: number;
  totalAnnotationsCreated: number;
  startedAt: string;
  completedAt?: string;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  currentImageName?: string;
  currentImageUrl?: string;
  initiatedBy: string;
}

export interface GeneratedAnnotation {
  id: string;
  imageId: string;
  imageName: string;
  imageUrl: string;
  label: string;
  type: AnnotationType;
  confidence: number;
  reviewStatus: 'pending' | 'accepted' | 'rejected';
  data: Record<string, any>;
  sessionId: string;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  sessionId: string;
  date: string;
  user: string;
  modelName: string;
  imageCount: number;
  annotationsCreated: number;
  successRate: number;
  status: 'completed' | 'failed' | 'cancelled';
}

export type AutoAnnotateStep = 'select' | 'configure' | 'confirm' | 'processing' | 'review' | 'complete';
