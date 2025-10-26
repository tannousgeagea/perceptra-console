// hooks/useProjectDetails.ts

import { useQuery } from "@tanstack/react-query";
import { Project } from "@/types/project";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";

/**
 * Fetch project details by project ID
 */
export const fetchProjectById = async (
  projectId: string,
  organizationId: string
): Promise<Project> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${baseURL}/api/v1/projects/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Project not found");
    }
    throw new Error("Failed to fetch project details");
  }

  return response.json();
};

/**
 * Hook to fetch project details by ID
 * Automatically uses current organization from auth context
 */
export const useProjectDetails = (projectId?: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['project', projectId, currentOrganization?.id],
    queryFn: () => {
      if (!projectId) {
        throw new Error("No project ID provided");
      }
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchProjectById(projectId, currentOrganization.id);
    },
    enabled: !!projectId && !!currentOrganization,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry failed requests twice
  });
};
