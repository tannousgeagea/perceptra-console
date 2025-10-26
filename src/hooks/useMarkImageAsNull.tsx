import { useState } from 'react';
import { toast } from './use-toast';
import { baseURL } from '@/components/api/base';

interface MarkAsNullResponse {
  success: boolean;
  message: string;
}

interface UseMarkImageAsNullReturn {
  markImageAsNull: (imageId: string, project_id: string) => Promise<MarkAsNullResponse>;
  isMarkingAsNull: boolean;
  error: string | null;
}

export const useMarkImageAsNull = (): UseMarkImageAsNullReturn => {
  const [isMarkingAsNull, setIsMarkingAsNull] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markImageAsNull = async (imageId: string, projectId: string): Promise<MarkAsNullResponse> => {
    setIsMarkingAsNull(true);
    setError(null);
    
    try {
      // In a real implementation, we would make the actual API call
      const response = await fetch(
        `${baseURL}/api/v1/projects/${projectId}/mark_as_null?image_id=${imageId}&marked_as_null=true`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
          },
        }
      );
      const data = await response.json();
      // For now, simulate the API response
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Simulate response
    //   const mockResponse: ApprovalResponse = {
    //     success: true,
    //     message: "Image annotations approved successfully",
    //   };
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark image as null';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsMarkingAsNull(false);
    }
  };

  return { markImageAsNull, isMarkingAsNull, error };
};

