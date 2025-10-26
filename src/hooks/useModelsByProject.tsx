// hooks/useModelsByProject.ts
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { Model } from "@/types/models";

export const fetchModelsByProject = async (projectId: string): Promise<Model[]> => {
  const res = await fetch(`${baseURL}/api/v1/projects/${projectId}/models`);

  if (!res.ok) {
    throw new Error("Failed to fetch models for project");
  }

  return res.json();
};

export const useModelsByProject = (projectId: string) => {
  return useQuery<Model[]>({
    queryKey: ["models", projectId],
    queryFn: () => fetchModelsByProject(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
