export interface BillingRateCard {
  rate_card_id: string;
  organization_id: number;
  organization_name: string;
  project_id?: string;
  project_name?: string;
  name: string;
  currency: string;
  is_active: boolean;
  rate_new_annotation: number;
  rate_untouched_prediction: number;
  rate_minor_edit: number;
  rate_major_edit: number;
  rate_class_change: number;
  rate_deletion: number;
  rate_missed_object: number;
  rate_image_review: number;
  rate_annotation_review: number;
  quality_bonus_threshold?: number;
  quality_bonus_multiplier?: number;
  created_at: string;
  updated_at: string;
  created_by_username?: string;
}

export interface BillingRateCardCreate {
  name: string;
  project_id?: string;
  currency: string;
  rate_new_annotation: number;
  rate_untouched_prediction: number;
  rate_minor_edit: number;
  rate_major_edit: number;
  rate_class_change: number;
  rate_deletion: number;
  rate_missed_object: number;
  rate_image_review: number;
  rate_annotation_review: number;
  quality_bonus_threshold?: number;
  quality_bonus_multiplier?: number;
}

export interface BillableActionSummary {
  action_type: string;
  quantity: number;
  unit_rate: number;
  total_amount: number;
}

export interface BillingReport {
  period_start: string;
  period_end: string;
  total_actions: number;
  total_amount: number;
  currency: string;
  breakdown: BillableActionSummary[];
}

export type ActionType = 
  | 'new_annotation'
  | 'untouched_prediction'
  | 'minor_edit'
  | 'major_edit'
  | 'class_change'
  | 'deletion'
  | 'missed_object'
  | 'image_review'
  | 'annotation_review';

export interface UpdateRateCardPayload {
  name?: string;
  is_active?: boolean;
  currency?: string;
  rate_new_annotation?: number;
  rate_untouched_prediction?: number;
  rate_minor_edit?: number;
  rate_major_edit?: number;
  rate_class_change?: number;
  rate_deletion?: number;
  rate_missed_object?: number;
  rate_image_review?: number;
  rate_annotation_review?: number;
  quality_bonus_threshold?: number | null;
  quality_bonus_multiplier?: number | null;
}

export interface BillingReportFilters {
  project_id?: string;
  user_id?: string;
  start_date?: string; // ISO date string (YYYY-MM-DD)
  end_date?: string;   // ISO date string (YYYY-MM-DD)
}