// hooks/useContractors.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { 
  Contractor, 
  ContractorFilters, 
  ContractorEnableRequest,
  ContractorEnableResponse,
  UserBillingSummary,
  BillableAction,
  BillableActionFilters,
} from "@/types/billing";

// ============================================
// RESPONSE NORMALIZERS
// Backend may return numeric fields as strings (e.g. "0.00") and IDs as integers
// ============================================

const toNum = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return isNaN(n) ? 0 : n;
};

const normalizeContractor = (c: Contractor): Contractor => ({
  ...c,
  user_id: String(c.user_id),
  total_unbilled_amount: toNum(c.total_unbilled_amount),
  total_actions_this_month: toNum(c.total_actions_this_month),
});

const normalizeBillingSummary = (s: UserBillingSummary): UserBillingSummary => ({
  ...s,
  user_id: String(s.user_id),
  total_amount: toNum(s.total_amount),
  total_billed: toNum(s.total_billed),
  total_unbilled: toNum(s.total_unbilled),
  avg_rate: s.avg_rate != null ? toNum(s.avg_rate) : undefined,
  action_breakdown: (s.action_breakdown ?? []).map(item => ({
    ...item,
    unit_rate: toNum(item.unit_rate),
    total_amount: toNum(item.total_amount),
  })),
});

const normalizeBillableAction = (a: BillableAction): BillableAction => ({
  ...a,
  unit_rate: toNum(a.unit_rate),
  total_amount: toNum(a.total_amount),
});

// ============================================
// API FUNCTIONS
// ============================================

export const listOrganizationContractors = async (
  organizationId: string,
  filters?: ContractorFilters
): Promise<Contractor[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const params = new URLSearchParams();
  if (filters?.billing_enabled !== undefined) params.append('billing_enabled', String(filters.billing_enabled));
  if (filters?.has_unbilled_actions !== undefined) params.append('has_unbilled_actions', String(filters.has_unbilled_actions));

  const response = await fetch(
    `${baseURL}/api/v1/billing/organizations/${organizationId}/contractors?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch contractors' }));
    throw new Error(error.detail || 'Failed to fetch contractors');
  }

  const data: Contractor[] = await response.json();
  return data.map(normalizeContractor);
};

export const listProjectContractors = async (
  organizationId: string,
  projectId: string,
  filters?: { billing_enabled?: boolean }
): Promise<Contractor[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const params = new URLSearchParams();
  if (filters?.billing_enabled !== undefined) params.append('billing_enabled', String(filters.billing_enabled));

  const response = await fetch(
    `${baseURL}/api/v1/billing/projects/${projectId}/contractors?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch project contractors' }));
    throw new Error(error.detail || 'Failed to fetch project contractors');
  }

  const data: Contractor[] = await response.json();
  return data.map(normalizeContractor);
};

export const enableOrgMemberBilling = async (
  organizationId: string,
  userId: string,
  payload: ContractorEnableRequest
): Promise<{ message: string; backfill_task_id?: string }> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/organizations/${organizationId}/members/${userId}/billing/enable`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to enable billing' }));
    throw new Error(error.detail || 'Failed to enable billing');
  }

  return response.json();
};

export const enableProjectMemberBilling = async (
  organizationId: string,
  projectId: string,
  userId: string,
  payload: Omit<ContractorEnableRequest, 'contractor_company | contract_start_date' | 'contract_end_date'>
): Promise<{ message: string; backfill_task_id?: string }> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/projects/${projectId}/members/${userId}/billing/enable`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to enable project billing' }));
    throw new Error(error.detail || 'Failed to enable project billing');
  }

  return response.json();
};

export const getOrgMemberBillingSummary = async (
  organizationId: string,
  userId: string,
  filters?: { start_date?: string; end_date?: string }
): Promise<UserBillingSummary> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);

  const response = await fetch(
    `${baseURL}/api/v1/billing/organizations/${organizationId}/members/${userId}/summary?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch billing summary' }));
    throw new Error(error.detail || 'Failed to fetch billing summary');
  }

  const data: UserBillingSummary = await response.json();
  return normalizeBillingSummary(data);
};

export const getProjectMemberBillingSummary = async (
  organizationId: string,
  projectId: string,
  userId: string,
  filters?: { start_date?: string; end_date?: string }
): Promise<UserBillingSummary> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);

  const response = await fetch(
    `${baseURL}/api/v1/billing/projects/${projectId}/members/${userId}/summary?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch project billing summary' }));
    throw new Error(error.detail || 'Failed to fetch project billing summary');
  }

  const data: UserBillingSummary = await response.json();
  return normalizeBillingSummary(data);
};

