import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "./useAuthHelpers";
import { 
  ListVersionsParams, 
  DatasetVersionsResponse, 
  VersionCreate, 
  VersionUpdate,
  VersionImageAdd,
  ListVersionImagesParams,
  ListVersionImagesResponse,
  AddVersionImagesResponse,
  DownloadDatasetResponse,
  ExportConfig,
  ExportDatasetResponse
} from "@/types/version";
import { toast } from 'sonner';

/**
 * Fetch all dataset versions for a project.
 */
export const fetchProjectVersions = async (
  organizationId: string,
  projectId: string,
  params?: ListVersionsParams
): Promise<DatasetVersionsResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  // Build query string
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append("skip", params.skip.toString());
  if (params?.limit !== undefined) queryParams.append("limit", params.limit.toString());
  if (params?.export_status) queryParams.append("export_status", params.export_status);

  const queryString = queryParams.toString();
  const url = `${baseURL}/api/v1/projects/${projectId}/versions${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch project versions");
  
  return response.json();
};

/**
 * React Query hook to get project versions.
 */
export const useProjectVersions = (
  projectId: string,
  params?: ListVersionsParams
) => {
  const { currentOrganization } = useCurrentOrganization();
  
  return useQuery<DatasetVersionsResponse, Error>({
    queryKey: ["projectVersions", currentOrganization?.id, projectId, params],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchProjectVersions(currentOrganization.id, projectId, params);
    },
    enabled: !!currentOrganization && !!projectId,
    staleTime: 60_000, // 1 minute caching
  });
};


/**
 * Create a new dataset version for a project.
 */
export const createProjectVersion = async (
  organizationId: string,
  projectId: string,
  data: VersionCreate
): Promise<DatasetVersionsResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/versions`,
    {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create project version");
  }
  
  return response.json();
};

/**
 * React Query mutation hook to create a project version.
 */
export const useCreateProjectVersion = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();
  const queryClient = useQueryClient();
  
  return useMutation<DatasetVersionsResponse, Error, VersionCreate>({
    mutationFn: (data: VersionCreate) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return createProjectVersion(currentOrganization.id, projectId, data);
    },
    onSuccess: () => {
      // Invalidate the versions list to refetch after creating a new version
      queryClient.invalidateQueries({
        queryKey: ["projectVersions", currentOrganization?.id, projectId]
      });
    },
  });
};

/**
 * Update an existing dataset version.
 */
export const updateProjectVersion = async (
  organizationId: string,
  projectId: string,
  versionId: string,
  data: VersionUpdate
): Promise<DatasetVersionsResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/versions/${versionId}`,
    {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update project version");
  }
  
  return response.json();
};

/**
 * React Query mutation hook to update a project version.
 */
export const useUpdateProjectVersion = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();
  const queryClient = useQueryClient();
  
  return useMutation<DatasetVersionsResponse, Error, { versionId: string; data: VersionUpdate }>({
    mutationFn: ({ versionId, data }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return updateProjectVersion(
        currentOrganization.id, 
        projectId, 
        versionId, 
        data
      );
    },
    onSuccess: () => {
      // Invalidate the versions list to refetch after updating
      queryClient.invalidateQueries({
        queryKey: ["projectVersions", currentOrganization?.id, projectId]
      });
    },
  });
};

/**
 * Delete a dataset version.
 */
export const deleteProjectVersion = async (
  organizationId: string,
  projectId: string,
  versionId: string
): Promise<void> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/versions/${versionId}`,
    {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete project version");
  }
  
  // DELETE returns 204 No Content, so no response body to parse
};

/**
 * React Query mutation hook to delete a project version.
 */
export const useDeleteProjectVersion = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (versionId: string) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return deleteProjectVersion(
        currentOrganization.id, 
        projectId, 
        versionId
      );
    },
    onSuccess: () => {
      // Invalidate the versions list to refetch after deleting
      queryClient.invalidateQueries({
        queryKey: ["projectVersions", currentOrganization?.id, projectId]
      });
    },
  });
};

// ==================== LIST VERSION IMAGES ====================

/**
 * Fetch images in a dataset version.
 */
