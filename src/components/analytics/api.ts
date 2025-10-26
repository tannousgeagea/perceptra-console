import { 
    Project, 
    ProjectStats, 
    ImageStats, 
    AnnotationStats, 
    Version, 
    AugmentationStats,
    AnnotationGroup,
    EvaluationStats
  } from "@/types/dashboard";
  
  const API_URL = import.meta.env.VITE_API_URL || "https://api.example.com";
  
  // Simulate API calls with mock data for now
  export const fetchProjectSummary = async (projectId: string): Promise<Project> => {
    // In a real implementation, this would be:
    return fetch(`${API_URL}/api/v1/analytics/summary?project_id=${projectId}`).then(res => res.json());
    
    // Mock data
    // return {
    //   id: projectId,
    //   name: "Traffic Sign Detection",
    //   description: "Computer vision project for detecting and classifying traffic signs in urban environments",
    //   type: "Object Detection",
    //   visibility_level: "Team",
    //   created_at: "2023-12-15T10:30:00Z",
    //   updated_at: "2024-04-01T14:45:00Z",
    //   current_version: {
    //     id: 5,
    //     version_number: "v1.4.2",
    //     description: "Added 500 new annotated night-time images",
    //     created_at: "2024-03-28T09:15:00Z",
    //     image_count: 4250
    //   },
    //   metadata: {
    //     "location": "Urban settings",
    //     "capture_device": "Multiple cameras",
    //     "weather_conditions": "Varied",
    //     "time_of_day": "Day and Night",
    //     "resolution": "1080p and 4K"
    //   }
    // };
  };
  
  export const fetchProjectStats = async (projectId: string): Promise<ProjectStats> => {
    return fetch(`${API_URL}/api/v1/analytics/stats?project_id=${projectId}`).then(res => res.json());
    // Mock data
    // return {
    //   total_images: 4250,
    //   annotated_images: 3980,
    //   reviewed_images: 3650,
    //   finalized_images: 3500
    // };
  };
  
  export const fetchImageStats = async (projectId: string): Promise<ImageStats> => {
    return fetch(`${API_URL}/api/v1/analytics/imagestats?project_id=${projectId}`).then(res => res.json());
    // Mock data
    // return {
    //   total: 4250,
    //   status_breakdown: {
    //     unannotated: 270,
    //     annotated: 330,
    //     reviewed: 150,
    //     dataset: 3500,
    //     null_marked: 45
    //   },
    //   upload_trend: [
    //     { date: "2024-01-01", count: 1500 },
    //     { date: "2024-02-01", count: 850 },
    //     { date: "2024-03-01", count: 1200 },
    //     { date: "2024-04-01", count: 700 }
    //   ]
    // };
  };
  
  export const fetchAnnotationStats = async (projectId: string): Promise<AnnotationStats> => {
    return fetch(`${API_URL}/api/v1/analytics/annotationstats?project_id=${projectId}`).then(res => res.json());
    // Mock data
    // return {
    //   total: 15680,
    //   class_distribution: [
    //     { id: 1, name: "Stop Sign", color: "#FF5252", count: 3250 },
    //     { id: 2, name: "Yield", color: "#FFD740", count: 2800 },
    //     { id: 3, name: "Speed Limit", color: "#40C4FF", count: 4300 },
    //     { id: 4, name: "No Entry", color: "#E040FB", count: 1950 },
    //     { id: 5, name: "One Way", color: "#69F0AE", count: 2100 },
    //     { id: 6, name: "Traffic Light", color: "#FF6E40", count: 1280 }
    //   ],
    //   source_breakdown: {
    //     manual: 9408,
    //     model_generated: 6272
    //   },
    //   review_status: {
    //     pending: 2352,
    //     approved: 12230,
    //     rejected: 1098
    //   },
    //   average_per_image: 3.69
    // };
  };
  
  export const fetchEvaluationStats = async (projectId: string): Promise<EvaluationStats> => {
    return fetch(`${API_URL}/api/v1/analytics/evaluationstats?project_id=${projectId}`).then(res => res.json());
    // Mock data
  //   return {
  //     total: 500,
  //     tp: 320,
  //     fp: 80,
  //     fn: 100,
  //     precision: 0.80,
  //     recall: 0.76,
  //     f1_score: 0.78,
  //     mean_average_precision: 0.74,
  //     confusion_matrix: [
  //       { class: 'Plastic', TP: 100, FP: 20, FN: 10 },
  //       { class: 'Metal', TP: 90, FP: 15, FN: 25 },
  //       { class: 'Wood', TP: 60, FP: 30, FN: 40 },
  //       { class: 'Glass', TP: 70, FP: 15, FN: 25 },
  //     ],
  // };
  };

  export const fetchVersions = async (projectId: string): Promise<Version[]> => {
    return fetch(`${API_URL}/api/v1/analytics/versions?project_id=${projectId}`).then(res => res.json());
    // Mock data
    // return [
    //   {
    //     id: 5,
    //     version_number: "v1.4.2",
    //     description: "Added 500 new annotated night-time images",
    //     created_at: "2024-03-28T09:15:00Z",
    //     image_count: 4250,
    //     download_url: "#"
    //   },
    //   {
    //     id: 4,
    //     version_number: "v1.3.0",
    //     description: "Major update with urban intersection images",
    //     created_at: "2024-02-15T11:20:00Z",
    //     image_count: 3750,
    //     download_url: "#"
    //   },
    //   {
    //     id: 3,
    //     version_number: "v1.2.5",
    //     description: "Added 250 rainy condition images",
    //     created_at: "2024-01-30T15:45:00Z",
    //     image_count: 3250,
    //     download_url: "#"
    //   },
    //   {
    //     id: 2,
    //     version_number: "v1.1.0",
    //     description: "Initial reviewed dataset",
    //     created_at: "2024-01-10T08:30:00Z",
    //     image_count: 3000,
    //     download_url: "#"
    //   },
    //   {
    //     id: 1,
    //     version_number: "v1.0.0",
    //     description: "Initial dataset",
    //     created_at: "2023-12-20T14:00:00Z",
    //     image_count: 2500,
    //     download_url: "#"
    //   }
    // ];
  };
  
  export const fetchAugmentationStats = async (projectId: string): Promise<AugmentationStats> => {
    return fetch(`${API_URL}/api/v1/analytics/augmentationgroups?project_id=${projectId}`).then(res => res.json());
    // Mock data
    // return {
    //   total: 8500,
    //   types: [
    //     { name: "Rotation", count: 2125 },
    //     { name: "Flip", count: 1700 },
    //     { name: "Brightness", count: 1275 },
    //     { name: "Contrast", count: 850 },
    //     { name: "Blur", count: 1275 },
    //     { name: "Noise", count: 1275 }
    //   ],
    //   version_distribution: [
    //     { version_id: 5, version_number: "v1.4.2", count: 1000 },
    //     { version_id: 4, version_number: "v1.3.0", count: 2250 },
    //     { version_id: 3, version_number: "v1.2.5", count: 1750 },
    //     { version_id: 2, version_number: "v1.1.0", count: 2000 },
    //     { version_id: 1, version_number: "v1.0.0", count: 1500 }
    //   ]
    // };
  };
  
  export const fetchAnnotationGroups = async (projectId: string): Promise<AnnotationGroup[]> => {
    return fetch(`${API_URL}/api/v1/analytics/annotationgroups?project_id=${projectId}`).then(res => res.json());
    // Mock data
    // return [
    //   {
    //     id: 1,
    //     name: "Traffic Signs",
    //     classes: [
    //       { id: 1, name: "Stop Sign", color: "#FF5252", count: 3250 },
    //       { id: 2, name: "Yield", color: "#FFD740", count: 2800 },
    //       { id: 3, name: "Speed Limit", color: "#40C4FF", count: 4300 },
    //       { id: 4, name: "No Entry", color: "#E040FB", count: 1950 }
    //     ]
    //   },
    //   {
    //     id: 2,
    //     name: "Road Markings",
    //     classes: [
    //       { id: 5, name: "One Way", color: "#69F0AE", count: 2100 },
    //       { id: 6, name: "Traffic Light", color: "#FF6E40", count: 1280 }
    //     ]
    //   }
    // ];
  };