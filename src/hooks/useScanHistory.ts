import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchScans, fetchScan, fetchScanStats, cancelScan } from '@/lib/similarity';
import type { ScanListParams, ScanHistoryStatus } from '@/types/similarity';
import { toast } from 'sonner';

export function useScanList(params: ScanListParams) {
  return useQuery({
    queryKey: ['scans', params],
    queryFn: () => fetchScans(params),
  });
}

export function useScanStats() {
  return useQuery({
    queryKey: ['scan-stats'],
    queryFn: fetchScanStats,
  });
}

export function useLiveScan(scanId: string, status: ScanHistoryStatus) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => fetchScan(scanId),
    enabled: status === 'running' || status === 'pending',
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s && s !== 'running' && s !== 'pending') {
        // Scan finished — show toast and invalidate list
        if (s === 'completed') {
          toast.success(`Scan finished — ${query.state.data?.clusters_found ?? 0} clusters found`);
        } else if (s === 'failed') {
          toast.error('Scan failed — see error log');
        }
        queryClient.invalidateQueries({ queryKey: ['scans'] });
        queryClient.invalidateQueries({ queryKey: ['scan-stats'] });
        return false;
      }
      return 2000;
    },
  });
}

export function useCancelScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelScan,
    onSuccess: () => {
      toast.success('Scan cancelled');
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['scan-stats'] });
    },
    onError: () => {
      toast.error('Failed to cancel scan');
    },
  });
}
