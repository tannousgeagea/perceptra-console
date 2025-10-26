// hooks/useSplitJob.ts
import { baseURL } from '@/components/api/base';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Job } from '@/types/jobs';

interface SplitJobInput {
  jobId: string;
  numberOfSlices: number;
  userAssignments: (string | null)[];
}

async function splitJob({ jobId, numberOfSlices, userAssignments }: SplitJobInput): Promise<Job[]> {
  const token = localStorage.getItem("token") || sessionStorage.getItem('token');
  const response = await fetch(`${baseURL}/api/v1/jobs/${jobId}/split`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ number_of_slices: numberOfSlices, user_assignments: userAssignments }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to split the job');
  }

  return await response.json();
}

export function useSplitJob(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: splitJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-jobs', projectId] });
    },
  });
}
