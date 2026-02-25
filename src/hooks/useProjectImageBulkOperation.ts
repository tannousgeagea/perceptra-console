
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { BulkReviewPayload, BulkReviewResponse } from "@/types/bulk-operation";
import { BulkMarkNullPayload, BulkMarkNullResponse } from "@/types/bulk-operation";
import { BulkDeleteProjectImagesPayload, BulkDeleteProjectImagesResponse } from "@/types/bulk-operation";
import { BulkTagImagesPayload, BulkTagImagesResponse } from "@/types/bulk-operation";
import { BulkDeleteImagesPayload, BulkDeleteImagesResponse } from "@/types/bulk-operation";


// ---------------------------------
// Bulk Rebiew
// ---------------------------------
export const bulkReviewProjectImages = async (
  organizationId: string,
  projectId: string,
  payload: BulkReviewPayload
): Promise<BulkReviewResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/images/bulk-review`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Failed to bulk review images",
    }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useBulkReviewProjectImages = (
  projectId: string,
  options?: {
    onSuccess?: (data: BulkReviewResponse) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  return useMutation({
    mutationFn: (payload: BulkReviewPayload) => {
      if (!currentOrganization)
        throw new Error("No organization selected");
      return bulkReviewProjectImages(
        currentOrganization.id,
        projectId,
        payload
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projectImages", projectId], exact:false });
      if (showToast) toast.success(data.message);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};

// ------------------------------------
// Mark Null project Image
// ------------------------------------
export const bulkMarkImagesAsNull = async (
  organizationId: string,
  projectId: string,
  payload: BulkMarkNullPayload
): Promise<BulkMarkNullResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/images/bulk-mark-null`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Failed to bulk mark images",
    }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useBulkMarkImagesAsNull = (
  projectId: string,
  options?: {
    onSuccess?: (data: BulkMarkNullResponse) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  return useMutation({
    mutationFn: (payload: BulkMarkNullPayload) => {
      if (!currentOrganization)
        throw new Error("No organization selected");
      return bulkMarkImagesAsNull(
        currentOrganization.id,
        projectId,
        payload
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projectImages", projectId], exact:false });
      if (showToast) toast.success(data.message);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};


// -------------------------------------
// Bulk Delete Project Image
// -------------------------------------
export const bulkDeleteProjectImages = async (
  organizationId: string,
  projectId: string,
  payload: BulkDeleteProjectImagesPayload
): Promise<BulkDeleteProjectImagesResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/images`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Failed to bulk delete images",
    }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useBulkDeleteProjectImages = (
  projectId: string,
  options?: {
    onSuccess?: (data: BulkDeleteProjectImagesResponse) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  return useMutation({
    mutationFn: (payload: BulkDeleteProjectImagesPayload) => {
      if (!currentOrganization)
        throw new Error("No organization selected");
      return bulkDeleteProjectImages(
        currentOrganization.id,
        projectId,
        payload
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projectImages", projectId] });
      if (showToast) toast.success(data.message);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};

// ----------------------------------------
// Bulk tagging image
// ----------------------------------------
export const bulkAddTagsToImages = async (
  organizationId: string,
  payload: BulkTagImagesPayload
): Promise<BulkTagImagesResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/images/bulk-tags`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Failed to bulk tag images",
    }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useBulkAddTagsToImages = (options?: {
  onSuccess?: (data: BulkTagImagesResponse) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  return useMutation({
    mutationFn: (payload: BulkTagImagesPayload) => {
      if (!currentOrganization)
        throw new Error("No organization selected");
      return bulkAddTagsToImages(currentOrganization.id, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["images", currentOrganization?.id], exact:false });
      if (showToast) toast.success(data.message);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};


// --------------------------------------
// Bulk Delete Images
// --------------------------------------
export const bulkDeleteImages = async (
  organizationId: string,
  payload: BulkDeleteImagesPayload
): Promise<BulkDeleteImagesResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/images`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Failed to bulk delete images",
    }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useBulkDeleteImages = (options?: {
  onSuccess?: (data: BulkDeleteImagesResponse) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  if (!currentOrganization) return

  return useMutation({
    mutationFn: (payload: BulkDeleteImagesPayload) => {
      if (!currentOrganization)
        throw new Error("No organization selected");
      return bulkDeleteImages(currentOrganization.id, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["images", currentOrganization.id], exact:false });
      if (showToast) toast.success(data.message);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};
