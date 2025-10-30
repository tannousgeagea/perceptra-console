// hooks/useOrganizationSettings.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";

/**
 * Organization settings type
 */
export interface OrganizationSettings {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logo_url: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Update organization settings payload - all fields optional
 */
export interface UpdateOrganizationSettingsPayload {
  name?: string;
  description?: string;
  website?: string;
  logo_url?: string;
  settings?: Record<string, any>;
}

/**
 * Fetch organization settings
 */
export const fetchOrganizationSettings = async (
  organizationId: string
): Promise<OrganizationSettings> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${baseURL}/api/v1/organizations/settings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organization settings");
  }

  return response.json();
};

/**
 * Update organization settings
 */
export const updateOrganizationSettings = async (
  organizationId: string,
  payload: UpdateOrganizationSettingsPayload
): Promise<OrganizationSettings> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${baseURL}/api/v1/organizations/settings`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'Failed to update organization settings' 
    }));
    throw new Error(error.message || 'Failed to update organization settings');
  }

  return response.json();
};

/**
 * Hook to fetch organization settings
 */
export const useOrganizationSettings = () => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['organizationSettings', currentOrganization?.id],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchOrganizationSettings(currentOrganization.id);
    },
    enabled: !!currentOrganization,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook options
 */
export interface UseUpdateOrganizationSettingsOptions {
  onSuccess?: (data: OrganizationSettings) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

/**
 * Hook to update organization settings
 */
export const useUpdateOrganizationSettings = (
  options: UseUpdateOrganizationSettingsOptions = {}
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options;

  const mutation = useMutation({
    mutationFn: (payload: UpdateOrganizationSettingsPayload) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return updateOrganizationSettings(currentOrganization.id, payload);
    },

    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['organizationSettings', currentOrganization?.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['organizationDetails', currentOrganization?.id] 
      });

      if (showToast) {
        toast.success('Organization settings updated successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to update organization settings');
      }

      onError?.(error);
    },
  });

  return {
    updateSettings: mutation.mutate,
    updateSettingsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
};