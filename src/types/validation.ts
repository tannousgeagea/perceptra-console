export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  type: "prediction" | "groundTruth";
}

export interface ValidationImage {
  id: number;
  original: string;
  confidence: number;
  width: number;
  height: number;
  boundingBoxes: BoundingBox[];
}

export interface metricsData {
    precision: number;
    recall: number;
    map: number;
    f1: number;
    best_threshold: number;
    precisionConfidence: Array<{ confidence: number; precision: number }>;
    recallConfidence: Array<{ confidence: number; recall: number }>;
    precisionRecall: Array<{ recall: number; precision: number }>;
    f1Confidence: Array<{ confidence: number; f1Score: number }>;
    rocCurve: Array<{ fpr: number; tpr: number }>;
    confusionMatrix: Array<{ predicted: string; actual: string; count: number }>;
  };
