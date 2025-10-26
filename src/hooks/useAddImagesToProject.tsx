import { useMutation } from '@tanstack/react-query';
import { toast } from '@/components/ui/ui/use-toast';
import { baseURL } from '@/components/api/base';

interface AddImagesRequest {
  project_id: number | string;
  image_ids: (number | string)[];
}

export const useAddImagesToProject = () => {
  return useMutation({
    mutationFn: async ({ project_id, image_ids }: AddImagesRequest) => {
      const response = await fetch(`${baseURL}/api/v1/projects/${project_id}/add-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id, image_ids }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add images');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Images added',
        description: data.message,
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add images',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });
};
