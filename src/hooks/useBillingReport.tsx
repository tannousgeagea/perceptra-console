// hooks/useBillingReport.ts

import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { BillableActionSummary, BillingReport, BillingReportFilters } from "@/types/billing";

// ============================================
// API FUNCTIONS
// ============================================

export const getBillingReport = async (
  organizationId: string,
  filters?: BillingReportFilters
): Promise<BillingReport> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const params = new URLSearchParams();
  if (filters?.project_id) params.append('project_id', filters.project_id);
  if (filters?.user_id) params.append('user_id', filters.user_id);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);

  const response = await fetch(
    `${baseURL}/api/v1/billing/organizations/billing-report?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch billing report' }));
    throw new Error(error.detail || 'Failed to fetch billing report');
  }

  return response.json();
};

// ============================================
// QUERY HOOKS
// ============================================

export const useBillingReport = (
  filters?: BillingReportFilters,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['billing-report', currentOrganization?.id, filters],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getBillingReport(currentOrganization.id, filters);
    },
    enabled: !!currentOrganization && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
};