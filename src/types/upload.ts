


export type TaskType = 'segmentation' | 'detection' | 'classification';
export type ProjectSection = 'upload' | 'annotate' | 'dataset' | 'versions' | 'analytics';

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  tasks: TaskType[];
  uploadedAt: Date;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  batchId?: string;
}

export interface AnnotationFile {
  id: string;
  file: File;
  taskType: TaskType;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}