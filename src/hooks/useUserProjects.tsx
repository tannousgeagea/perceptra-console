// hooks/useUserProjects.ts - Updated with new auth system

import { useQuery } from "@tanstack/react-query";
import { Project } from "@/types/project";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";

/**
 * Fetch user's assigned projects for current organization
 * ✅ Now includes X-Organization-ID header
 */
export const fetchMyAssignedProjects = async (organizationId: string): Promise<Project[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${baseURL}/api/v1/projects/me`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId, // ✅ Added organization header
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch assigned projects");
  }
  
  return response.json();
};

/**
 * Hook to fetch user's assigned projects
 * ✅ Automatically uses current organization from auth context
 */
export const useUserProjects = () => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['userAssignedProjects', currentOrganization?.id], // ✅ Include org ID in query key
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchMyAssignedProjects(currentOrganization.id);
    },
    enabled: !!currentOrganization, // ✅ Only fetch when organization is selected
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};
