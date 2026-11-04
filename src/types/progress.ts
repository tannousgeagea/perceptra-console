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
  /** Review decisions on this member's work (they were the job assignee). */
  reviewsReceived?: number;
  /** How many of those sent the image back. */
  sentBack?: number;
  /** sentBack / reviewsReceived, in %; null until their work was reviewed. */
  rejectionRate?: number | null;
  /** Images currently waiting for their fixes. */
  openSentBack?: number;
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