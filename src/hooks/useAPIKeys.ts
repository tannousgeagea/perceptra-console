import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import {
  fetchAPIKeys,
  fetchAPIKey,
  createAPIKey,
  updateAPIKey,
  revokeAPIKey,
  renewAPIKey,
  deleteAPIKey,
  fetchAPIKeyUsage,
} from '@/lib/api-keys';
import type { CreateAPIKeyRequest, UpdateAPIKeyRequest } from '@/types/api-keys';

// ============================================
// HOOKS
// ============================================

export function useAPIKeys(
  filters?: { is_active?: boolean; scope?: string },
  options?: {
    onError?: (error: Error) => void;
  }
) {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['api-keys', currentOrganization?.id, filters],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error('No organization selected');
      }
      return fetchAPIKeys(currentOrganization.id, filters);
    },
    enabled: !!currentOrganization,
    staleTime: 30 * 1000, // 30 seconds
    onError: options?.onError,
  });
}

export function useAPIKey(
  keyId: number | null,
  options?: {
    onError?: (error: Error) => void;
  }
) {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['api-key', currentOrganization?.id, keyId],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error('No organization selected');
      }
      return fetchAPIKey(currentOrganization.id, keyId!);
    },
    enabled: !!currentOrganization && !!keyId,
    staleTime: 30 * 1000,
    onError: options?.onError,
  });
}

export function useCreateAPIKey(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (data: CreateAPIKeyRequest) => {
      if (!currentOrganization) {
        throw new Error('No organization selected');
      }
      return createAPIKey(currentOrganization.id, data);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });

      if (showToast) {
        toast.success('API key created successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to create API key');
      }

      onError?.(error);
    },
  });
}

export function useUpdateAPIKey(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ keyId, data }: { keyId: number; data: UpdateAPIKeyRequest }) => {
      if (!currentOrganization) {
        throw new Error('No organization selected');
      }
      return updateAPIKey(currentOrganization.id, keyId, data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      queryClient.invalidateQueries({ queryKey: ['api-key'] });

      if (showToast) {
        toast.success('API key updated successfully');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to update API key');
      }

      onError?.(error);
    },
  });
}

export function useRevokeAPIKey(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (keyId: number) => {
      if (!currentOrganization) {
        throw new Error('No organization selected');
      }
      return revokeAPIKey(currentOrganization.id, keyId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      queryClient.invalidateQueries({ queryKey: ['api-key'] });

      if (showToast) {
        toast.success('API key revoked successfully');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to revoke API key');
      }

      onError?.(error);
    },
  });
}

export function useRenewAPIKey(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ keyId, days }: { keyId: number; days: number }) => {
      if (!currentOrganization) {
        throw new Error('No organization selected');
      }
      return renewAPIKey(currentOrganization.id, keyId, days);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      queryClient.invalidateQueries({ queryKey: ['api-key'] });

      if (showToast) {
        toast.success('API key renewed successfully');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to renew API key');
      }

      onError?.(error);
    },
  });
}

export function useDeleteAPIKey(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (keyId: number) => {
      if (!currentOrganization) {
        throw new Error('No organization selected');
      }
      return deleteAPIKey(currentOrganization.id, keyId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      queryClient.invalidateQueries({ queryKey: ['api-key'] });

      if (showToast) {
        toast.success('API key deleted successfully');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to delete API key');
      }

      onError?.(error);
    },
  });
}

export function useAPIKeyUsage(
  keyId: number | null,
  days: number = 7,
  options?: {
    onError?: (error: Error) => void;
  }
) {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['api-key-usage', currentOrganization?.id, keyId, days],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error('No organization selected');
      }
      return fetchAPIKeyUsage(currentOrganization.id, keyId!, days);
    },
    enabled: !!currentOrganization && !!keyId,
    staleTime: 60 * 1000, // 60 seconds
    onError: options?.onError,
  });
}