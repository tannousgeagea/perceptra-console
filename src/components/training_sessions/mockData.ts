import { TrainingSession, Project, Model } from '@/types/training_session';

export const projects: Project[] = [
  { id: '1', name: 'Customer Sentiment Analysis' },
  { id: '2', name: 'Image Classification' },
  { id: '3', name: 'Fraud Detection' },
  { id: '4', name: 'Text Generation' },
];

export const models: Model[] = [
  { id: '1', name: 'BERT-base' },
  { id: '2', name: 'ResNet-50' },
  { id: '3', name: 'XGBoost' },
  { id: '4', name: 'GPT-2' },
  { id: '5', name: 'RandomForest' },
];

export const validationImages = [
    { 
      id: 1, 
      original: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop", 
      confidence: 0.94,
      boundingBoxes: [
        { x: 50, y: 30, width: 120, height: 80, label: "car", confidence: 0.94, type: 'prediction' as const },
        { x: 45, y: 25, width: 130, height: 90, label: "car", confidence: 1.0, type: 'groundTruth' as const },
        { x: 200, y: 100, width: 60, height: 40, label: "pedestrian", confidence: 0.87, type: 'prediction' as const },
        { x: 195, y: 95, width: 70, height: 50, label: "pedestrian", confidence: 1.0, type: 'groundTruth' as const }
      ]
    },
    { 
      id: 2, 
      original: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop", 
      confidence: 0.89,
      boundingBoxes: [
        { x: 80, y: 50, width: 100, height: 70, label: "truck", confidence: 0.89, type: 'prediction' as const },
        { x: 75, y: 45, width: 110, height: 80, label: "truck", confidence: 1.0, type: 'groundTruth' as const }
      ]
    },
    { 
      id: 3, 
      original: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop", 
      confidence: 0.92,
      boundingBoxes: [
        { x: 30, y: 40, width: 90, height: 60, label: "cyclist", confidence: 0.92, type: 'prediction' as const },
        { x: 25, y: 35, width: 100, height: 70, label: "cyclist", confidence: 1.0, type: 'groundTruth' as const },
        { x: 180, y: 20, width: 80, height: 50, label: "car", confidence: 0.85, type: 'prediction' as const },
        { x: 175, y: 15, width: 90, height: 60, label: "car", confidence: 1.0, type: 'groundTruth' as const }
      ]
    },
    { 
      id: 4, 
      original: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop", 
      confidence: 0.87,
      boundingBoxes: [
        { x: 100, y: 60, width: 110, height: 80, label: "pedestrian", confidence: 0.87, type: 'prediction' as const },
        { x: 95, y: 55, width: 120, height: 90, label: "pedestrian", confidence: 1.0, type: 'groundTruth' as const }
      ]
    },
    { 
      id: 5, 
      original: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop", 
      confidence: 0.95,
      boundingBoxes: [
        { x: 40, y: 70, width: 140, height: 90, label: "car", confidence: 0.95, type: 'prediction' as const },
        { x: 35, y: 65, width: 150, height: 100, label: "car", confidence: 1.0, type: 'groundTruth' as const },
        { x: 220, y: 30, width: 70, height: 45, label: "truck", confidence: 0.91, type: 'prediction' as const },
        { x: 215, y: 25, width: 80, height: 55, label: "truck", confidence: 1.0, type: 'groundTruth' as const }
      ]
    },
    { 
      id: 6, 
      original: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop", 
      confidence: 0.91,
      boundingBoxes: [
        { x: 60, y: 80, width: 120, height: 70, label: "cyclist", confidence: 0.91, type: 'prediction' as const },
        { x: 55, y: 75, width: 130, height: 80, label: "cyclist", confidence: 1.0, type: 'groundTruth' as const }
      ]
    }
  ];


  // Mock validation metrics data
  export const validationMetricsData = {
    precisionConfidence: [
      { confidence: 0.1, precision: 0.45 },
      { confidence: 0.2, precision: 0.52 },
      { confidence: 0.3, precision: 0.61 },
      { confidence: 0.4, precision: 0.68 },
      { confidence: 0.5, precision: 0.74 },
      { confidence: 0.6, precision: 0.79 },
      { confidence: 0.7, precision: 0.84 },
      { confidence: 0.8, precision: 0.88 },
      { confidence: 0.9, precision: 0.91 },
      { confidence: 0.95, precision: 0.93 }
    ],
    recallConfidence: [
      { confidence: 0.1, recall: 0.92 },
      { confidence: 0.2, recall: 0.89 },
      { confidence: 0.3, recall: 0.86 },
      { confidence: 0.4, recall: 0.82 },
      { confidence: 0.5, recall: 0.78 },
      { confidence: 0.6, recall: 0.74 },
      { confidence: 0.7, recall: 0.69 },
      { confidence: 0.8, recall: 0.63 },
      { confidence: 0.9, recall: 0.55 },
      { confidence: 0.95, recall: 0.47 }
    ],
    precisionRecall: [
      { recall: 0.47, precision: 0.93 },
      { recall: 0.55, precision: 0.91 },
      { recall: 0.63, precision: 0.88 },
      { recall: 0.69, precision: 0.84 },
      { recall: 0.74, precision: 0.79 },
      { recall: 0.78, precision: 0.74 },
      { recall: 0.82, precision: 0.68 },
      { recall: 0.86, precision: 0.61 },
      { recall: 0.89, precision: 0.52 },
      { recall: 0.92, precision: 0.45 }
    ],
    f1Confidence: [
      { confidence: 0.1, f1Score: 0.60 },
      { confidence: 0.2, f1Score: 0.66 },
      { confidence: 0.3, f1Score: 0.71 },
      { confidence: 0.4, f1Score: 0.74 },
      { confidence: 0.5, f1Score: 0.76 },
      { confidence: 0.6, f1Score: 0.77 },
      { confidence: 0.7, f1Score: 0.76 },
      { confidence: 0.8, f1Score: 0.73 },
      { confidence: 0.9, f1Score: 0.69 },
      { confidence: 0.95, f1Score: 0.62 }
    ],
    rocCurve: [
      { fpr: 0.0, tpr: 0.0 },
      { fpr: 0.02, tpr: 0.15 },
      { fpr: 0.05, tpr: 0.32 },
      { fpr: 0.08, tpr: 0.48 },
      { fpr: 0.12, tpr: 0.62 },
      { fpr: 0.18, tpr: 0.74 },
      { fpr: 0.25, tpr: 0.83 },
      { fpr: 0.35, tpr: 0.90 },
      { fpr: 0.48, tpr: 0.95 },
      { fpr: 0.65, tpr: 0.98 },
      { fpr: 1.0, tpr: 1.0 }
    ],
    confusionMatrix: [
      { predicted: 'car', actual: 'car', count: 245 },
      { predicted: 'car', actual: 'pedestrian', count: 12 },
      { predicted: 'pedestrian', actual: 'car', count: 8 },
      { predicted: 'pedestrian', actual: 'pedestrian', count: 189 }
    ]
  };