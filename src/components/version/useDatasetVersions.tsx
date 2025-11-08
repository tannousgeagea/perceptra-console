import { useState, useMemo } from 'react';
import { ExportConfig, VersionStatistics } from '@/types/version';
import { toast } from '@/components/ui/ui/use-toast';

export const useVersionStatistics = (versionId: string) => {
  const [isLoading] = useState(false);
  
  const statistics = useMemo((): VersionStatistics => {
    // Mock statistics for the version
    return {
      total_images: 650,
      total_annotations: 3250,
      splits: {
        train: 455,
        val: 130,
        test: 65,
      },
      class_distribution: {
        'person': 1200,
        'car': 850,
        'truck': 450,
        'bicycle': 350,
        'motorcycle': 250,
        'bus': 150,
      },
      average_annotations_per_image: 5.0,
    };
  }, [versionId]);

  return {
    data: statistics,
    isLoading,
    error: null,
  };
};

export const useRemoveImagesFromVersion = (versionId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (imageIds: string[]) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsLoading(false);
    
    console.log('Removing images from version:', versionId, imageIds);
    
    return { success: true };
  };

  return {
    mutate,
    isLoading,
    error: null,
  };
};

export function useExportVersion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (versionId: string, config: ExportConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Export Started",
        description: "Your dataset export is being processed. You'll be notified when it's ready.",
      });
      
      // In production, this would return a download URL or job ID
      console.log('Exporting version:', versionId, config);
      
      // Simulate download
      setTimeout(() => {
        toast({
          title: "Export Complete",
          description: "Your dataset is ready for download.",
        });
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export version');
      toast({
        title: "Export Failed",
        description: err instanceof Error ? err.message : 'Failed to export version',
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}