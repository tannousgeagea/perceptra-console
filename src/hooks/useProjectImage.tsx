import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { ProjectImageOut } from "@/types/image";
import { useCurrentOrganization } from "./useAuthHelpers";

/**
 * Fetch detailed information about a project image including annotations, metadata, etc.
 */
export const fetchProjectImageDetails = async (
  organizationId: string,
  projectId: string,
  imageId: string
): Promise<ProjectImageOut> => {
    const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

    if (!token) {
    throw new Error("No authentication token found");
    }

    const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/images/${imageId}`, 
    {
        headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        },
    });

    if (!response.ok) throw new Error("Failed to fetch job images");
    
    return response.json();
};

/**
 * React Query hook to get project image details.
 */
export const useProjectImageDetails = (
  projectId: string,
  imageId: string
) => {
    const { currentOrganization } = useCurrentOrganization();
    
    return useQuery<ProjectImageOut, Error>({
        queryKey: ["projectImageDetails", currentOrganization?.id, projectId, imageId],
        queryFn: () => {
            if (!currentOrganization) throw new Error("No organization selected");
            return fetchProjectImageDetails(currentOrganization.id, projectId, imageId)
        },
        enabled: !!currentOrganization && !!projectId && !!imageId,
        staleTime: 60_000, // 1 minute caching
    });
};
