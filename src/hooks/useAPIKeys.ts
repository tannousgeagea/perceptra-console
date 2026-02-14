import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysApi } from '@/lib/api-keys';
import type { CreateAPIKeyRequest, UpdateAPIKeyRequest } from '@/types/api-keys';

export function useAPIKeys(filters?: { is_active?: boolean; scope?: string }) {
  return useQuery({
    queryKey: ['api-keys', filters],
    queryFn: () => apiKeysApi.list(filters),
  });
}

export function useAPIKey(keyId: number | null) {
  return useQuery({
    queryKey: ['api-key', keyId],
    queryFn: () => apiKeysApi.get(keyId!),
    enabled: !!keyId,
  });
}

export function useCreateAPIKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAPIKeyRequest) => apiKeysApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useUpdateAPIKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ keyId, data }: { keyId: number; data: UpdateAPIKeyRequest }) =>
      apiKeysApi.update(keyId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useRevokeAPIKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyId: number) => apiKeysApi.revoke(keyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useRenewAPIKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ keyId, days }: { keyId: number; days: number }) =>
      apiKeysApi.renew(keyId, days),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useDeleteAPIKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyId: number) => apiKeysApi.delete(keyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useAPIKeyUsage(keyId: number | null, days: number = 7) {
  return useQuery({
    queryKey: ['api-key-usage', keyId, days],
    queryFn: () => apiKeysApi.getUsage(keyId!, days),
    enabled: !!keyId,
  });
}
