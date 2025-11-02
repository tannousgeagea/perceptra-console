
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import type { JobImagesResponse } from "@/types/image";

interface JobImagesParams {
  skip?: number;
  limit?: number;
  status?: string;
  annotated?: boolean;
}

export const fetchJobImages = async (
  organizationId: string,
  projectId: string,
  jobId: string,
  params: JobImagesParams = {}
): Promise<JobImagesResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const { skip = 0, limit = 100, status, annotated } = params;

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (status) queryParams.append("status", status);
  if (annotated !== undefined) queryParams.append("annotated", annotated.toString());

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/jobs/${jobId}/images?${queryParams}`,
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

export const useJobImages = (
  projectId: string,
  jobId: string,
  params: JobImagesParams = {}
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ["job-images", currentOrganization?.id, projectId, jobId, params],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchJobImages(currentOrganization.id, projectId, jobId, params);
    },
    refetchOnWindowFocus: true,   // auto-refresh when user switches back to tab
    refetchOnReconnect: true, 
    enabled: !!currentOrganization && !!projectId && !!jobId,
    staleTime: 0,                 // treat data as stale immediately when revisiting
    gcTime: 5 * 60 * 1000 
  });
};