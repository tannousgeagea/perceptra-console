


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
  /** What the server did with it (set on success). */
  outcome?: UploadOutcome;
}

/** new: stored now; added_to_project: the organisation had it, linked now;
 *  already_in_project / already_in_datalake: nothing to do. */
export type UploadOutcome = 'new' | 'added_to_project' | 'already_in_project' | 'already_in_datalake';

/** Where the current selection goes: a project, or the data lake (projectId null). */
export interface UploadTarget {
  projectId: string | null;
  /** Shown in the tray ("to Conveyor QA"); "the data lake" when there's no project. */
  label: string;
  /** The upload page for this target (the tray links back to it). */
  path: string;
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