export const fetchVersionImages = async (
  organizationId: string,
  projectId: string,
  versionId: string,
  params?: ListVersionImagesParams
): Promise<ListVersionImagesResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append("skip", params.skip.toString());
  if (params?.limit !== undefined) queryParams.append("limit", params.limit.toString());
  if (params?.split) queryParams.append("split", params.split);
  if (params?.q) queryParams.append("q", params.q);

  const queryString = queryParams.toString();
  const url = `${baseURL}/api/v1/projects/${projectId}/versions/${versionId}/images${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch version images");
  
  return response.json();
};

/**
 * React Query hook to get version images.
 */
export const useVersionImages = (
  projectId: string,
  versionId: string,
  params?: ListVersionImagesParams
) => {
  const { currentOrganization } = useCurrentOrganization();
  
  return useQuery<ListVersionImagesResponse, Error>({
    queryKey: ["versionImages", currentOrganization?.id, projectId, versionId, params],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchVersionImages(currentOrganization.id, projectId, versionId, params);
    },
    enabled: !!currentOrganization && !!projectId && !!versionId,
    staleTime: 60_000, // 1 minute caching
  });
};

// ==================== ADD IMAGES TO VERSION ====================

/**
 * Add images to a dataset version.
 */
export const addImagesToVersion = async (
  organizationId: string,
  projectId: string,
  versionId: string,
  data: VersionImageAdd
): Promise<AddVersionImagesResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/versions/${versionId}/images`,
    {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to add images to version");
  }
  
  return response.json();
};

/**
 * React Query mutation hook to add images to version.
 */
export const useAddImagesToVersion = (projectId: string, versionId: string) => {
  const { currentOrganization } = useCurrentOrganization();
  const queryClient = useQueryClient();
  
  return useMutation<AddVersionImagesResponse, Error, VersionImageAdd>({
    mutationFn: (data: VersionImageAdd) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return addImagesToVersion(currentOrganization.id, projectId, versionId, data);
    },
    onSuccess: () => {
      // Invalidate version images list
      queryClient.invalidateQueries({
        queryKey: ["versionImages", currentOrganization?.id, projectId, versionId]
      });
      // Invalidate version details to update counts
      queryClient.invalidateQueries({
        queryKey: ["projectVersions", currentOrganization?.id, projectId]
      });
    },
  });
};

// ==================== REMOVE IMAGES FROM VERSION ====================

/**
 * Remove images from a dataset version.
 */
export const removeImagesFromVersion = async (
  organizationId: string,
  projectId: string,
  versionId: string,
  projectImageIds: number[]
): Promise<void> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/versions/${versionId}/images`,
    {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectImageIds ),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to remove images from version");
  }
  
  // DELETE returns 204 No Content
};

/**
 * React Query mutation hook to remove images from version.
 */
export const useRemoveImagesFromVersion = (projectId: string, versionId: string) => {
  const { currentOrganization } = useCurrentOrganization();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number[]>({
    mutationFn: (projectImageIds: number[]) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return removeImagesFromVersion(
        currentOrganization.id, 
        projectId, 
        versionId, 
        projectImageIds
      );
    },
    onSuccess: () => {
      // Invalidate version images list
      queryClient.invalidateQueries({
        queryKey: ["versionImages", currentOrganization?.id, projectId, versionId]
      });
      // Invalidate version details to update counts
      queryClient.invalidateQueries({
        queryKey: ["projectVersions", currentOrganization?.id, projectId]
      });
    },
  });
};


// ###################################################
// Download Version
// ###################################################

export const downloadDataset = async (
  organizationId: string,
  projectId: string,
  versionId: string
): Promise<DownloadDatasetResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/versions/${versionId}/download`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get download URL' }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useDownloadDataset = (projectId: string, options?: {
  onSuccess?: (data: DownloadDatasetResponse) => void;
  showToast?: boolean;
}) => {
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  return useMutation({
    mutationFn: (versionId: string) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return downloadDataset(currentOrganization.id, projectId, versionId);
    },
    onSuccess: (data) => {
      if (showToast) toast.success("Download URL generated");
      // Trigger download
      // window.open(data.download_url, '_blank');
      const link = document.createElement("a");
      link.href = data.download_url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};

// #########################################################
// Export Dataset
// #########################################################

export const exportDataset = async (
  organizationId: string,
  projectId: string,
  versionId: string,
  config?: ExportConfig
): Promise<ExportDatasetResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/versions/${versionId}/export`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: config ? JSON.stringify(config) : undefined,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to start export' }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useExportDataset = (projectId: string, options?: {
  onSuccess?: (data: ExportDatasetResponse) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ versionId, config }: { versionId: string; config?: ExportConfig }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return exportDataset(currentOrganization.id, projectId, versionId, config);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
      if (showToast) toast.success(data.message);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message);
    },
  });
};