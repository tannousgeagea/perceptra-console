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

// --------------------------------------
// Invoice Type
// --------------------------------------

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'cancelled';
export interface Invoice {
  invoice_id: string;
  invoice_number: string;
  vendor_organization_id: string;
  vendor_organization_name: string;
  client_organization_id: string;
  client_organization_name: string;
  project_id?: string;
  project_name?: string;
  period_start: string;
  period_end: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  total_annotations: number;
  total_reviews: number;
  total_actions: number;
  action_breakdown: BillableActionSummary[];
  status: InvoiceStatus;
  issued_at?: string;
  due_date?: string;
  paid_at?: string;
  notes: string;
  created_at: string;
}

// ---------------------------------------
// Contractor Type
// ---------------------------------------

export interface Contractor {
  user_id: string;
  username: string;
  full_name: string;
  email: string;
  is_external_annotator: boolean;
  billing_enabled: boolean;
  contractor_company?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  total_unbilled_amount: number;
  total_actions_this_month: number;
  rate_card_id?: string;
  rate_card_name?: string;
  hourly_rate?: number;
}
export interface ContractorConfig {
  is_external: boolean;
  billing_enabled: boolean;
  rate_card_id?: string;
  hourly_rate?: number;
  contractor_company?: string;
  backfill: boolean;
  contract_start_date?: string;
  contract_end_date?: string;
}

// ------------------------------------
// Backfill Types
// ------------------------------------
export interface BackfillRequest {
  start_date?: string;
  end_date?: string;
}
export interface BackfillTaskResponse {
  message: string;
  task_id: string;
  scope: 'organization' | 'project';
  user_id?: string;
  organization_id?: string;
  project_id?: string;
}
export type BackfillState = 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';
export interface TaskStatus {
  task_id: string;
  state: BackfillState;
  ready: boolean;
  result?: {
    total_events: number;
    created: number;
    skipped: number;
  };
  error?: string;
}

// -----------------------------------
// Billing summary types
// -----------------------------------
export interface UserBillingSummary {
  user_id: string;
  username: string;
  full_name: string;
  scope: 'organization' | 'project';
  scope_id: string;
  scope_name: string;
  is_external_annotator: boolean;
  billing_enabled: boolean;
  hourly_rate?: number;
  rate_card_id?: string;
  rate_card_name?: string;
  total_actions: number;
  total_amount: number;
  total_billed: number;
  total_unbilled: number;
  avg_rate?: number;
  action_breakdown: BillableActionSummary[];
  period_start?: string;
  period_end?: string;
}
export interface BillableAction {
  action_id: string;
  action_type: string;
  quantity: number;
  unit_rate: number;
  total_amount: number;
  is_billable: boolean;
  billed_at?: string;
  invoice_number?: string;
  created_at: string;
  project_id?: string;
  project_name?: string;
  metadata: Record<string, unknown>;
}