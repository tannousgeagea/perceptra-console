
import { Model, ModelType, ModelVersion, Dataset } from "@/types/models";
import { getModelById, getModelsByProjectId, mockModels, mockDatasets, getDatasetById } from "./mockModels";

// Service for fetching and managing models
export const ModelService = {
  // Get all models
  getAllModels: async (): Promise<Model[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockModels), 500);
    });
  },

  // Get model by ID
  getModelById: async (id: string): Promise<Model> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const model = getModelById(id);
        if (model) {
          resolve(model);
        } else {
          reject(new Error(`Model with ID ${id} not found`));
        }
      }, 500);
    });
  },

  // Get models by project ID
  getModelsByProjectId: async (projectId: string): Promise<Model[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const models = getModelsByProjectId(projectId);
        resolve(models);
      }, 500);
    });
  },

  // Get all datasets
  getAllDatasets: async (): Promise<Dataset[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDatasets), 500);
    });
  },

  // Get dataset by ID
  getDatasetById: async (id: string): Promise<Dataset> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const dataset = getDatasetById(id);
        if (dataset) {
          resolve(dataset);
        } else {
          reject(new Error(`Dataset with ID ${id} not found`));
        }
      }, 500);
    });
  },


  // Train a new model version (mock)
  trainNewVersion: async (
    modelId: string,
    config: Record<string, any>
  ): Promise<ModelVersion> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const model = getModelById(modelId);
        if (!model) {
          reject(new Error(`Model with ID ${modelId} not found`));
          return;
        }

        // Create a new version
        const newVersionNumber = Math.max(...model.versions.map(v => v.versionNumber), 0) + 1;
        const newVersionId = `v${newVersionNumber}-${modelId}`;
        
        // Get dataset if provided
        let datasetUsed = null;
        if (config.datasetId) {
          datasetUsed = mockDatasets.find(d => d.id === config.datasetId) || null;
        } else if (config.dataset) {
          datasetUsed = config.dataset;
        }

        const newVersion: ModelVersion = {
          id: newVersionId,
          versionNumber: newVersionNumber,
          createdAt: new Date().toISOString(),
          createdBy: "current.user@example.com", // In a real app, get from auth context
          status: "training",
          metrics: {},
          tags: [],
          config,
          datasetUsed
        };

        // In a real app, this would be added to the model in the database
        resolve(newVersion);
      }, 1000);
    });
  },

  // Set version tag (e.g., mark as production)
  setVersionTag: async (
    modelId: string,
    versionId: string,
    tag: string,
    value: boolean
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real app, this would update the database
        console.log(`Setting tag ${tag} to ${value} for version ${versionId} of model ${modelId}`);
        resolve();
      }, 500);
    });
  },

  // Get type-specific metrics configuration
  getMetricsConfig: (modelType: ModelType): { key: string; label: string; description: string }[] => {
    switch (modelType) {
      case "classification":
        return [
          { key: "accuracy", label: "Accuracy", description: "Overall accuracy of the model" },
          { key: "precision", label: "Precision", description: "Precision of the model" },
          { key: "recall", label: "Recall", description: "Recall of the model" },
          { key: "f1Score", label: "F1 Score", description: "Harmonic mean of precision and recall" }
        ];
      case "object-detection":
        return [
          { key: "mAP", label: "mAP", description: "Mean Average Precision" },
          { key: "precision", label: "Precision", description: "Precision of the model" },
          { key: "recall", label: "Recall", description: "Recall of the model" },
          { key: "iou", label: "IoU", description: "Intersection over Union" }
        ];
      case "segmentation":
        return [
          { key: "iou", label: "IoU", description: "Intersection over Union" },
          { key: "diceCoefficient", label: "Dice Coefficient", description: "Dice similarity coefficient" },
          { key: "pixelAccuracy", label: "Pixel Accuracy", description: "Percentage of pixels correctly classified" }
        ];
      case "llm":
      case "vlm":
        return [
          { key: "perplexity", label: "Perplexity", description: "Measure of how well the model predicts text" },
          { key: "bleu", label: "BLEU", description: "Bilingual Evaluation Understudy score" },
          { key: "rouge", label: "ROUGE", description: "Recall-Oriented Understudy for Gisting Evaluation" }
        ];
      default:
        return [];
    }
  }
};