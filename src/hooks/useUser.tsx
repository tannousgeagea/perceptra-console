// hooks/useOrganizationUsers.ts

import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS, User } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";

/**
 * Fetch organization users
 */

export interface UsersResponse {
  user: User;
}

export const fetchUser = async (
  organizationId: string,
): Promise<UsersResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/auth/me`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch organization users");
  }

  return response.json();
};

/**
 * Hook to fetch organization users
 * Automatically uses current organization from auth context
 */
export const useUser = () => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['user', currentOrganization?.id],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchUser(currentOrganization.id);
    },
    enabled: !!currentOrganization,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};
