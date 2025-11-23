export type SuggestionType = 'ai_generated' | 'similar_object' | 'label_suggestion' | 'propagated';

export type SuggestionStatus = 'pending' | 'accepted' | 'rejected';

export interface AnnotationData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PolygonData {
  points: Array<{ x: number; y: number }>;
}

export interface AnnotationSuggestion {
  id: string;
  type: SuggestionType;
  annotation_data: AnnotationData | PolygonData;
  confidence?: number;
  suggested_label?: string;
  suggested_class_id?: string;
  status: SuggestionStatus;
  source_annotation_id?: string;
  image_id: string;
  created_at: string;
}

export interface GenerateAISuggestionsRequest {
  image_id: string;
  project_id: string;
  model?: 'sam2' | 'sam3';
  prompt_points?: Array<{ x: number; y: number }>;
  prompt_boxes?: AnnotationData[];
}

export interface SuggestSimilarObjectsRequest {
  image_id: string;
  project_id: string;
  source_annotation_id: string;
  similarity_threshold?: number;
}

export interface SuggestLabelRequest {
  image_id: string;
  project_id: string;
  annotation_data: AnnotationData | PolygonData;
  top_k?: number;
}

export interface PropagateAnnotationsRequest {
  source_image_id: string;
  target_image_id: string;
  project_id: string;
  annotation_ids?: string[];
}

export interface AcceptSuggestionRequest {
  suggestion_id: string;
  class_id?: string;
  class_name?: string;
}

export interface SuggestionResponse {
  suggestions: AnnotationSuggestion[];
  count: number;
}
