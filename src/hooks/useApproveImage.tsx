import { useState } from 'react';
import { toast } from './use-toast';
import { baseURL } from '@/components/api/base';

interface ApprovalResponse {
  success: boolean;
  message: string;
}

interface UseImageApprovalReturn {
  approveImage: (imageId: string, project_id: string) => Promise<ApprovalResponse>;
  isApproving: boolean;
  error: string | null;
}

export const useImageApproval = (): UseImageApprovalReturn => {
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveImage = async (imageId: string, projectId: string): Promise<ApprovalResponse> => {
    setIsApproving(true);
    setError(null);
    
    try {
      // In a real implementation, we would make the actual API call
      const response = await fetch(
        `${baseURL}/api/v1/projects/${projectId}/review?image_id=${imageId}&approved=true`,
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve image';
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
      setIsApproving(false);
    }
  };

  return { approveImage, isApproving, error };
};

