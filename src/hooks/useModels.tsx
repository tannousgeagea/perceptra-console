// hooks/useModels.ts

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { 
  ModelCreateRequest,
  ModelListItem,
  ModelDetail,
  TrainingTriggerRequest,
  TrainingTriggerResponse,
  ModelUpdateRequest
} from "@/types/models";

// ============================================
// API FUNCTIONS
// ============================================

export const createModel = async (
  organizationId: string,
  projectId: string,
  request: ModelCreateRequest
): Promise<ModelDetail> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/models/projects/${projectId}/models`,
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
    const error = await response.json().catch(() => ({ message: 'Failed to create model' }));
    throw new Error(error.message || 'Failed to create model');
  }

  return response.json();
};

export const fetchProjectModels = async (
  organizationId: string,
  projectId: string
): Promise<ModelListItem[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/models/projects/${projectId}/models`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch models");
  }

  return response.json();
};

export const fetchModelDetail = async (
  organizationId: string,
  modelId: string
): Promise<ModelDetail> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/models/${modelId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch model details");
  }

  return response.json();
};

export const triggerTraining = async (
  organizationId: string,
  modelId: string,
  request: TrainingTriggerRequest
): Promise<TrainingTriggerResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/models/${modelId}/train`,
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
    const error = await response.json().catch(() => ({ message: 'Failed to trigger training' }));
    throw new Error(error.message || 'Failed to trigger training');
  }

  return response.json();
};

export const updateModel = async (
  organizationId: string,
  modelId: string,
  request: ModelUpdateRequest
): Promise<ModelDetail> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/models/${modelId}`,
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
    const error = await response.json().catch(() => ({ message: 'Failed to update model' }));
    throw new Error(error.message || 'Failed to update model');
  }

  return response.json();
};

export const deleteModel = async (
  organizationId: string,
  modelId: string
): Promise<void> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/models/${modelId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete model' }));
    throw new Error(error.message || 'Failed to delete model');
  }
};


export const duplicateModel = async (
  organizationId: string,
  modelId: string,
  newName?: string
): Promise<ModelDetail> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const url = new URL(`${baseURL}/api/v1/models/${modelId}/duplicate`);
  if (newName) {
    url.searchParams.append('new_name', newName);
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to duplicate model' }));
    throw new Error(error.message || 'Failed to duplicate model');
  }

  return response.json();
};

// ============================================
// HOOKS
// ============================================

export const useCreateModel = (options?: {
  onSuccess?: (data: ModelDetail) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ projectId, request }: { projectId: string; request: ModelCreateRequest }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return createModel(currentOrganization.id, projectId, request);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectModels'] });

      if (showToast) {
        toast.success('Model created successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to create model');
      }

      onError?.(error);
    },
  });
};

export const useProjectModels = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['projectModels', currentOrganization?.id, projectId],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchProjectModels(currentOrganization.id, projectId);
    },
    enabled: !!currentOrganization && !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useModelDetail = (modelId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['modelDetail', currentOrganization?.id, modelId],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchModelDetail(currentOrganization.id, modelId);
    },
    enabled: !!currentOrganization && !!modelId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useTriggerTraining = (options?: {
  onSuccess?: (data: TrainingTriggerResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ modelId, request }: { modelId: string; request: TrainingTriggerRequest }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return triggerTraining(currentOrganization.id, modelId, request);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['modelDetail'] });
      queryClient.invalidateQueries({ queryKey: ['projectModels'] });

      if (showToast) {
        toast.success(data.message || 'Training started successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to start training');
      }

      onError?.(error);
    },
  });
};

export const useUpdateModel = (options?: {
  onSuccess?: (data: ModelDetail) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ modelId, request }: { modelId: string; request: ModelUpdateRequest }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return updateModel(currentOrganization.id, modelId, request);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['modelDetail', currentOrganization?.id, data.id] });
      queryClient.invalidateQueries({ queryKey: ['projectModels'] });

      if (showToast) {
        toast.success('Model updated successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to update model');
      }

      onError?.(error);
    },
  });
};

export const useDeleteModel = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (modelId: string) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return deleteModel(currentOrganization.id, modelId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelDetail'] });
      queryClient.invalidateQueries({ queryKey: ['projectModels'] });

      if (showToast) {
        toast.success('Model deleted successfully');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to delete model');
      }

      onError?.(error);
    },
  });
};

export const useDuplicateModel = (options?: {
  onSuccess?: (data: ModelDetail) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ modelId, newName }: { modelId: string; newName?: string }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return duplicateModel(currentOrganization.id, modelId, newName);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectModels'] });

      if (showToast) {
        toast.success('Model duplicated successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to duplicate model');
      }

      onError?.(error);
    },
  });
};