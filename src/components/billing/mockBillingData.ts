import { BillingRateCard, BillingReport } from "@/types/billing";

export const mockRateCards: BillingRateCard[] = [
  {
    rate_card_id: "rc-001",
    organization_id: 1,
    organization_name: "DataAnnotation Corp",
    project_id: "550e8400-e29b-41d4-a716-446655440001",
    project_name: "Urban Traffic Analysis",
    name: "Standard Traffic Annotation Rates",
    currency: "USD",
    is_active: true,
    rate_new_annotation: 0.25,
    rate_untouched_prediction: 0.05,
    rate_minor_edit: 0.10,
    rate_major_edit: 0.20,
    rate_class_change: 0.15,
    rate_deletion: 0.08,
    rate_missed_object: 0.30,
    rate_image_review: 0.12,
    rate_annotation_review: 0.15,
    quality_bonus_threshold: 95,
    quality_bonus_multiplier: 1.2,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    created_by_username: "admin"
  },
  {
    rate_card_id: "rc-002",
    organization_id: 1,
    organization_name: "DataAnnotation Corp",
    name: "Organization-Wide Default Rates",
    currency: "USD",
    is_active: true,
    rate_new_annotation: 0.20,
    rate_untouched_prediction: 0.04,
    rate_minor_edit: 0.08,
    rate_major_edit: 0.18,
    rate_class_change: 0.12,
    rate_deletion: 0.06,
    rate_missed_object: 0.25,
    rate_image_review: 0.10,
    rate_annotation_review: 0.12,
    quality_bonus_threshold: 90,
    quality_bonus_multiplier: 1.15,
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-10T09:00:00Z",
    created_by_username: "admin"
  },
  {
    rate_card_id: "rc-003",
    organization_id: 1,
    organization_name: "DataAnnotation Corp",
    project_id: "550e8400-e29b-41d4-a716-446655440002",
    project_name: "Retail Inventory Detection",
    name: "Premium Retail Rates",
    currency: "USD",
    is_active: true,
    rate_new_annotation: 0.30,
    rate_untouched_prediction: 0.06,
    rate_minor_edit: 0.12,
    rate_major_edit: 0.25,
    rate_class_change: 0.18,
    rate_deletion: 0.10,
    rate_missed_object: 0.35,
    rate_image_review: 0.15,
    rate_annotation_review: 0.18,
    quality_bonus_threshold: 98,
    quality_bonus_multiplier: 1.3,
    created_at: "2024-02-01T11:00:00Z",
    updated_at: "2024-02-01T11:00:00Z",
    created_by_username: "admin"
  },
  {
    rate_card_id: "rc-004",
    organization_id: 1,
    organization_name: "DataAnnotation Corp",
    project_id: "550e8400-e29b-41d4-a716-446655440001",
    project_name: "Urban Traffic Analysis",
    name: "Legacy Traffic Rates (Inactive)",
    currency: "USD",
    is_active: false,
    rate_new_annotation: 0.15,
    rate_untouched_prediction: 0.03,
    rate_minor_edit: 0.07,
    rate_major_edit: 0.14,
    rate_class_change: 0.10,
    rate_deletion: 0.05,
    rate_missed_object: 0.20,
    rate_image_review: 0.08,
    rate_annotation_review: 0.10,
    created_at: "2023-12-01T08:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    created_by_username: "admin"
  }
];

export const mockBillingReport: BillingReport = {
  period_start: "2024-03-01",
  period_end: "2024-03-31",
  total_actions: 1247,
  total_amount: 289.45,
  currency: "USD",
  breakdown: [
    {
      action_type: "new_annotation",
      quantity: 543,
      unit_rate: 0.25,
      total_amount: 135.75
    },
    {
      action_type: "untouched_prediction",
      quantity: 312,
      unit_rate: 0.05,
      total_amount: 15.60
    },
    {
      action_type: "minor_edit",
      quantity: 187,
      unit_rate: 0.10,
      total_amount: 18.70
    },
    {
      action_type: "major_edit",
      quantity: 98,
      unit_rate: 0.20,
      total_amount: 19.60
    },
    {
      action_type: "class_change",
      quantity: 45,
      unit_rate: 0.15,
      total_amount: 6.75
    },
    {
      action_type: "deletion",
      quantity: 34,
      unit_rate: 0.08,
      total_amount: 2.72
    },
    {
      action_type: "missed_object",
      quantity: 28,
      unit_rate: 0.30,
      total_amount: 8.40
    },
    {
      action_type: "image_review",
      quantity: 687,
      unit_rate: 0.12,
      total_amount: 82.44
    }
  ]
};
