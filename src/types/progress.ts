export interface UserProgress {
  userId: string;
  userName: string;
  userRole: string;
  avatarUrl?: string;
  totalImages: number;
  annotatedImages: number;
  reviewedImages: number;
  completedImages: number;
  progressPercentage: number;
  lastUpdated: Date;
  assignedJobs: {
    jobId: string;
    jobName: string;
    totalImages: number;
    annotatedImages: number;
    reviewedImages: number;
    completedImages: number;
  }[];
}

export interface ProgressSummary {
  totalActiveUsers: number;
  averageProgress: number;
  totalImagesInProgress: number;
  totalImagesCompleted: number;
}