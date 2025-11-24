// SAM Session Types
export type SAMModel = 'sam_v1' | 'sam_v2' | 'sam_v3';
export type DeviceType = 'cuda' | 'cpu';
export type PrecisionType = 'fp16' | 'fp32';

export interface ModelConfig {
  model: SAMModel;
  device: DeviceType;
  precision: PrecisionType;
}

export interface SAMSession {
  session_id: string;
  status: 'initializing' | 'ready' | 'processing' | 'error';
  config: ModelConfig;
  created_at: string;
  last_active: string;
}

// Segmentation Types
export interface Point {
  x: number;
  y: number;
  label: 1 | 0; // 1 = positive, 0 = negative
}

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Mask {
  data: number[][]; // 2D array of mask values
  width: number;
  height: number;
}

export interface SAMSuggestion {
  id: string;
  type: 'point' | 'box' | 'text' | 'similar' | 'propagated';
  bbox: BBox;
  mask?: Mask;
  confidence: number;
  suggested_label?: string;
  suggested_class_id?: string;
  thumbnail?: string; // base64 or URL
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

// API Request Types
export interface CreateSessionRequest {
  config: ModelConfig;
}

export interface SegmentPointsRequest {
  session_id: string;
  points: Point[];
}

export interface SegmentBoxRequest {
  session_id: string;
  box: BBox;
}

export interface SegmentTextRequest {
  session_id: string;
  text: string;
}

export interface SegmentExemplarRequest {
  session_id: string;
  reference_annotation_uid: string;
}

export interface PropagateRequest {
  session_id: string;
  source_image_id: string;
  annotation_uids: string[];
}

export interface AcceptSuggestionsRequest {
  suggestion_ids: string[];
  class_id?: string;
  class_name?: string;
}

export interface RejectSuggestionsRequest {
  suggestion_ids: string[];
}

// API Response Types
export interface SessionResponse {
  session_id: string;
  status: SAMSession['status'];
  config: ModelConfig;
}

export interface SegmentationResponse {
  suggestions: SAMSuggestion[];
  count: number;
}
