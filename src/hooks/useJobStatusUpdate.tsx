// hooks/useJobStatusUpdate.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { baseURL } from '@/components/api/base';
import { JobStatus } from '@/types/jobs';

export async function updateJobStatus(jobId: string, newStatus: JobStatus): Promise<void> {
  const token = localStorage.getItem("token") || sessionStorage.getItem('token');
    const res = await fetch(`${baseURL}/api/v1/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });
  
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to update job status");
    }
  }

export function useJobStatusUpdate(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, newStatus }: { jobId: string; newStatus: JobStatus }) =>
      updateJobStatus(jobId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-jobs', projectId] });
    },
  });
}
