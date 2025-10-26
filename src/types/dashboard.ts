// Project Types
export interface Project {
    id: number;
    name: string;
    description: string;
    type: string;
    visibility_level: string;
    created_at: string;
    updated_at: string;
    current_version: Version;
    metadata: Record<string, any>;
  }
  
  export interface ProjectStats {
    total_images: number;
    annotated_images: number;
    reviewed_images: number;
    finalized_images: number;
  }
  
  // Image Types
  export interface ImageStats {
    total: number;
    status_breakdown: {
      unannotated: number;
      annotated: number;
      reviewed: number;
      dataset: number;
      null_marked: number;
    };
    upload_trend: {
      date: string;
      count: number;
    }[];
  }
  
  // Annotation Types
  export interface AnnotationClass {
    id: number;
    name: string;
    color: string;
    count: number;
  }
  
  export interface AnnotationStats {
    total: number;
    class_distribution: AnnotationClass[];
    source_breakdown: {
      manual: number;
      model_generated: number;
    };
    review_status: {
      pending: number;
      approved: number;
      rejected: number;
    };
    average_per_image: number;
  }
  
  export interface AnnotationGroup {
    id: number;
    name: string;
    classes: AnnotationClass[];
  }
  
  // Version Types
  export interface Version {
    id: number;
    version_number: string;
    description: string;
    created_at: string;
    image_count: number;
    download_url?: string;
  }
  
  // Augmentation Types
  export interface AugmentationStats {
    total: number;
    types: {
      name: string;
      count: number;
    }[];
    version_distribution: {
      version_id: number;
      version_number: string;
      count: number;
    }[];
  }
  
  // Filter Types
  export interface Filters {
    dateRange: {
      start: string | null;
      end: string | null;
    };
    annotationSource: 'all' | 'manual' | 'model';
    version: number | null;
    annotationGroup: number | null;
    annotationClass: number | null;
  }
  

  export interface EvaluationStats {
    total: number;
    tp: number;
    fp: number;
    fn: number;
    precision: number;
    recall: number;
    f1_score: number;
    mean_average_precision: number;
    confusion_matrix: {
      class_name: string;
      TP: number;
      FP: number;
      FN: number;
    }[];
  }