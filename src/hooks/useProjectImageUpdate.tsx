// hooks/useProjectImages.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

export interface ReviewImagePayload {
  approved: boolean;
  feedback?: string;
}

export interface MarkNullPayload {
  is_null: boolean;
  reason?: string;
}

export interface ReviewImageResponse {
  message: string;
  project_image_id: string;
  status: string;
  reviewed: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface MarkNullResponse {
  message: string;
  project_image_id: string;
  marked_as_null: boolean;
  status: string;
  is_active: boolean;
  metadata?: any;
}

export interface FinalizeImageResponse {
  message: string;
  project_image_id: string;
  status: string;
  finalized: boolean;
}

export interface BatchFinalizeResponse {
  message: string;
  finalized_count: number;
  invalid_ids: number[];
  total_requested: number;
}

// ============================================
// API FUNCTIONS
// ============================================

export const reviewProjectImage = async (
  organizationId: string,
  projectId: string,
  projectImageId: number,
  payload: ReviewImagePayload
): Promise<ReviewImageResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/images/${projectImageId}/review`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to review image' }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const markImageAsNull = async (
  organizationId: string,
  projectId: string,
  projectImageId: number,
  payload: MarkNullPayload
): Promise<MarkNullResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/images/${projectImageId}/mark-null`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to mark image' }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const finalizeImage = async (
  organizationId: string,
  projectId: string,
  projectImageId: number
): Promise<FinalizeImageResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/images/${projectImageId}/finalize`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to finalize image' }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const deleteProjectImage = async (
  organizationId: string,
  projectId: string,
  projectImageId: number,
  hardDelete: boolean = false
): Promise<void> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) throw new Error("No authentication token found");

  const url = `${baseURL}/api/v1/projects/${projectId}/images/${projectImageId}${
    hardDelete ? '?hard_delete=true' : ''
  }`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete image' }));
    throw new Error(error.detail);
  }
};

export const batchFinalizeImages = async (
  organizationId: string,
  projectId: string,
  projectImageIds: number[]
): Promise<BatchFinalizeResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/images/batch-finalize`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project_image_ids: projectImageIds }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to batch finalize' }));
    throw new Error(error.detail);
  }

  return response.json();
};

// ============================================
// HOOKS
// ============================================

export const useReviewProjectImage = (projectId: string, options?: {
  onSuccess?: (data: ReviewImageResponse) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ projectImageId, payload }: { 
      projectImageId: number; 
      payload: ReviewImagePayload 
    }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return reviewProjectImage(currentOrganization.id, projectId, projectImageId, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectImages', projectId] });
      if (showToast) toast.success(data.message);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};

export const useMarkImageAsNull = (projectId: string, options?: {
  onSuccess?: (data: MarkNullResponse) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ projectImageId, payload }: { 
      projectImageId: number; 
      payload: MarkNullPayload 
    }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return markImageAsNull(currentOrganization.id, projectId, projectImageId, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectImages', projectId] });
      queryClient.invalidateQueries({ queryKey: ['annotations', projectId] });
      if (showToast) toast.success(data.message);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};

export const useFinalizeImage = (projectId: string, options?: {
  onSuccess?: (data: FinalizeImageResponse) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  return useMutation({
    mutationFn: (projectImageId: number) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return finalizeImage(currentOrganization.id, projectId, projectImageId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectImages', projectId] });
      if (showToast) toast.success(data.message);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};

export const useDeleteProjectImage = (projectId: string, options?: {
  onSuccess?: () => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ projectImageId, hardDelete = false }: { 
      projectImageId: number; 
      hardDelete?: boolean 
    }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return deleteProjectImage(currentOrganization.id, projectId, projectImageId, hardDelete);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectImages', projectId] });
      if (showToast) toast.success('Image deleted successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};

export const useBatchFinalizeImages = (projectId: string, options?: {
  onSuccess?: (data: BatchFinalizeResponse) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  return useMutation({
    mutationFn: (projectImageIds: number[]) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return batchFinalizeImages(currentOrganization.id, projectId, projectImageIds);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectImages', projectId] });
      if (showToast) toast.success(data.message);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};

// Usage: const { mutate: reviewImage } = useReviewProjectImage(projectId);
// reviewImage({ projectImageId: 123, payload: { approved: true, feedback: 'Looks good!' } });