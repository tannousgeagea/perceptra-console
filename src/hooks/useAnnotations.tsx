// hooks/useAnnotations.ts

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { ListAnnotationsParams, AnnotationsListResponse } from "@/types/annotation";

// ============================================
// TYPES
// ============================================

export interface CreateAnnotationPayload {
  annotation_type: string;
  annotation_class_name: string;
  data: [number, number, number, number]; // [xmin, ymin, xmax, ymax]
  annotation_uid?: string;
  annotation_source?: string;
  confidence?: number;
}

export interface AnnotationOut {
  id: string;
  annotation_uid: string;
  type: string;
  class_id: number;
  class_name: string;
  color: string;
  data: [number, number, number, number];
  source?: string;
  confidence?: number;
  reviewed: boolean;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}


export interface AnnotationResponse {
  message: string;
  annotation: AnnotationOut;
}

// ============================================
// API FUNCTIONS
// ============================================

export const createAnnotation = async (
  organizationId: string,
  projectId: string,
  projectImageId: number,
  payload: CreateAnnotationPayload
): Promise<AnnotationResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/images/${projectImageId}/annotations`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: 'Failed to create annotation' 
    }));
    throw new Error(error.detail || 'Failed to create annotation');
  }

  return response.json();
};

// ============================================
// HOOKS
// ============================================

export const useCreateAnnotation = (
  projectId: string,
  projectImageId: number,
  options?: {
    onSuccess?: (data: AnnotationResponse) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (payload: CreateAnnotationPayload) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return createAnnotation(
        currentOrganization.id,
        projectId,
        projectImageId,
        payload
      );
    },

    onSuccess: (data) => {
      // Invalidate image annotations query
      queryClient.invalidateQueries({ 
        queryKey: ['annotations', projectId, projectImageId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['projectImage', projectId, projectImageId] 
      });

      if (showToast) {
        toast.success(data.message);
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to create annotation');
      }

      onError?.(error);
    },
  });
};

// ============================================
// Classes List
// ============================================

export const fetchAnnotations = async (
  organizationId: string,
  projectId: string,
  projectImageId: number,
  params: ListAnnotationsParams = {}
): Promise<AnnotationsListResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const queryParams = new URLSearchParams();
  if (params.include_inactive) {
    queryParams.append('include_inactive', 'true');
  }

  const url = `${baseURL}/api/v1/projects/${projectId}/images/${projectImageId}/annotations${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: 'Failed to fetch annotations' 
    }));
    throw new Error(error.detail || 'Failed to fetch annotations');
  }

  return response.json();
};

export const useAnnotations = (
  projectId: string,
  projectImageId: number,
  params: ListAnnotationsParams = {}
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['annotations', projectId, projectImageId, params],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchAnnotations(
        currentOrganization.id,
        projectId,
        projectImageId,
        params
      );
    },
    enabled: !!currentOrganization && !!projectId && !!projectImageId,
    staleTime: 30 * 1000, // 30 seconds
  });
};


export const deleteAnnotation = async (
  organizationId: string,
  projectId: string,
  annotationId: string,
  deleteParams: { hardDelete?: boolean } = {}
): Promise<void> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const url = new URL(`${baseURL}/api/v1/projects/${projectId}/annotations/${annotationId}`);
  if (deleteParams.hardDelete) {
    url.searchParams.set("hard_delete", "true");
  }

  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-ID": organizationId,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to delete annotation" }));
    throw new Error(error.message || "Failed to delete annotation");
  }
};

// ----------- REACT QUERY HOOK -----------

export const useDeleteAnnotation = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: async ({
      projectId,
      annotationId,
      hardDelete = false,
    }: {
      projectId: string;
      annotationId: string;
      hardDelete?: boolean;
    }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return deleteAnnotation(
        currentOrganization.id,
        projectId,
        annotationId,
        { hardDelete }
      );
    },

    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["annotations", projectId] });

      if (showToast) {
        toast.success("Annotation deleted successfully");
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || "Failed to delete annotation");
      }

      onError?.(error);
    },
  });
};