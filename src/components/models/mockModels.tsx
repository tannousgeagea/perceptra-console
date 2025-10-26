
import { Model, ModelType, ModelVersion, VersionTag, Dataset } from "@/types/models";


// Mock datasets
export const mockDatasets: Dataset[] = [
  {
    id: "dataset-001",
    name: "Product Images (Labeled)",
    itemCount: 1250,
    createdAt: "2023-03-10T08:45:00Z"
  },
  {
    id: "dataset-002",
    name: "Factory Defects Dataset",
    itemCount: 875,
    createdAt: "2023-04-22T14:30:00Z"
  },
  {
    id: "dataset-003",
    name: "Retail Inventory",
    itemCount: 2100,
    createdAt: "2023-06-15T11:20:00Z" 
  },
  {
    id: "dataset-004",
    name: "Augmented Product Dataset",
    itemCount: 3500,
    createdAt: "2023-09-05T16:40:00Z"
  }
];

// Helper to create a model version
const createModelVersion = (
  id: string,
  versionNumber: number,
  status: ModelVersion['status'],
  tags: VersionTag[] = [],
  metrics: Record<string, number> = {},
  datasetId: string = "dataset-001"
): ModelVersion => {
  const date = new Date();
  date.setDate(date.getDate() - versionNumber * 2); // Each version is 2 days apart
  
  return {
    id,
    versionNumber,
    createdAt: date.toISOString(),
    createdBy: "john.doe@example.com",
    status,
    metrics,
    tags,
    datasetUsed: mockDatasets.find(d => d.id === datasetId),
    artifacts: {
      onnx: versionNumber % 2 === 0 ? `model_v${versionNumber}.onnx` : undefined,
      weights: `weights_v${versionNumber}.bin`,
      logs: `training_logs_v${versionNumber}.txt`
    }
  };
};

// Classification model metrics
const classificationMetrics = {
  accuracy: 0.92,
  precision: 0.89,
  recall: 0.94,
  f1Score: 0.91
};

// Object detection metrics
const objectDetectionMetrics = {
  mAP: 0.78,
  precision: 0.85,
  recall: 0.81,
  iou: 0.76
};

// Segmentation metrics
const segmentationMetrics = {
  iou: 0.83,
  diceCoefficient: 0.87,
  pixelAccuracy: 0.94
};

// LLM metrics
const llmMetrics = {
  perplexity: 12.3,
  bleu: 0.42,
  rouge: 0.67
};

export const mockModels: Model[] = [
  {
    id: "model-001",
    name: "Product Classification Model",
    description: "Identifies product categories from images",
    type: "classification" as ModelType,
    createdAt: "2023-04-15T10:30:00Z",
    updatedAt: "2023-06-20T14:45:00Z",
    createdBy: "john.doe@example.com",
    projectId: "amk_front_impurity",
    versions: [
      createModelVersion("v1-model-001", 1, "trained", ["baseline"], classificationMetrics, "dataset-001"),
      createModelVersion("v2-model-001", 2, "trained", ["production"], {
        ...classificationMetrics,
        accuracy: 0.95,
        precision: 0.93
      },
      "dataset-004"
    ),
      createModelVersion("v3-model-001", 3, "failed", [], {}, "dataset-004")
    ],
    currentProductionVersion: "v2-model-001",
    tags: ["retail", "products", "classification"]
  },
  {
    id: "model-002",
    name: "Defect Detection",
    description: "Identifies manufacturing defects in products",
    type: "object-detection" as ModelType,
    createdAt: "2023-05-22T09:15:00Z",
    updatedAt: "2023-07-18T11:20:00Z",
    createdBy: "sarah.smith@example.com",
    projectId: "amk_front_impurity",
    versions: [
      createModelVersion("v1-model-002", 1, "trained", ["baseline"], objectDetectionMetrics, "dataset-002"),
      createModelVersion("v2-model-002", 2, "trained", ["production"], {
        ...objectDetectionMetrics,
        mAP: 0.83,
        precision: 0.88
      }, "dataset-002")
    ],
    currentProductionVersion: "v2-model-002",
    tags: ["defects", "quality-control", "manufacturing"]
  },
  {
    id: "model-003",
    name: "Image Segmentor",
    description: "Segments objects in retail environment",
    type: "segmentation" as ModelType,
    createdAt: "2023-07-10T13:45:00Z",
    updatedAt: "2023-08-25T15:30:00Z",
    createdBy: "alex.wong@example.com",
    projectId: "amk_front_impurity",
    versions: [
      createModelVersion("v1-model-003", 1, "trained", ["baseline", "production"], segmentationMetrics, "dataset-003")
    ],
    currentProductionVersion: "v1-model-003",
    tags: ["segmentation", "retail", "shelves"]
  },
  {
    id: "model-004",
    name: "Product Description Generator",
    description: "Generates product descriptions from images",
    type: "vlm" as ModelType,
    createdAt: "2023-08-05T14:20:00Z",
    updatedAt: "2023-09-12T10:15:00Z",
    createdBy: "rachel.green@example.com",
    projectId: "project-002",
    versions: [
      createModelVersion("v1-model-004", 1, "trained", ["baseline"], llmMetrics, "dataset-004"),
      createModelVersion("v2-model-004", 2, "training", [], {}, "dataset-004")
    ],
    currentProductionVersion: "v1-model-004",
    tags: ["nlp", "description", "generation", "multimodal"]
  }
];

// Helper function to get a model by ID
export const getModelById = (id: string): Model | undefined => {
  return mockModels.find(model => model.id === id);
};

// Helper function to get models by project ID
export const getModelsByProjectId = (projectId: string): Model[] => {
  return mockModels.filter(model => model.projectId === projectId);
};

// Helper function to get a dataset by ID
export const getDatasetById = (id: string): Dataset | undefined => {
  return mockDatasets.find(dataset => dataset.id === id);
};