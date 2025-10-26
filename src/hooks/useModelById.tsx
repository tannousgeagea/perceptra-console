import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { Model } from "@/types/models";

// Fetcher
const fetchModelById = async (modelId: string): Promise<Model> => {
  const res = await fetch(`${baseURL}/api/v1/models/${modelId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch model");
  }

  return res.json();
};

// Hook
export const useModelById = (modelId: string) => {
  return useQuery<Model>({
    queryKey: ["model", modelId],
    queryFn: () => fetchModelById(modelId),
    enabled: !!modelId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
