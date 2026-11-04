import { apiFetch } from '@/services/apiClient';
// hooks/useUserProjects.ts - Updated with new auth system

import { useQuery } from "@tanstack/react-query";
import { Project } from "@/types/project";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";

/**
 * Fetch user's assigned projects for current organization
 * ✅ Now includes X-Organization-ID header
 */
export const fetchMyAssignedProjects = async (
  organizationId: string,
  includeInactive = false
): Promise<Project[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const query = includeInactive ? "?include_inactive=true" : "";
  const response = await apiFetch(`/api/v1/projects/user/me${query}`, {
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
export const useUserProjects = (options: { includeInactive?: boolean } = {}) => {
  const { currentOrganization } = useCurrentOrganization();
  const includeInactive = !!options.includeInactive;

  return useQuery({
    // Mutations update every variant via the ['userAssignedProjects'] prefix.
    queryKey: ['userAssignedProjects', currentOrganization?.id, { includeInactive }],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchMyAssignedProjects(currentOrganization.id, includeInactive);
    },
    enabled: !!currentOrganization, // ✅ Only fetch when organization is selected
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};