export const getUserBillableActions = async (
  organizationId: string,
  userId: string,
  filters?: BillableActionFilters,
  pagination?: { limit?: number; offset?: number }
): Promise<BillableAction[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.action_type) params.append('action_type', filters.action_type);
  if (filters?.is_billed !== undefined) params.append('is_billed', String(filters.is_billed));
  if (pagination?.limit) params.append('limit', String(pagination.limit));
  if (pagination?.offset) params.append('offset', String(pagination.offset));

  const response = await fetch(
    `${baseURL}/api/v1/billing/organizations/${organizationId}/members/${userId}/actions?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch billable actions' }));
    throw new Error(error.detail || 'Failed to fetch billable actions');
  }

  const data: BillableAction[] = await response.json();
  return data.map(normalizeBillableAction);
};

// ============================================
// QUERY HOOKS
// ============================================

export const useOrganizationContractors = (
  filters?: ContractorFilters,
  options?: {
    enabled?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['contractors', 'organization', currentOrganization?.id, filters],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return listOrganizationContractors(currentOrganization.id, filters);
    },
    enabled: !!currentOrganization && (options?.enabled ?? true),
  });
};

export const useProjectContractors = (
  projectId: string,
  filters?: { billing_enabled?: boolean },
  options?: {
    enabled?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['contractors', 'project', projectId, currentOrganization?.id, filters],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return listProjectContractors(currentOrganization.id, projectId, filters);
    },
    enabled: !!currentOrganization && !!projectId && (options?.enabled ?? true),
  });
};

export const useOrgMemberBillingSummary = (
  userId: string,
  filters?: { start_date?: string; end_date?: string },
  options?: {
    enabled?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['billing-summary', 'organization', currentOrganization?.id, userId, filters],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getOrgMemberBillingSummary(currentOrganization.id, userId, filters);
    },
    enabled: !!currentOrganization && !!userId && (options?.enabled ?? true),
  });
};

export const useProjectMemberBillingSummary = (
  projectId: string,
  userId: string,
  filters?: { start_date?: string; end_date?: string },
  options?: {
    enabled?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['billing-summary', 'project', projectId, currentOrganization?.id, userId, filters],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getProjectMemberBillingSummary(currentOrganization.id, projectId, userId, filters);
    },
    enabled: !!currentOrganization && !!projectId && !!userId && (options?.enabled ?? true),
  });
};

export const useUserBillableActions = (
  userId: string,
  filters?: BillableActionFilters,
  pagination?: { limit?: number; offset?: number },
  options?: {
    enabled?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['billable-actions', currentOrganization?.id, userId, filters],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getUserBillableActions(currentOrganization.id, userId, filters);
    },
    enabled: !!currentOrganization && !!userId && (options?.enabled ?? true),
  });
};

// ============================================
// MUTATION HOOKS
// ============================================

export const useEnableOrgMemberBilling = (
  options?: {
    onSuccess?: (data: { message: string; backfill_task_id?: string }) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: ContractorEnableRequest }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return enableOrgMemberBilling(currentOrganization.id, userId, payload);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contractors', 'organization', currentOrganization?.id] });

      if (showToast) {
        toast.success('Contractor billing enabled successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to enable contractor billing');
      }

      onError?.(error);
    },
  });
};

export const useEnableProjectMemberBilling = (
  projectId: string,
  options?: {
    onSuccess?: (data: { message: string; backfill_task_id?: string }) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: Omit<ContractorEnableRequest, 'contractor_company' | 'contract_start_date' | 'contract_end_date'> }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return enableProjectMemberBilling(currentOrganization.id, projectId, userId, payload);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contractors', 'project', projectId, currentOrganization?.id] });

      if (showToast) {
        toast.success('Project contractor billing enabled successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to enable project contractor billing');
      }

      onError?.(error);
    },
  });
};