// hooks/useAgents.ts

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { 
  Agent, 
  AgentListItem, 
  RegisterAgentRequest, 
  RegisterAgentResponse 
} from "@/types/agent";

// ============================================
// TYPES
// ============================================

export interface ListAgentsParams {
  status?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

export const registerAgent = async (
  organizationId: string,
  request: RegisterAgentRequest
): Promise<RegisterAgentResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/agents/register`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to register agent' }));
    throw new Error(error.message || 'Failed to register agent');
  }

  return response.json();
};

export const fetchAgents = async (
  organizationId: string,
  params: ListAgentsParams = {}
): Promise<AgentListItem[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const queryParams = new URLSearchParams();
  if (params.status) {
    queryParams.append('status', params.status);
  }

  const url = `${baseURL}/api/v1/agents/${queryParams.toString() ? `?${queryParams}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch agents");
  }

  return response.json();
};

export const fetchAgentStats = async (
  organizationId: string,
  agentId: string
): Promise<Agent> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/agents/${agentId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch agent stats");
  }

  return response.json();
};

export const deleteAgent = async (
  organizationId: string,
  agentId: string
): Promise<{ message: string }> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/agents/${agentId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete agent' }));
    throw new Error(error.message || 'Failed to delete agent');
  }

  return response.json();
};

export const revokeAPIKey = async (
  organizationId: string,
  keyId: string
): Promise<{ message: string }> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/agents/keys/${keyId}/revoke`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to revoke API key' }));
    throw new Error(error.message || 'Failed to revoke API key');
  }

  return response.json();
};

export const regenerateAPIKey = async (
  organizationId: string,
  agentId: string
): Promise<RegisterAgentResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/agents/keys/${agentId}/regenerate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to regenerate API key' }));
    throw new Error(error.message || 'Failed to regenerate API key');
  }

  return response.json();
};

// ============================================
// HOOKS
// ============================================

export const useRegisterAgent = (options?: {
  onSuccess?: (data: RegisterAgentResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (request: RegisterAgentRequest) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return registerAgent(currentOrganization.id, request);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });

      if (showToast) {
        toast.success('Agent registered successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to register agent');
      }

      onError?.(error);
    },
  });
};

export const useAgents = (
  params: ListAgentsParams = {},
  options?: {
    pollingInterval?: number | false;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['agents', currentOrganization?.id, params],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchAgents(currentOrganization.id, params);
    },
    enabled: !!currentOrganization,
    staleTime: 30 * 1000, // 30 seconds - agents update frequently with heartbeats
    refetchInterval: options?.pollingInterval ?? false,
    refetchIntervalInBackground: true,
  });
};

export const useAgentStats = (agentId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['agentStats', currentOrganization?.id, agentId],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchAgentStats(currentOrganization.id, agentId);
    },
    enabled: !!currentOrganization && !!agentId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30s for live stats
  });
};

export const useDeleteAgent = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (agentId: string) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return deleteAgent(currentOrganization.id, agentId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agentStats'] });

      if (showToast) {
        toast.success('Agent deleted successfully');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to delete agent');
      }

      onError?.(error);
    },
  });
};

export const useRevokeAPIKey = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (keyId: string) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return revokeAPIKey(currentOrganization.id, keyId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agentStats'] });

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
};

export const useRegenerateAPIKey = (options?: {
  onSuccess?: (data: RegisterAgentResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (agentId: string) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return regenerateAPIKey(currentOrganization.id, agentId);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agentStats'] });

      if (showToast) {
        toast.success('API key regenerated successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to regenerate API key');
      }

      onError?.(error);
    },
  });
};