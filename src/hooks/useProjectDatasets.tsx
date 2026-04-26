import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import { Dataset } from "@/types/models";

export const useProjectDatasets = (projectId: string) => {
  return useQuery({
    queryKey: ["datasets", projectId],
    queryFn: async (): Promise<Dataset[]> => {
      const res = await apiFetch(`/api/v1/projects/${projectId}/datasets`);
      if (!res.ok) throw new Error("Failed to fetch datasets");
      const data: Array<{
        id: string;
        name: string;
        version?: number;
        item_count?: number;
        created_at?: string;
      }> = await res.json();
      return data.map((d) => ({
        id: d.id,
        name: d.name,
        version: d.version !== undefined ? String(d.version) : undefined,
        itemCount: d.item_count,
        createdAt: d.created_at,
      }));
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};
