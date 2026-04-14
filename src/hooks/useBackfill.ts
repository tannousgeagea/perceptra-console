// hooks/useBackfill.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { BackfillTaskResponse, TaskStatus, BackfillRequest } from "@/types/billing";

// ============================================
// API FUNCTIONS
// ============================================

export const backfillUserInOrg = async (
  organizationId: string,
  userId: string,
  payload?: BackfillRequest
): Promise<BackfillTaskResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/organizations/members/${userId}/backfill`,
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
    const error = await response.json().catch(() => ({ detail: 'Failed to start backfill' }));
    throw new Error(error.detail || 'Failed to start backfill');
  }

  return response.json();
};

export const backfillUserInProject = async (
  organizationId: string,
  projectId: string,
  userId: string,
  payload?: BackfillRequest
): Promise<BackfillTaskResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/projects/${projectId}/members/${userId}/backfill`,
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
    const error = await response.json().catch(() => ({ detail: 'Failed to start project backfill' }));
    throw new Error(error.detail || 'Failed to start project backfill');
  }

  return response.json();
};

export const backfillOrganization = async (
  organizationId: string,
  payload?: BackfillRequest
): Promise<BackfillTaskResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/organizations/backfill`,
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
    const error = await response.json().catch(() => ({ detail: 'Failed to start organization backfill' }));
    throw new Error(error.detail || 'Failed to start organization backfill');
  }

  return response.json();
};

export const getBackfillTaskStatus = async (
  organizationId: string,
  taskId: string
): Promise<TaskStatus> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${baseURL}/api/v1/billing/backfill-tasks/${taskId}/status`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch task status' }));
    throw new Error(error.detail || 'Failed to fetch task status');
  }

  return response.json();
};

// ============================================
// QUERY HOOKS
// ============================================

export const useBackfillTaskStatus = (
  taskId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
    onSuccess?: (data: TaskStatus) => void;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['backfill-task', taskId, currentOrganization?.id],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getBackfillTaskStatus(currentOrganization.id, taskId);
    },
    enabled: !!currentOrganization && !!taskId && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval !== undefined 
      ? options.refetchInterval 
      : (query) => {
          const task = query.state.data
          // Auto-refresh every 3 seconds while task is pending or started
          if (task && (task.state === 'PENDING' || task.state === 'STARTED')) {
            return 3000;
          }
          return false;
        },
  });
};

// ============================================
// MUTATION HOOKS
// ============================================

export const useBackfillUserInOrg = (
  options?: {
    onSuccess?: (data: BackfillTaskResponse) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload?: BackfillRequest }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return backfillUserInOrg(currentOrganization.id, userId, payload);
    },

    onSuccess: (data) => {
      if (showToast) {
        toast.success('Backfill task started');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to start backfill');
      }

      onError?.(error);
    },
  });
};

export const useBackfillUserInProject = (
  projectId: string,
  options?: {
    onSuccess?: (data: BackfillTaskResponse) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload?: BackfillRequest }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return backfillUserInProject(currentOrganization.id, projectId, userId, payload);
    },

    onSuccess: (data) => {
      if (showToast) {
        toast.success('Project backfill task started');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to start project backfill');
      }

      onError?.(error);
    },
  });
};

export const useBackfillOrganization = (
  options?: {
    onSuccess?: (data: BackfillTaskResponse) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (payload?: BackfillRequest) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return backfillOrganization(currentOrganization.id, payload);
    },

    onSuccess: (data) => {
      if (showToast) {
        toast.success('Organization backfill task started');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to start organization backfill');
      }

      onError?.(error);
    },
  });
};