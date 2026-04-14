// hooks/useInvoices.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { Invoice, InvoiceGenerateRequest, InvoiceFilters } from "@/types/billing";

// ============================================
// API FUNCTIONS
// ============================================

export const generateInvoice = async (
  organizationId: string,
  payload: InvoiceGenerateRequest
): Promise<Invoice> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/organizations/invoices/generate`,
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
    const error = await response.json().catch(() => ({ detail: 'Failed to generate invoice' }));
    throw new Error(error.detail || 'Failed to generate invoice');
  }

  return response.json();
};

export const listInvoices = async (
  organizationId: string,
  filters?: InvoiceFilters,
  pagination?: { limit?: number; offset?: number }
): Promise<Invoice[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const params = new URLSearchParams();
  params.append('org_id', organizationId)
  if (filters?.client_org_id) params.append('client_org_id', filters.client_org_id);
  if (filters?.project_id) params.append('project_id', filters.project_id);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (pagination?.limit) params.append('limit', String(pagination.limit));
  if (pagination?.offset) params.append('offset', String(pagination.offset));

  const response = await fetch(
    `${baseURL}/api/v1/billing/organizations/invoices?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch invoices' }));
    throw new Error(error.detail || 'Failed to fetch invoices');
  }

  return response.json();
};

export const getInvoice = async (
  organizationId: string,
  invoiceId: string
): Promise<Invoice> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/invoices/${invoiceId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch invoice' }));
    throw new Error(error.detail || 'Failed to fetch invoice');
  }

  return response.json();
};

export const issueInvoice = async (
  organizationId: string,
  invoiceId: string
): Promise<Invoice> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/invoices/${invoiceId}/issue`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to issue invoice' }));
    throw new Error(error.detail || 'Failed to issue invoice');
  }

  return response.json();
};

export const markInvoicePaid = async (
  organizationId: string,
  invoiceId: string,
  payload?: {
    payment_date?: string;
    payment_notes?: string;
  }
): Promise<Invoice> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/invoices/${invoiceId}/mark-paid`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload || {}),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to mark invoice as paid' }));
    throw new Error(error.detail || 'Failed to mark invoice as paid');
  }

  return response.json();
};

export const cancelInvoice = async (
  organizationId: string,
  invoiceId: string,
  reason?: string
): Promise<void> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/invoices/${invoiceId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to cancel invoice' }));
    throw new Error(error.detail || 'Failed to cancel invoice');
  }
};

// ============================================
// QUERY HOOKS
// ============================================

export const useInvoices = (
  filters?: InvoiceFilters,
  options?: {
    enabled?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['invoices', currentOrganization?.id, filters],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return listInvoices(currentOrganization.id, filters);
    },
    enabled: !!currentOrganization && (options?.enabled ?? true),
  });
};

export const useInvoice = (
  invoiceId: string,
  options?: {
    enabled?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['invoice', invoiceId, currentOrganization?.id],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getInvoice(currentOrganization.id, invoiceId);
    },
    enabled: !!currentOrganization && !!invoiceId && (options?.enabled ?? true),
  });
};

// ============================================
// MUTATION HOOKS
// ============================================

export const useGenerateInvoice = (
  options?: {
    onSuccess?: (data: Invoice) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (payload: InvoiceGenerateRequest) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return generateInvoice(currentOrganization.id, payload);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', currentOrganization?.id] });

      if (showToast) {
        toast.success('Invoice generated successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to generate invoice');
      }

      onError?.(error);
    },
  });
};

export const useIssueInvoice = (
  options?: {
    onSuccess?: (data: Invoice) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (invoiceId: string) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return issueInvoice(currentOrganization.id, invoiceId);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', currentOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoice_id, currentOrganization?.id] });

      if (showToast) {
        toast.success('Invoice issued successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to issue invoice');
      }

      onError?.(error);
    },
  });
};

export const useMarkInvoicePaid = (
  options?: {
    onSuccess?: (data: Invoice) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ 
      invoiceId, 
      payload 
    }: { 
      invoiceId: string; 
      payload?: { payment_date?: string; payment_notes?: string } 
    }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return markInvoicePaid(currentOrganization.id, invoiceId, payload);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', currentOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoice_id, currentOrganization?.id] });

      if (showToast) {
        toast.success('Invoice marked as paid');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to mark invoice as paid');
      }

      onError?.(error);
    },
  });
};

export const useCancelInvoice = (
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ invoiceId, reason }: { invoiceId: string; reason?: string }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return cancelInvoice(currentOrganization.id, invoiceId, reason);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', currentOrganization?.id] });

      if (showToast) {
        toast.success('Invoice cancelled successfully');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to cancel invoice');
      }

      onError?.(error);
    },
  });
};