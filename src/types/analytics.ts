export interface UserAnalytics {
  userId: string;
  userName: string;
  userRole: string;
  date: string; // ISO date string
  annotatedCount: number;
  reviewedCount: number;
  completedCount: number;
  totalTime?: number; // in minutes
}

export interface AnalyticsKPIs {
  totalAnnotationsThisWeek: number;
  totalReviewsThisWeek: number;
  totalCompletionsThisWeek: number;
  topPerformer: {
    userId: string;
    userName: string;
    score: number;
  };
  averageCompletionTimeMinutes: number;
}

export interface AnalyticsFilters {
  timeFrame: 'day' | 'week' | 'month';
  projectId?: string;
  role?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  selectedUsers?: string[];
  showTopPerformersOnly?: boolean;
}

export interface ChartDataPoint {
  date: string;
  [userId: string]: string | number;
}

// Image analytics types
export interface UserImageAnalytics {
  userId: string;
  userName: string;
  userRole: string;
  date: string;
  annotatedImages: number;
  reviewedImages: number;
  finalizedImages: number;
  unannotatedImages: number;
  nullMarkedImages: number;
  totalImagesWorked: number;
  averageImagesPerJob: number;
}

export interface ImageAnalyticsKPIs {
  totalAnnotatedThisWeek: number;
  totalReviewedThisWeek: number;
  totalFinalizedThisWeek: number;
  totalImagesInProgress: number;
  topPerformer: {
    userId: string;
    userName: string;
    score: number;
    finalizedCount: number;
  };
  averageImagesPerUser: number;
  imageCompletionRate: number;
}

export interface ImageAnalyticsResponse {
  data: UserImageAnalytics[];
  kpis: ImageAnalyticsKPIs;
}

export interface ImageStatusBreakdown {
  unannotated: number;
  annotated: number;
  reviewed: number;
  dataset: number;
  total: number;
}

export interface ImageAnalyticsFilters extends AnalyticsFilters {
  status?: string;
}

export interface UserImagePerformance {
  userId: string;
  userName: string;
  userRole: string;
  imageStats: {
    total_images: number;
    annotated: number;
    reviewed: number;
    finalized: number;
    null_marked: number;
  };
  jobStats: {
    total_jobs: number;
    completed_jobs: number;
    in_review_jobs: number;
    avg_images_per_job: number;
  };
  timeFrame: string;
  dateRange: {
    start: string;
    end: string;
  };
}