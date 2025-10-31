
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import type { ProjectImageResponse } from "@/types/image";

interface ProjectImagesParams {
  skip?: number;
  limit?: number;
  status?: string;
}

export const fetchJobImages = async (
  organizationId: string,
  projectId: string,
  params: ProjectImagesParams = {}
): Promise<ProjectImageResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const { skip = 0, limit = 100, status } = params;

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (status) queryParams.append("status", status);

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/images?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch job images");

  return response.json();
};

export const useProjectImages = (
  projectId: string,
  params: ProjectImagesParams = {}
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ["job-images", currentOrganization?.id, projectId, params],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchJobImages(currentOrganization.id, projectId, params);
    },
    enabled: !!currentOrganization && !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};