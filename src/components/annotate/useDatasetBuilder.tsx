import { useState } from 'react';
import { SplitRatios, FinalizeResponse, SplitResponse } from '@/types/split';

// Mock hook for batch finalizing images
export const useBatchFinalizeImages = () => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (imageIds: number[]): Promise<FinalizeResponse> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    
    // Mock some invalid images (e.g., not annotated/reviewed)
    const invalidIds = imageIds.slice(0, Math.floor(imageIds.length * 0.1));
    const finalizedCount = imageIds.length - invalidIds.length;
    
    console.log('Batch finalizing images:', imageIds);
    
    return {
      message: `Finalized ${finalizedCount} images for dataset`,
      finalized_count: finalizedCount,
      invalid_ids: invalidIds,
      total_requested: imageIds.length
    };
  };

  return {
    mutate,
    isLoading,
    error: null,
  };
};

// Mock hook for splitting dataset
export const useSplitDataset = () => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (ratios: SplitRatios): Promise<SplitResponse> => {
    setIsLoading(true);
    
    // Validate ratios sum to 1.0
    const total = ratios.train_ratio + ratios.val_ratio + ratios.test_ratio;
    if (Math.abs(total - 1.0) > 0.01) {
      setIsLoading(false);
      throw new Error(`Ratios must sum to 1.0, got ${total.toFixed(2)}`);
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    
    // Mock splitting 150 images
    const totalImages = 150;
    const trainCount = Math.floor(totalImages * ratios.train_ratio);
    const valCount = Math.floor(totalImages * ratios.val_ratio);
    const testCount = totalImages - trainCount - valCount;
    
    console.log('Splitting dataset with ratios:', ratios);
    
    return {
      message: `Successfully split ${totalImages} images`,
      train_count: trainCount,
      val_count: valCount,
      test_count: testCount,
      total_split: totalImages,
      already_split: 50
    };
  };

  return {
    mutate,
    isLoading,
    error: null,
  };
};
