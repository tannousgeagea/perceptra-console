// hooks/useModelsByProject.ts
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import { ModelListItem } from "@/types/models";

export const fetchModelsByProject = async (projectId: string): Promise<ModelListItem[]> => {
  const res = await apiFetch(`/api/v1/models/projects/${projectId}/models`);

  if (!res.ok) {
    throw new Error("Failed to fetch models for project");
  }

  return res.json();
};

export const useModelsByProject = (projectId: string) => {
  return useQuery<ModelListItem[]>({
    queryKey: ["models", projectId],
    queryFn: () => fetchModelsByProject(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2,
  });
};
