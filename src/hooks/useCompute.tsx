
// hooks/useCompute.ts

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { 
    ComputeProvider, 
    ComputeProfile, 
    ComputeProfileCreateData, 
    ComputeProfileUpdateRequest,
    FallbackProviderRequest,
    CredentialValidationResponse,
    TrainingRecommendationsParams,
    TrainingRecommendationsResponse 
} from "@/types/compute";



// ============================================
// API FUNCTIONS
// ============================================

export const fetchComputeProviders = async (
  organizationId: string
): Promise<ComputeProvider[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/compute/providers`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch compute providers");
  }

  return response.json();
};

export const fetchComputeProfiles = async (
  organizationId: string
): Promise<ComputeProfile[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/compute/profiles`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch compute profiles");
  }

  return response.json();
};

export const fetchComputeProfile = async (
  organizationId: string,
  profileId: string
): Promise<ComputeProfile> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/compute/profiles/${profileId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch compute profile");
  }

  return response.json();
};

export const createComputeProfile = async (
  organizationId: string,
  request: ComputeProfileCreateData
): Promise<ComputeProfile> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/compute/profiles`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create compute profile' }));
    throw new Error(error.message || 'Failed to create compute profile');
  }

  return response.json();
};

export const updateComputeProfile = async (
  organizationId: string,
  profileId: string,
  request: ComputeProfileUpdateRequest
): Promise<ComputeProfile> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/compute/profiles/${profileId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update compute profile' }));
    throw new Error(error.message || 'Failed to update compute profile');
  }

  return response.json();
};

export const deleteComputeProfile = async (
  organizationId: string,
  profileId: string
): Promise<void> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/compute/profiles/${profileId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete compute profile' }));
    throw new Error(error.message || 'Failed to delete compute profile');
  }
};

export const addFallbackProvider = async (
  organizationId: string,
  profileId: string,
  request: FallbackProviderRequest
): Promise<{ message: string }> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/compute/profiles/${profileId}/fallback`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to add fallback provider' }));
    throw new Error(error.message || 'Failed to add fallback provider');
  }

  return response.json();
};

export const validateProfileCredentials = async (
  organizationId: string,
  profileId: string
): Promise<CredentialValidationResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/compute/profiles/${profileId}/validate`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to validate credentials");
  }

  return response.json();
};

export const fetchTrainingRecommendations = async (
  organizationId: string,
  params: TrainingRecommendationsParams = {}
): Promise<TrainingRecommendationsResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const queryParams = new URLSearchParams();
  if (params.model_size_mb !== undefined) {
    queryParams.append('model_size_mb', params.model_size_mb.toString());
  }
  if (params.dataset_size_gb !== undefined) {
    queryParams.append('dataset_size_gb', params.dataset_size_gb.toString());
  }

  const url = `${baseURL}/api/v1/compute/recommendations${queryParams.toString() ? `?${queryParams}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch training recommendations");
  }

  return response.json();
};

// ============================================
// HOOKS
// ============================================

export const useComputeProviders = () => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['computeProviders', currentOrganization?.id],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchComputeProviders(currentOrganization.id);
    },
    enabled: !!currentOrganization,
    staleTime: 5 * 60 * 1000, // 5 minutes - providers don't change often
  });
};

export const useComputeProfiles = () => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['computeProfiles', currentOrganization?.id],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchComputeProfiles(currentOrganization.id);
    },
    enabled: !!currentOrganization,
    staleTime: 2 * 60 * 1000,
  });
};

export const useComputeProfile = (profileId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['computeProfile', currentOrganization?.id, profileId],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchComputeProfile(currentOrganization.id, profileId);
    },
    enabled: !!currentOrganization && !!profileId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateComputeProfile = (options?: {
  onSuccess?: (data: ComputeProfile) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (request: ComputeProfileCreateData) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return createComputeProfile(currentOrganization.id, request);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['computeProfiles'] });

      if (showToast) {
        toast.success('Compute profile created successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to create compute profile');
      }

      onError?.(error);
    },
  });
};

export const useUpdateComputeProfile = (options?: {
  onSuccess?: (data: ComputeProfile) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ profileId, request }: { profileId: string; request: ComputeProfileUpdateRequest }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return updateComputeProfile(currentOrganization.id, profileId, request);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['computeProfile', currentOrganization?.id, data.id] });
      queryClient.invalidateQueries({ queryKey: ['computeProfiles'] });

      if (showToast) {
        toast.success('Compute profile updated successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to update compute profile');
      }

      onError?.(error);
    },
  });
};

export const useDeleteComputeProfile = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (profileId: string) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return deleteComputeProfile(currentOrganization.id, profileId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['computeProfile'] });
      queryClient.invalidateQueries({ queryKey: ['computeProfiles'] });

      if (showToast) {
        toast.success('Compute profile deleted successfully');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to delete compute profile');
      }

      onError?.(error);
    },
  });
};

export const useAddFallbackProvider = (options?: {
  onSuccess?: (data: { message: string }) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ profileId, request }: { profileId: string; request: FallbackProviderRequest }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return addFallbackProvider(currentOrganization.id, profileId, request);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['computeProfile'] });
      queryClient.invalidateQueries({ queryKey: ['computeProfiles'] });

      if (showToast) {
        toast.success(data.message || 'Fallback provider added successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to add fallback provider');
      }

      onError?.(error);
    },
  });
};

export const useValidateProfileCredentials = (options?: {
  onSuccess?: (data: CredentialValidationResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (profileId: string) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return validateProfileCredentials(currentOrganization.id, profileId);
    },

    onSuccess: (data) => {
      if (showToast) {
        if (data.valid) {
          toast.success(data.message || 'Credentials validated successfully');
        } else {
          toast.error(data.message || 'Credential validation failed');
        }
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to validate credentials');
      }

      onError?.(error);
    },
  });
};

export const useTrainingRecommendations = (params: TrainingRecommendationsParams = {}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['trainingRecommendations', currentOrganization?.id, params],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchTrainingRecommendations(currentOrganization.id, params);
    },
    enabled: !!currentOrganization,
    staleTime: 1 * 60 * 1000, // 1 minute - recommendations can change based on current load
  });
};