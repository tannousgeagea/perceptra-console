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

// #######################################################
// New Analytics
// #######################################################
export interface ProjectSummary {
  project_id: string;
  project_name: string;
  description: string | null;
  project_type: string;
  visibility: string;
  created_at: string;
  last_edited: string;
  
  // Image stats
  total_images: number;
  annotated_images: number;
  reviewed_images: number;
  finalized_images: number;
  null_images: number;
  
  // Annotation stats
  total_annotations: number;
  manual_annotations: number;
  prediction_annotations: number;
  
  // Job stats
  total_jobs: number;
  active_jobs: number;
  completed_jobs: number;
  
  // Version stats
  total_versions: number;
  latest_version: string | null;
}

export interface ImageStats {
  total: number;
  by_status: Record<string, number>;
  by_split: Record<string, number>;
  by_job_status: Record<string, number>;
  upload_trend: Array<{
    date: string;
    count: number;
  }>;
  average_dimensions: {
    width: number;
    height: number;
  };
  average_file_size_mb: number;
}

export interface ClassDistribution {
  class_id: number;
  class_name: string;
  color: string;
  count: number;
  percentage: number;
}

export interface AnnotationStats {
  total: number;
  active: number;
  inactive: number;
  by_source: Record<string, number>;
  by_status: Record<string, number>;
  average_per_image: number;
  class_distribution: ClassDistribution[];
}

export interface AnnotationGroup {
  id: number;
  name: string;
  description: string | null;
  classes: ClassDistribution[];
  total_annotations: number;
}

export interface JobStats {
  total: number;
  by_status: Record<string, number>;
  total_images: number;
  average_images_per_job: number;
  completion_rate: number;
}

export interface VersionStats {
  id: string;
  version_name: string;
  version_number: number;
  export_format: string;
  export_status: string;
  total_images: number;
  by_split: Record<string, number>;
  total_annotations: number;
  file_size_mb: number | null;
  created_at: string;
  exported_at: string | null;
}

export interface EvaluationStats {
  total_evaluated: number;
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  precision: number;
  recall: number;
  f1_score: number;
  by_class: Array<{
    class_name: string;
    precision: number;
    recall: number;
    f1_score: number;
  }>;
}
