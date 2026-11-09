import { ModelType } from "@/types/models";

export interface MetricConfig {
  key: string;
  label: string;
  description: string;
}

/** The metrics shown for each kind of model. */
export const getMetricsConfig = (modelType: ModelType): MetricConfig[] => {
  switch (modelType) {
    case "classification":
      return [
        { key: "accuracy", label: "Accuracy", description: "Overall accuracy of the model" },
        { key: "precision", label: "Precision", description: "Precision of the model" },
        { key: "recall", label: "Recall", description: "Recall of the model" },
        { key: "f1Score", label: "F1 Score", description: "Harmonic mean of precision and recall" },
      ];
    case "object-detection":
      return [
        { key: "mAP", label: "mAP", description: "Mean Average Precision" },
        { key: "precision", label: "Precision", description: "Precision of the model" },
        { key: "recall", label: "Recall", description: "Recall of the model" },
        { key: "iou", label: "IoU", description: "Intersection over Union" },
      ];
    case "segmentation":
      return [
        { key: "iou", label: "IoU", description: "Intersection over Union" },
        { key: "diceCoefficient", label: "Dice Coefficient", description: "Dice similarity coefficient" },
        { key: "pixelAccuracy", label: "Pixel Accuracy", description: "Percentage of pixels correctly classified" },
      ];
    case "llm":
    case "vlm":
      return [
        { key: "perplexity", label: "Perplexity", description: "Measure of how well the model predicts text" },
        { key: "bleu", label: "BLEU", description: "Bilingual Evaluation Understudy score" },
        { key: "rouge", label: "ROUGE", description: "Recall-Oriented Understudy for Gisting Evaluation" },
      ];
    default:
      return [];
  }
};
