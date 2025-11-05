export interface SplitRatios {
  train_ratio: number;
  val_ratio: number;
  test_ratio: number;
}

export interface SplitPreset {
  name: string;
  description: string;
  ratios: SplitRatios;
}

export interface FinalizeResponse {
  message: string;
  finalized_count: number;
  invalid_ids: number[];
  total_requested: number;
}

export interface SplitResponse {
  message: string;
  train_count: number;
  val_count: number;
  test_count: number;
  total_split: number;
  already_split: number;
}

export const SPLIT_PRESETS: SplitPreset[] = [
  {
    name: 'Standard',
    description: 'Balanced distribution',
    ratios: { train_ratio: 0.7, val_ratio: 0.2, test_ratio: 0.1 }
  },
  {
    name: 'Large Training',
    description: 'More training data',
    ratios: { train_ratio: 0.8, val_ratio: 0.15, test_ratio: 0.05 }
  },
  {
    name: 'More Validation',
    description: 'Extended validation',
    ratios: { train_ratio: 0.6, val_ratio: 0.3, test_ratio: 0.1 }
  },
  {
    name: 'Equal Split',
    description: 'Uniform distribution',
    ratios: { train_ratio: 0.34, val_ratio: 0.33, test_ratio: 0.33 }
  }
];
