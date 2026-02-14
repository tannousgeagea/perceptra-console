import { baseURL } from '@/components/api/base';
import { authStorage } from '@/services/authService';
import { AUTH_STORAGE_KEYS } from '@/types/auth';
import type {
  APIKey,
  CreateAPIKeyRequest,
  CreateAPIKeyResponse,
  UpdateAPIKeyRequest,
  RevokeAPIKeyResponse,
  APIKeyUsageStats,
} from '@/types/api-keys';

// ============================================
// API FUNCTIONS
// ============================================

export const fetchAPIKeys = async (
  organizationId: string,
  filters?: { is_active?: boolean; scope?: string }
): Promise<APIKey[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error('No authentication token found');
  }

  const queryParams = new URLSearchParams();
  if (filters?.is_active !== undefined) {
    queryParams.append('is_active', String(filters.is_active));
  }
  if (filters?.scope && filters.scope !== 'all') {
    queryParams.append('scope', filters.scope);
  }

  const url = `${baseURL}/api/v1/api-keys${queryParams.toString() ? `?${queryParams}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch API keys' }));
    throw new Error(error.detail || 'Failed to fetch API keys');
  }

  return response.json();
};

export const fetchAPIKey = async (
  organizationId: string,
  keyId: number
): Promise<APIKey> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${baseURL}/api/v1/api-keys/${keyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'API key not found' }));
    throw new Error(error.detail || 'API key not found');
  }

  return response.json();
};

export const createAPIKey = async (
  organizationId: string,
  data: CreateAPIKeyRequest
): Promise<CreateAPIKeyResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${baseURL}/api/v1/api-keys`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Organization-ID': organizationId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create API key' }));
    throw new Error(error.detail || 'Failed to create API key');
  }

  return response.json();
};

export const updateAPIKey = async (
  organizationId: string,
  keyId: number,
  data: UpdateAPIKeyRequest
): Promise<APIKey> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${baseURL}/api/v1/api-keys/${keyId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Organization-ID': organizationId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update API key' }));
    throw new Error(error.detail || 'Failed to update API key');
  }

  return response.json();
};

export const revokeAPIKey = async (
  organizationId: string,
  keyId: number
): Promise<RevokeAPIKeyResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${baseURL}/api/v1/api-keys/${keyId}/revoke`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to revoke API key' }));
    throw new Error(error.detail || 'Failed to revoke API key');
  }

  return response.json();
};

export const renewAPIKey = async (
  organizationId: string,
  keyId: number,
  days: number
): Promise<APIKey> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${baseURL}/api/v1/api-keys/${keyId}/renew`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Organization-ID': organizationId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ days }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to renew API key' }));
    throw new Error(error.detail || 'Failed to renew API key');
  }

  return response.json();
};

export const deleteAPIKey = async (
  organizationId: string,
  keyId: number
): Promise<void> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${baseURL}/api/v1/api-keys/${keyId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete API key' }));
    throw new Error(error.detail || 'Failed to delete API key');
  }
};

export const fetchAPIKeyUsage = async (
  organizationId: string,
  keyId: number,
  days: number = 7
): Promise<APIKeyUsageStats> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${baseURL}/api/v1/api-keys/${keyId}/usage?days=${days}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch API key usage' }));
    throw new Error(error.detail || 'Failed to fetch API key usage');
  }

  return response.json();
};

// Legacy export for backwards compatibility
export const apiKeysApi = {
  list: fetchAPIKeys,
  get: fetchAPIKey,
  create: createAPIKey,
  update: updateAPIKey,
  revoke: revokeAPIKey,
  renew: renewAPIKey,
  delete: deleteAPIKey,
  getUsage: fetchAPIKeyUsage,
};