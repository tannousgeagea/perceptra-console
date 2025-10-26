import { Job } from '@/types/jobs';
import { User } from '@/types/membership';
import { useQuery } from '@tanstack/react-query';
import { baseURL } from '@/components/api/base';
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";


export async function fetchProjectJobs(projectId: string, organizationId: string): Promise<Job[]> {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }
  const response = await fetch(`${baseURL}/api/v1/jobs/project/${projectId}`, {
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

  const data = await response.json();
  return data.map((job: any) => ({
    id: String(job.id),
    name: job.name,
    description: job.description,
    status: job.status,
    imageCount: job.imageCount,
    assignedUser: job.assignedUser ? {
      id: String(job.assignedUser.id),
      username: job.assignedUser.username,
      email: job.assignedUser.email,
      avatar: job.assignedUser.avatar || undefined,
    } as User : null,
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
    progress: job.progress
  })) as Job[];
}

export function useProjectJobs(projectId: string) {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['project-jobs', projectId, currentOrganization?.id],
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