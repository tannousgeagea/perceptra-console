// hooks/useBillingRateCards.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { BillingRateCard, BillingRateCardCreate } from "@/types/billing";

// ============================================
// TYPES
// ============================================

export interface UpdateRateCardPayload {
  name?: string;
  is_active?: boolean;
  currency?: string;
  rate_new_annotation?: number;
  rate_untouched_prediction?: number;
  rate_minor_edit?: number;
  rate_major_edit?: number;
  rate_class_change?: number;
  rate_deletion?: number;
  rate_missed_object?: number;
  rate_image_review?: number;
  rate_annotation_review?: number;
  quality_bonus_threshold?: number | null;
  quality_bonus_multiplier?: number | null;
}

export interface DuplicateRateCardPayload {
  new_name: string;
  new_project_id?: string | null;
}

// ============================================
// API FUNCTIONS
// ============================================

export const listRateCards = async (
  organizationId: string,
  filters?: {
    project_id?: string | null;
    is_active?: boolean;
  }
): Promise<BillingRateCard[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const params = new URLSearchParams();
  if (filters?.project_id !== undefined) params.append('project_id', filters.project_id || '');
  if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

  const response = await fetch(
    `${baseURL}/api/v1/billing/organizations/rate-cards?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch rate cards' }));
    throw new Error(error.detail || 'Failed to fetch rate cards');
  }

  return response.json();
};

export const getRateCard = async (
  organizationId: string,
  rateCardId: string
): Promise<BillingRateCard> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/rate-cards/${rateCardId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch rate card' }));
    throw new Error(error.detail || 'Failed to fetch rate card');
  }

  return response.json();
};

export const createRateCard = async (
  organizationId: string,
  payload: BillingRateCardCreate
): Promise<BillingRateCard> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/organizations/rate-cards`,
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
    const error = await response.json().catch(() => ({ detail: 'Failed to create rate card' }));
    throw new Error(error.detail || 'Failed to create rate card');
  }

  return response.json();
};

export const updateRateCard = async (
  organizationId: string,
  rateCardId: string,
  payload: UpdateRateCardPayload
): Promise<BillingRateCard> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/rate-cards/${rateCardId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update rate card' }));
    throw new Error(error.detail || 'Failed to update rate card');
  }

  return response.json();
};

export const duplicateRateCard = async (
  organizationId: string,
  rateCardId: string,
  payload: DuplicateRateCardPayload
): Promise<BillingRateCard> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/rate-cards/${rateCardId}/duplicate`,
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
    const error = await response.json().catch(() => ({ detail: 'Failed to duplicate rate card' }));
    throw new Error(error.detail || 'Failed to duplicate rate card');
  }

  return response.json();
};

export const deleteRateCard = async (
  organizationId: string,
  rateCardId: string,
  hardDelete: boolean = false
): Promise<void> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = `${baseURL}/api/v1/billing/rate-cards/${rateCardId}${
    hardDelete ? '?hard_delete=true' : ''
  }`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete rate card' }));
    throw new Error(error.detail || 'Failed to delete rate card');
  }
};

// ============================================
// QUERY HOOKS
// ============================================

export const useRateCards = (
  filters?: {
    project_id?: string | null;
    is_active?: boolean;
  },
  options?: {
    enabled?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['rate-cards', currentOrganization?.id, filters],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return listRateCards(currentOrganization.id, filters);
    },
    enabled: !!currentOrganization && (options?.enabled ?? true),
  });
};

export const useRateCard = (
  rateCardId: string,
  options?: {
    enabled?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['rate-card', rateCardId, currentOrganization?.id],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getRateCard(currentOrganization.id, rateCardId);
    },
    enabled: !!currentOrganization && !!rateCardId && (options?.enabled ?? true),
  });
};

// ============================================
// MUTATION HOOKS
// ============================================

export const useCreateRateCard = (
  options?: {
    onSuccess?: (data: BillingRateCard) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (payload: BillingRateCardCreate) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return createRateCard(currentOrganization.id, payload);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rate-cards', currentOrganization?.id] });

      if (showToast) {
        toast.success('Rate card created successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to create rate card');
      }

      onError?.(error);
    },
  });
};

export const useUpdateRateCard = (
  options?: {
    onSuccess?: (data: BillingRateCard) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ rateCardId, payload }: { rateCardId: string; payload: UpdateRateCardPayload }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return updateRateCard(currentOrganization.id, rateCardId, payload);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rate-cards', currentOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ['rate-card', data.rate_card_id, currentOrganization?.id] });

      if (showToast) {
        toast.success('Rate card updated successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to update rate card');
      }

      onError?.(error);
    },
  });
};

export const useDuplicateRateCard = (
  options?: {
    onSuccess?: (data: BillingRateCard) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ rateCardId, payload }: { rateCardId: string; payload: DuplicateRateCardPayload }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return duplicateRateCard(currentOrganization.id, rateCardId, payload);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rate-cards', currentOrganization?.id] });

      if (showToast) {
        toast.success('Rate card duplicated successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to duplicate rate card');
      }

      onError?.(error);
    },
  });
};

export const useDeleteRateCard = (
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
    mutationFn: ({ rateCardId, hardDelete = false }: { rateCardId: string; hardDelete?: boolean }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return deleteRateCard(currentOrganization.id, rateCardId, hardDelete);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-cards', currentOrganization?.id] });

      if (showToast) {
        toast.success('Rate card deleted successfully');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to delete rate card');
      }

      onError?.(error);
    },
  });
};