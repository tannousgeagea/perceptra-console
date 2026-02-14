export interface APIKey {
  id: number;
  prefix: string;
  name: string;
  description: string | null;
  scope: 'organization' | 'user';
  user_id: number | null;
  user_username: string | null;
  permission: 'read' | 'write' | 'admin';
  is_active: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  expires_at: string;
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
  created_by_username: string;
}

export interface CreateAPIKeyRequest {
  name: string;
  description?: string;
  scope: 'organization' | 'user';
  user_id?: number;
  permission: 'read' | 'write' | 'admin';
  expires_in_days: number;
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
}

export interface UpdateAPIKeyRequest {
  name?: string;
  description?: string;
  permission?: 'read' | 'write' | 'admin';
  is_active?: boolean;
  rate_limit_per_minute?: number;
  rate_limit_per_hour?: number;
}

export interface CreateAPIKeyResponse {
  message: string;
  api_key: string;
  key_info: APIKey;
}

export interface RevokeAPIKeyResponse {
  message: string;
  key_id: number;
  prefix: string;
  is_active: boolean;
}

export interface APIKeyUsageStats {
  key_id: number;
  prefix: string;
  total_requests: number;
  period_days: number;
  top_endpoints: Array<{
    endpoint: string;
    method: string;
    count: number;
  }>;
  by_status_code: Array<{
    status_code: number;
    count: number;
  }>;
  avg_response_time_ms: number | null;
}

export type APIKeyStatusFilter = 'all' | 'active' | 'inactive';
export type APIKeyScopeFilter = 'all' | 'organization' | 'user';
export type APIKeyPermissionFilter = 'all' | 'read' | 'write' | 'admin';
