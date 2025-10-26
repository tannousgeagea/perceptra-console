// hooks/useEditJob.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Job } from '@/types/jobs';
import { baseURL } from '@/components/api/base';


interface EditJobPayload {
  jobId: string;
  name: string;
  description?: string;
}

async function editJobRequest({ jobId, name, description }: EditJobPayload): Promise<Job> {

    const token = localStorage.getItem("token") || sessionStorage.getItem('token');
    const response = await fetch(`${baseURL}/api/v1/jobs/${jobId}/edit`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update job');
    }

    return response.json();
}

export function useEditJob(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editJobRequest,
    onSuccess: (updatedJob: Job) => {
      // Invalidate or update relevant caches
      queryClient.invalidateQueries({ queryKey: ['project-jobs', projectId] });
      queryClient.setQueryData(['job', updatedJob.id], updatedJob); // if you cache individual job
    },
  });
}