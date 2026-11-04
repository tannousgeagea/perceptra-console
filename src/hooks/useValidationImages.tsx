import { apiFetch } from '@/services/apiClient';
import { useQuery } from "@tanstack/react-query";
import { ValidationImage } from "@/types/validation";

interface ValidationImagesResponse {
  count: number;
  limit: number;
  offset: number;
  results: ValidationImage[];
}

export const useValidationImages = (
  modelVersionId: number | undefined,
  limit: number,
  offset: number
) => {
  return useQuery<ValidationImagesResponse>({
    queryKey: ["validation-images", modelVersionId, limit, offset],
    queryFn: async () => {
      const res = await apiFetch(
        `/api/v1/model-version/${modelVersionId}/validation-images?limit=${limit}&offset=${offset}`
      );
      if (!res.ok) throw new Error("Failed to fetch validation images");
      return res.json();
    },
    enabled: !!modelVersionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
