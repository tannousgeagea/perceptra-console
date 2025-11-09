import { useQuery } from "@tanstack/react-query";
import type {
  ProjectSummary,
  ImageStats,
  AnnotationStats,
  AnnotationGroup,
  JobStats,
  VersionStats,
  EvaluationStats,
} from "@/types/analytics";

// Mock data for development
const mockProjectSummary: ProjectSummary = {
  project_id: "proj_123",
  project_name: "Vehicle Detection Dataset",
  description: "Comprehensive dataset for vehicle detection and classification",
  project_type: "object_detection",
  visibility: "private",
  created_at: "2024-01-15T10:00:00Z",
  last_edited: "2024-03-20T15:30:00Z",
  total_images: 5420,
  annotated_images: 4890,
  reviewed_images: 3200,
  finalized_images: 2800,
  null_images: 530,
  total_annotations: 28450,
  manual_annotations: 24200,
  prediction_annotations: 4250,
  total_jobs: 12,
  active_jobs: 3,
  completed_jobs: 8,
  total_versions: 5,
  latest_version: "v2.1-prod",
};

const mockImageStats: ImageStats = {
  total: 5420,
  by_status: {
    annotated: 4890,
    reviewed: 3200,
    finalized: 2800,
    pending: 530,
  },
  by_split: {
    train: 3794,
    val: 1084,
    test: 542,
  },
  by_job_status: {
    completed: 3800,
    in_progress: 1090,
    pending: 530,
  },
  upload_trend: [
    { date: "2024-06-01", count: 42 },
    { date: "2024-06-02", count: 38 },
    { date: "2024-06-03", count: 55 },
    { date: "2024-06-04", count: 48 },
    { date: "2024-06-05", count: 62 },
    { date: "2024-06-06", count: 45 },
    { date: "2024-06-07", count: 51 },
    { date: "2024-06-08", count: 58 },
    { date: "2024-06-09", count: 44 },
    { date: "2024-06-10", count: 67 },
    { date: "2024-06-11", count: 72 },
    { date: "2024-06-12", count: 53 },
    { date: "2024-06-13", count: 49 },
    { date: "2024-06-14", count: 61 },
    { date: "2024-06-15", count: 68 },
    { date: "2024-06-16", count: 54 },
    { date: "2024-06-17", count: 59 },
    { date: "2024-06-18", count: 63 },
    { date: "2024-06-19", count: 71 },
    { date: "2024-06-20", count: 66 },
    { date: "2024-06-21", count: 58 },
    { date: "2024-06-22", count: 52 },
    { date: "2024-06-23", count: 64 },
    { date: "2024-06-24", count: 69 },
    { date: "2024-06-25", count: 75 },
    { date: "2024-06-26", count: 70 },
    { date: "2024-06-27", count: 65 },
    { date: "2024-06-28", count: 73 },
    { date: "2024-06-29", count: 68 },
    { date: "2024-06-30", count: 77 },
  ],
  average_dimensions: {
    width: 1920,
    height: 1080,
  },
  average_file_size_mb: 2.4,
};

const mockAnnotationStats: AnnotationStats = {
  total: 28450,
  active: 26800,
  inactive: 1650,
  by_source: {
    manual: 24200,
    prediction: 4250,
  },
  by_status: {
    approved: 22400,
    pending_review: 4200,
    rejected: 1850,
  },
  average_per_image: 5.25,
  class_distribution: [
    { class_id: 1, class_name: "car", color: "#3b82f6", count: 12450, percentage: 43.8 },
    { class_id: 2, class_name: "truck", color: "#10b981", count: 6890, percentage: 24.2 },
    { class_id: 3, class_name: "bus", color: "#f59e0b", count: 4320, percentage: 15.2 },
    { class_id: 4, class_name: "motorcycle", color: "#ef4444", count: 3140, percentage: 11.0 },
    { class_id: 5, class_name: "bicycle", color: "#8b5cf6", count: 1650, percentage: 5.8 },
  ],
};

const mockAnnotationGroups: AnnotationGroup[] = [
  {
    id: 1,
    name: "Vehicles",
    description: "All vehicle types",
    classes: mockAnnotationStats.class_distribution,
    total_annotations: 28450,
  },
];

const mockJobStats: JobStats = {
  total: 12,
  by_status: {
    completed: 8,
    in_progress: 3,
    pending: 1,
  },
  total_images: 5420,
  average_images_per_job: 451.7,
  completion_rate: 70.8,
};

const mockVersionStats: VersionStats[] = [
  {
    id: "v1",
    version_name: "v1.0-initial",
    version_number: 1,
    export_format: "yolo",
    export_status: "completed",
    total_images: 2000,
    by_split: { train: 1400, val: 400, test: 200 },
    total_annotations: 10500,
    file_size_mb: 4800,
    created_at: "2024-01-20T10:00:00Z",
    exported_at: "2024-01-20T12:30:00Z",
  },
  {
    id: "v2",
    version_name: "v2.0-expanded",
    version_number: 2,
    export_format: "coco",
    export_status: "completed",
    total_images: 3500,
    by_split: { train: 2450, val: 700, test: 350 },
    total_annotations: 18375,
    file_size_mb: 8400,
    created_at: "2024-02-15T14:00:00Z",
    exported_at: "2024-02-15T16:45:00Z",
  },
];

const mockEvaluationStats: EvaluationStats = {
  total_evaluated: 542,
  true_positives: 2847,
  false_positives: 156,
  false_negatives: 203,
  precision: 0.948,
  recall: 0.933,
  f1_score: 0.941,
  by_class: [
    { class_name: "car", precision: 0.965, recall: 0.952, f1_score: 0.958 },
    { class_name: "truck", precision: 0.941, recall: 0.928, f1_score: 0.934 },
    { class_name: "bus", precision: 0.938, recall: 0.915, f1_score: 0.926 },
    { class_name: "motorcycle", precision: 0.932, recall: 0.918, f1_score: 0.925 },
    { class_name: "bicycle", precision: 0.918, recall: 0.902, f1_score: 0.910 },
  ],
};

export const useProjectSummary = () => {
  return useQuery({
    queryKey: ["analytics", "project-summary"],
    queryFn: async () => {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockProjectSummary;
    },
  });
};

export const useImageStats = () => {
  return useQuery({
    queryKey: ["analytics", "image-stats"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockImageStats;
    },
  });
};

export const useAnnotationStats = () => {
  return useQuery({
    queryKey: ["analytics", "annotation-stats"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockAnnotationStats;
    },
  });
};

export const useAnnotationGroups = () => {
  return useQuery({
    queryKey: ["analytics", "annotation-groups"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockAnnotationGroups;
    },
  });
};

export const useJobStats = () => {
  return useQuery({
    queryKey: ["analytics", "job-stats"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockJobStats;
    },
  });
};

export const useVersionStats = () => {
  return useQuery({
    queryKey: ["analytics", "version-stats"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockVersionStats;
    },
  });
};

export const useEvaluationStats = () => {
  return useQuery({
    queryKey: ["analytics", "evaluation-stats"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockEvaluationStats;
    },
  });
};
