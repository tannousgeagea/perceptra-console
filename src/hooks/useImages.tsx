
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import type { ImagesResponse, ImagesParams } from "@/types/image";

export const fetchImages = async (
  organizationId: string,
  params: ImagesParams = {}
): Promise<ImagesResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const { skip = 0, limit = 100, from_date, to_date, tags } = params;
  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  if (from_date) queryParams.append("from_date", from_date);
  if (to_date) queryParams.append("to_date", to_date);
  if (tags) queryParams.append("tags", tags);

  const response = await fetch(`${baseURL}/api/v1/images?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-ID": organizationId,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }

  return response.json();
};

export const useImages = (params: ImagesParams = {}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ["images", currentOrganization?.id, params],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchImages(currentOrganization.id, params);
    },
    enabled: !!currentOrganization,
    staleTime: 2 * 60 * 1000,
  });
};

