import type {
  APIKey,
  CreateAPIKeyRequest,
  CreateAPIKeyResponse,
  UpdateAPIKeyRequest,
  RevokeAPIKeyResponse,
  APIKeyUsageStats,
} from '@/types/api-keys';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockKeys: APIKey[] = [
  {
    id: 1,
    prefix: 'vsk_live_abc',
    name: 'Production Key',
    description: 'SDK access for production environment',
    scope: 'organization',
    user_id: null,
    user_username: null,
    permission: 'write',
    is_active: true,
    usage_count: 1523,
    last_used_at: new Date(Date.now() - 5 * 60000).toISOString(),
    created_at: '2024-11-15T10:00:00Z',
    expires_at: '2025-05-15T10:00:00Z',
    rate_limit_per_minute: 60,
    rate_limit_per_hour: 1000,
    created_by_username: 'john_doe',
  },
  {
    id: 2,
    prefix: 'vsk_live_xyz',
    name: 'Development Key',
    description: 'For development and testing',
    scope: 'user',
    user_id: 2,
    user_username: 'alice',
    permission: 'read',
    is_active: true,
    usage_count: 45,
    last_used_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    created_at: '2025-01-20T08:00:00Z',
    expires_at: '2025-04-20T08:00:00Z',
    rate_limit_per_minute: 30,
    rate_limit_per_hour: 500,
    created_by_username: 'alice',
  },
  {
    id: 3,
    prefix: 'vsk_live_def',
    name: 'Old Integration Key',
    description: 'Legacy pipeline integration',
    scope: 'organization',
    user_id: null,
    user_username: null,
    permission: 'admin',
    is_active: false,
    usage_count: 8942,
    last_used_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    created_at: '2024-06-01T12:00:00Z',
    expires_at: '2025-01-01T12:00:00Z',
    rate_limit_per_minute: 120,
    rate_limit_per_hour: 5000,
    created_by_username: 'john_doe',
  },
];

export const apiKeysApi = {
  async list(filters?: { is_active?: boolean; scope?: string }): Promise<APIKey[]> {
    await delay(600);
    let keys = [...mockKeys];
    if (filters?.is_active !== undefined) {
      keys = keys.filter((k) => k.is_active === filters.is_active);
    }
    if (filters?.scope && filters.scope !== 'all') {
      keys = keys.filter((k) => k.scope === filters.scope);
    }
    return keys;
  },

  async get(keyId: number): Promise<APIKey> {
    await delay(400);
    const key = mockKeys.find((k) => k.id === keyId);
    if (!key) throw new Error('API key not found');
    return key;
  },

  async create(data: CreateAPIKeyRequest): Promise<CreateAPIKeyResponse> {
    await delay(1000);
    const newKey: APIKey = {
      id: Math.floor(Math.random() * 10000),
      prefix: `vsk_live_${Math.random().toString(36).substr(2, 3)}`,
      name: data.name,
      description: data.description || null,
      scope: data.scope,
      user_id: data.user_id || null,
      user_username: data.user_id ? 'selected_user' : null,
      permission: data.permission,
      is_active: true,
      usage_count: 0,
      last_used_at: null,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + data.expires_in_days * 86400000).toISOString(),
      rate_limit_per_minute: data.rate_limit_per_minute,
      rate_limit_per_hour: data.rate_limit_per_hour,
      created_by_username: 'current_user',
    };
    return {
      message: "API key created successfully. SAVE THIS KEY - it won't be shown again!",
      api_key: `vsk_live_${Math.random().toString(36).substr(2, 32)}`,
      key_info: newKey,
    };
  },

  async update(keyId: number, data: UpdateAPIKeyRequest): Promise<APIKey> {
    await delay(800);
    const key = mockKeys.find((k) => k.id === keyId);
    if (!key) throw new Error('API key not found');
    return { ...key, ...data };
  },

  async revoke(keyId: number): Promise<RevokeAPIKeyResponse> {
    await delay(600);
    const key = mockKeys.find((k) => k.id === keyId);
    if (!key) throw new Error('API key not found');
    return {
      message: 'API key revoked successfully',
      key_id: keyId,
      prefix: key.prefix,
      is_active: false,
    };
  },

  async renew(keyId: number, days: number): Promise<APIKey> {
    await delay(600);
    const key = mockKeys.find((k) => k.id === keyId);
    if (!key) throw new Error('API key not found');
    return {
      ...key,
      expires_at: new Date(new Date(key.expires_at).getTime() + days * 86400000).toISOString(),
    };
  },

  async delete(keyId: number): Promise<void> {
    await delay(500);
  },

  async getUsage(keyId: number, days: number = 7): Promise<APIKeyUsageStats> {
    await delay(700);
    const key = mockKeys.find((k) => k.id === keyId);
    if (!key) throw new Error('API key not found');
    return {
      key_id: keyId,
      prefix: key.prefix,
      total_requests: key.usage_count,
      period_days: days,
      top_endpoints: [
        { endpoint: '/projects', method: 'GET', count: 845 },
        { endpoint: '/images/upload', method: 'POST', count: 432 },
        { endpoint: '/annotations', method: 'GET', count: 156 },
        { endpoint: '/models/train', method: 'POST', count: 90 },
      ],
      by_status_code: [
        { status_code: 200, count: 1450 },
        { status_code: 201, count: 50 },
        { status_code: 400, count: 15 },
        { status_code: 429, count: 8 },
      ],
      avg_response_time_ms: 145.32,
    };
  },
};
