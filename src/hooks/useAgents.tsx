// hooks/useAgents.ts

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import {
  Agent,
  AgentListItem,
  RegisterAgentRequest,
  RegisterAgentResponse,
} from "@/types/agent";

export interface ListAgentsParams {
  status?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

export const registerAgent = async (request: RegisterAgentRequest): Promise<RegisterAgentResponse> => {
  const response = await apiFetch(`/api/v1/agents/register`, {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to register agent" }));
    throw new Error(error.message || "Failed to register agent");
  }
  return response.json();
};

export const fetchAgents = async (params: ListAgentsParams = {}): Promise<AgentListItem[]> => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append("status", params.status);
  const qs = queryParams.toString();
  const response = await apiFetch(`/api/v1/agents/${qs ? `?${qs}` : ""}`);
  if (!response.ok) throw new Error("Failed to fetch agents");
  return response.json();
};

export const fetchAgentStats = async (agentId: string): Promise<Agent> => {
  const response = await apiFetch(`/api/v1/agents/${agentId}`);
  if (!response.ok) throw new Error("Failed to fetch agent stats");
  return response.json();
};

export const deleteAgent = async (agentId: string): Promise<{ message: string }> => {
  const response = await apiFetch(`/api/v1/agents/${agentId}`, { method: "DELETE" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to delete agent" }));
    throw new Error(error.message || "Failed to delete agent");
  }
  return response.json();
};

export const revokeAPIKey = async (keyId: string): Promise<{ message: string }> => {
  const response = await apiFetch(`/api/v1/agents/keys/${keyId}/revoke`, { method: "POST" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to revoke API key" }));
    throw new Error(error.message || "Failed to revoke API key");
  }
  return response.json();
};

export const regenerateAPIKey = async (agentId: string): Promise<RegisterAgentResponse> => {
  const response = await apiFetch(`/api/v1/agents/keys/${agentId}/regenerate`, { method: "POST" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to regenerate API key" }));
    throw new Error(error.message || "Failed to regenerate API key");
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
      if (!currentOrganization) throw new Error("No organization selected");
      return registerAgent(request);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      if (showToast) toast.success("Agent registered successfully");
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message || "Failed to register agent");
      onError?.(error);
    },
  });
};

export const useAgents = (
  params: ListAgentsParams = {},
  options?: { pollingInterval?: number | false }
) => {
  const { currentOrganization } = useCurrentOrganization();
  return useQuery({
    queryKey: ["agents", currentOrganization?.id, params],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchAgents(params);
    },
    enabled: !!currentOrganization,
    staleTime: 30 * 1000,
    refetchInterval: options?.pollingInterval ?? false,
    refetchIntervalInBackground: true,
  });
};

export const useAgentStats = (agentId: string) => {
  const { currentOrganization } = useCurrentOrganization();
  return useQuery({
    queryKey: ["agentStats", currentOrganization?.id, agentId],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchAgentStats(agentId);
    },
    enabled: !!currentOrganization && !!agentId,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
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
      if (!currentOrganization) throw new Error("No organization selected");
      return deleteAgent(agentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agentStats"] });
      if (showToast) toast.success("Agent deleted successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message || "Failed to delete agent");
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
      if (!currentOrganization) throw new Error("No organization selected");
      return revokeAPIKey(keyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agentStats"] });
      if (showToast) toast.success("API key revoked successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message || "Failed to revoke API key");
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
      if (!currentOrganization) throw new Error("No organization selected");
      return regenerateAPIKey(agentId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agentStats"] });
      if (showToast) toast.success("API key regenerated successfully");
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (showToast) toast.error(error.message || "Failed to regenerate API key");
      onError?.(error);
    },
  });
};
