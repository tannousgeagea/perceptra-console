import { apiFetch } from '@/services/apiClient';
import { useQuery } from '@tanstack/react-query';
import { metricsData } from '@/types/validation';


export function useValidationMetrics(modelVersionId: number | undefined) {
  return useQuery<metricsData>({
    queryKey: ['validation-metrics', modelVersionId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/validation/metrics/${modelVersionId}`);
      if (!res.ok) throw new Error('Failed to fetch validation metrics');
      return res.json();
    },
    enabled: !!modelVersionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}