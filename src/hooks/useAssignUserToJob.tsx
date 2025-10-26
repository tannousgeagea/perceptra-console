
import { useQueryClient } from '@tanstack/react-query';
import { baseURL } from '@/components/api/base';

export async function assignUserToJob(jobId: string, userId: string | null): Promise<void> {
  const token = localStorage.getItem("token") || sessionStorage.getItem('token');
  const response = await fetch(`${baseURL}/api/v1/jobs/${jobId}/assign`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to assign user to job');
  }
}

export function useAssignUserToJob(projectId: string) {
  const queryClient = useQueryClient();

  return async (jobId: string, userId: string | null) => {
    await assignUserToJob(jobId, userId);
    queryClient.invalidateQueries({ queryKey: ['project-jobs', projectId] });
  };
}