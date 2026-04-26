// hooks/useCompute.ts

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
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
  TrainingRecommendationsResponse,
} from "@/types/compute";

// ============================================
// API FUNCTIONS
// ============================================

export const fetchComputeProviders = async (): Promise<ComputeProvider[]> => {
  const response = await apiFetch(`/api/v1/compute/providers`);
  if (!response.ok) throw new Error("Failed to fetch compute providers");
  return response.json();
};

export const fetchComputeProfiles = async (): Promise<ComputeProfile[]> => {
  const response = await apiFetch(`/api/v1/compute/profiles`);
  if (!response.ok) throw new Error("Failed to fetch compute profiles");
  return response.json();
};

export const fetchComputeProfile = async (profileId: string): Promise<ComputeProfile> => {
  const response = await apiFetch(`/api/v1/compute/profiles/${profileId}`);
  if (!response.ok) throw new Error("Failed to fetch compute profile");
  return response.json();
};

export const createComputeProfile = async (
  request: ComputeProfileCreateData
): Promise<ComputeProfile> => {
  const response = await apiFetch(`/api/v1/compute/profiles`, {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to create compute profile" }));
    throw new Error(error.message || "Failed to create compute profile");
  }
  return response.json();
};

export const updateComputeProfile = async (
  profileId: string,
  request: ComputeProfileUpdateRequest
): Promise<ComputeProfile> => {
  const response = await apiFetch(`/api/v1/compute/profiles/${profileId}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to update compute profile" }));
    throw new Error(error.message || "Failed to update compute profile");
  }
  return response.json();
};

export const deleteComputeProfile = async (profileId: string): Promise<void> => {
  const response = await apiFetch(`/api/v1/compute/profiles/${profileId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to delete compute profile" }));
    throw new Error(error.message || "Failed to delete compute profile");
  }
};

export const addFallbackProvider = async (
  profileId: string,
  request: FallbackProviderRequest
): Promise<{ message: string }> => {
  const response = await apiFetch(`/api/v1/compute/profiles/${profileId}/fallback`, {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to add fallback provider" }));
    throw new Error(error.message || "Failed to add fallback provider");
  }
  return response.json();
};

export const validateProfileCredentials = async (
  profileId: string
): Promise<CredentialValidationResponse> => {
  const response = await apiFetch(`/api/v1/compute/profiles/${profileId}/validate`);
  if (!response.ok) throw new Error("Failed to validate credentials");
  return response.json();
};

export const fetchTrainingRecommendations = async (
  params: TrainingRecommendationsParams = {}
): Promise<TrainingRecommendationsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.model_size_mb !== undefined)
    queryParams.append("model_size_mb", params.model_size_mb.toString());
  if (params.dataset_size_gb !== undefined)
    queryParams.append("dataset_size_gb", params.dataset_size_gb.toString());
  const qs = queryParams.toString();
  const response = await apiFetch(`/api/v1/compute/recommendations${qs ? `?${qs}` : ""}`);
  if (!response.ok) throw new Error("Failed to fetch training recommendations");
  return response.json();
};

// ============================================
// HOOKS
// ============================================

export const useComputeProviders = () => {
  const { currentOrganization } = useCurrentOrganization();
  return useQuery({
    queryKey: ["computeProviders", currentOrganization?.id],
    queryFn: fetchComputeProviders,
    enabled: !!currentOrganization,
    staleTime: 5 * 60 * 1000,
  });
};

export const useComputeProfiles = () => {
  const { currentOrganization } = useCurrentOrganization();
  return useQuery({
    queryKey: ["computeProfiles", currentOrganization?.id],
    queryFn: fetchComputeProfiles,
    enabled: !!currentOrganization,
    staleTime: 2 * 60 * 1000,
  });
};

export const useComputeProfile = (profileId: string) => {
  const { currentOrganization } = useCurrentOrganization();
  return useQuery({
    queryKey: ["computeProfile", currentOrganization?.id, profileId],
    queryFn: () => fetchComputeProfile(profileId),
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
      if (!currentOrganization) throw new Error("No organization selected");
      return createComputeProfile(request);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["computeProfiles"] });
      if (showToast) toast.success("Compute profile created successfully");
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message || "Failed to create compute profile");
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
      if (!currentOrganization) throw new Error("No organization selected");
      return updateComputeProfile(profileId, request);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["computeProfile", currentOrganization?.id, data.id] });
      queryClient.invalidateQueries({ queryKey: ["computeProfiles"] });
      if (showToast) toast.success("Compute profile updated successfully");
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message || "Failed to update compute profile");
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
      if (!currentOrganization) throw new Error("No organization selected");
      return deleteComputeProfile(profileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["computeProfile"] });
      queryClient.invalidateQueries({ queryKey: ["computeProfiles"] });
      if (showToast) toast.success("Compute profile deleted successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message || "Failed to delete compute profile");
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
      if (!currentOrganization) throw new Error("No organization selected");
      return addFallbackProvider(profileId, request);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["computeProfile"] });
      queryClient.invalidateQueries({ queryKey: ["computeProfiles"] });
      if (showToast) toast.success(data.message || "Fallback provider added successfully");
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message || "Failed to add fallback provider");
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
      if (!currentOrganization) throw new Error("No organization selected");
      return validateProfileCredentials(profileId);
    },
    onSuccess: (data) => {
      if (showToast) {
        if (data.valid) toast.success(data.message || "Credentials validated successfully");
        else toast.error(data.message || "Credential validation failed");
      }
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message || "Failed to validate credentials");
      onError?.(error);
    },
  });
};

export const useTrainingRecommendations = (params: TrainingRecommendationsParams = {}) => {
  const { currentOrganization } = useCurrentOrganization();
  return useQuery({
    queryKey: ["trainingRecommendations", currentOrganization?.id, params],
    queryFn: () => fetchTrainingRecommendations(params),
    enabled: !!currentOrganization,
    staleTime: 60 * 1000,
  });
};
