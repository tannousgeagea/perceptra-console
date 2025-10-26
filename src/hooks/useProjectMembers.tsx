import { ProjectMember } from "@/types/membership";
import { baseURL } from "@/components/api/base";
import { useQuery } from '@tanstack/react-query';
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";


export const getProjectMembers = async (projectId: string, organizationId: string): Promise<ProjectMember[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }  
  
  const response = await fetch(`${baseURL}/api/v1/projects/${projectId}/members`, {
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
};


export function useProjectMembers(projectId: string) {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['project-members', projectId, currentOrganization?.id],
    queryFn: () => {
          if (!currentOrganization) {
            throw new Error("No organization selected");
          }
      return getProjectMembers(projectId, currentOrganization.id)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}