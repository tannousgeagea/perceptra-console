import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { Dataset } from "@/types/models";

export const useProjectDatasets = (projectId: string) => {
  return useQuery({
    queryKey: ["datasets", projectId],
    queryFn: async (): Promise<Dataset[]> => {
      const res = await fetch(`${baseURL}/api/v1/datasets/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch datasets");
      return res.json();
    },
    enabled: !!projectId
  });
};
