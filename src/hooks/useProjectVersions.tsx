import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "./useAuthHelpers";
import { ListVersionsParams, DatasetVersionsResponse, VersionCreate, VersionUpdate } from "@/types/version";


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