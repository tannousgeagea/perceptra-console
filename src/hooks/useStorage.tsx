// hooks/useStorage.ts

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { Credentials, StorageProfile, StorageSecret } from "@/types/storage";

// ============================================
// TYPES
// ============================================

export interface TestConnectionRequest {
  profile: StorageProfile;
  credentials: Credentials;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: Record<string, any>;
}

export interface CreateProfileRequest {
  profile: StorageProfile;
  credentials: Credentials;
  test_before_save?: boolean;
}

export interface CreateProfileResponse {
  storage_profile_id: string;
  name: string;
  backend: string;
  credential_ref_id?: string;
  encrypted_secret_identifier?: string;
  is_default: boolean;
  message: string;
}

export interface StorageSecretsParams {
  skip?: number;
  limit?: number;
}

export interface StorageProfilesResponse {
  total: number;
  page: number;
  page_size: number;
  profiles: StorageProfile[];
}

export interface StorageProfilesParams {
  skip?: number;
  limit?: number;
}

// ============================================
// API FUNCTIONS
// ============================================

export const testStorageConnection = async (
  organizationId: string,
  request: TestConnectionRequest
): Promise<TestConnectionResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${baseURL}/api/v1/storage/test-connection`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to test connection' }));
    throw new Error(error.message || 'Failed to test connection');
  }

  return response.json();
};

export const createStorageProfile = async (
  organizationId: string,
  request: CreateProfileRequest
): Promise<CreateProfileResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${baseURL}/api/v1/storage/profiles-with-credentials`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create storage profile' }));
    throw new Error(error.message || 'Failed to create storage profile');
  }

  return response.json();
};

export const fetchStorageSecrets = async (
  organizationId: string,
  params: StorageSecretsParams = {}
): Promise<StorageSecret[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const { skip = 0, limit = 100 } = params;
  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${baseURL}/api/v1/storage/secrets?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch storage secrets");
  }

  return response.json();
};

export const fetchStorageProfiles = async (
  organizationId: string,
  params: StorageProfilesParams = {}
): Promise<StorageProfilesResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const { skip = 0, limit = 100 } = params;
  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${baseURL}/api/v1/storage/profiles?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch storage profiles");
  }

  return response.json();
};

// ============================================
// HOOKS
// ============================================

export const useTestStorageConnection = () => {
  const { currentOrganization } = useCurrentOrganization();

  return useMutation({
    mutationFn: (request: TestConnectionRequest) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return testStorageConnection(currentOrganization.id, request);
    },
  });
};

export const useCreateStorageProfile = (options?: {
  onSuccess?: (data: CreateProfileResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (request: CreateProfileRequest) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return createStorageProfile(currentOrganization.id, request);
    },

    onSuccess: (data) => {
      // Invalidate storage profiles query
      queryClient.invalidateQueries({ queryKey: ['storageProfiles'] });

      if (showToast) {
        toast.success(data.message || 'Storage profile created successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to create storage profile');
      }

      onError?.(error);
    },
  });
};

export const useStorageSecrets = (params: StorageSecretsParams = {}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['storageSecrets', currentOrganization?.id, params],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchStorageSecrets(currentOrganization.id, params);
    },
    enabled: !!currentOrganization,
    staleTime: 2 * 60 * 1000,
  });
};

export const useStorageProfiles = (params: StorageProfilesParams = {}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['storageProfiles', currentOrganization?.id, params],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchStorageProfiles(currentOrganization.id, params);
    },
    enabled: !!currentOrganization,
    staleTime: 2 * 60 * 1000,
  });
};