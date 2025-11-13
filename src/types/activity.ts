export interface UserSummary {
  user_id: string;
  username: string;
  full_name: string;
  total_annotations: number;
  manual_annotations: number;
  ai_predictions_edited: number;
  ai_predictions_accepted: number;
  images_reviewed: number;
  images_finalized: number;
  avg_annotation_time_seconds: number;
  avg_edit_magnitude: number;
  last_activity: string;
  total_sessions: number;
}

export interface ProjectProgress {
  project_id: string;
  project_name: string;
  total_images: number;
  images_unannotated: number;
  images_annotated: number;
  images_reviewed: number;
  images_finalized: number;
  completion_percentage: number;
  untouched_predictions: number;
  edited_predictions: number;
  rejected_predictions: number;
  prediction_acceptance_rate: number;
  annotations_per_hour: number;
  active_contributors: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  full_name: string;
  metric_value: number;
  percentage_of_total: number;
}

export interface TimelineEvent {
  event_id: string;
  event_type: string;
  user: string;
  timestamp: string;
  project: string;
  metadata: Record<string, unknown>;
}

export interface PredictionQuality {
  total_predictions: number;
  untouched: number;
  accepted_without_edit: number;
  minor_edits: number;
  major_edits: number;
  class_changes: number;
  rejected: number;
  untouched_percentage: number;
  acceptance_rate: number;
  avg_edit_magnitude: number;
}

export interface ActivityTrend {
  date: string;
  annotations: number;
  reviews: number;
  uploads: number;
}

// export type ActivityHeatmap = Record<string, Record<string, number>>;


export interface ActivityHeatmap {
  [date: string]: {
    [hour: string]: number;
  };
}