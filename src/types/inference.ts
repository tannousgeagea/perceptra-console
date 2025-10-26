export interface Prediction {
  id: string;
  class: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface InferenceResult {
  model: string;
  detections: number;
  confidence: number;
  processingTime: number;
  predictions: Prediction[];
}

export interface InferenceState {
  primary: InferenceResult;
  comparison: InferenceResult | null;
}

export interface UseInferenceOptions {
  confidenceThreshold: number;
  maxDetections?: number;
}