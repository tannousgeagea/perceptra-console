import { Job, JobsResponse } from '@/types/jobs';
import { User } from '@/types/membership';
import { useQuery } from '@tanstack/react-query';
import { baseURL } from '@/components/api/base';
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";


export async function fetchProjectJobs(projectId: string, organizationId: string): Promise<JobsResponse> {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }
  const response = await fetch(`${baseURL}/api/v1/projects/${projectId}/jobs`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId, 
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch project jobs');
  }

  return response.json();
}

export function useProjectJobs(projectId: string) {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['jobs', projectId, currentOrganization?.id],
    queryFn:() => {
          if (!currentOrganization) {
            throw new Error("No organization selected");
          }
          return fetchProjectJobs(projectId, currentOrganization.id);
        },
    enabled: !!currentOrganization,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}