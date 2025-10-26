
import { useQuery } from "@tanstack/react-query";
import { Job, JobStatus } from "@/types/jobs";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";

export const fetchMyAssignedJobs = async (organizationId: string): Promise<Job[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${baseURL}/api/v1/jobs/me`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId, // ✅ Added organization header
    },
  });

  if (!response.ok) throw new Error("Failed to fetch assigned jobs");
  return response.json();
};

export const useUserJobs = () => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['userAssignedJobs', currentOrganization?.id],
    queryFn:() => {
          if (!currentOrganization) {
            throw new Error("No organization selected");
          }
          return fetchMyAssignedJobs(currentOrganization.id);
        },
    enabled: !!currentOrganization,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};
