// hooks/useJobs.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

export interface JobAssignee {
  id: string;
  username: string;
  email: string;
}

export interface JobResponse {
  id: string;
  name: string;
  description: string;
  status: string;
  image_count: number;
  assignee: JobAssignee | null;
  batch_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateJobPayload {
  name?: string;
  description?: string;
  status?: 'unassigned' | 'assigned' | 'in_review' | 'completed' | 'sliced';
  assignee_id?: string | null; // null or empty string to unassign
}

export interface JobSlice {
  id: string;
  name: string;
  image_count: number;
  assignee: {
    id: string;
    username: string;
  } | null;
}

export interface SplitJobPayload {
  number_of_slices: number;
  user_assignments: (string | null)[]; // Array of user IDs or null for unassigned
}

export interface SplitJobResponse {
  message: string;
  original_job_id: string;
  slices_created: number;
  slices: JobSlice[];
}
// ============================================
// API FUNCTIONS
// ============================================

export const assignJobToUser = async (
  organizationId: string,
  projectId: string,
  jobId: string,
  assigneeId: string,
): Promise<JobResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/jobs/${jobId}/assign`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assignee_id: assigneeId }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: 'Failed to assign job' 
    }));
    throw new Error(error.detail || 'Failed to assign job');
  }

  return response.json();
};

export const unassignJob = async (
  organizationId: string,
  projectId: string,
  jobId: string
): Promise<JobResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/jobs/${jobId}/unassign`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: 'Failed to unassign job' 
    }));
    throw new Error(error.detail || 'Failed to unassign job');
  }

  return response.json();
};

// ============================================
// HOOKS
// ============================================

export const useAssignJob = (
  projectId: string,
  options?: {
    onSuccess?: (data: JobResponse) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ jobId, assigneeId }: { jobId:string, assigneeId: string }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return assignJobToUser(currentOrganization.id, projectId, jobId, assigneeId);
    },

    onSuccess: (data) => {
      // Invalidate jobs queries
      queryClient.invalidateQueries({ queryKey: ['jobs', projectId, currentOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ['job', data.id, currentOrganization?.id] });

      if (showToast) {
        toast.success(`Job assigned to ${data.assignee?.username || 'user'}`);
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to assign job');
      }

      onError?.(error);
    },
  });
};

export const useUnassignJob = (
  projectId: string,
  options?: {
    onSuccess?: (data: JobResponse) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (jobId: string) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return unassignJob(currentOrganization.id, projectId, jobId);
    },

    onSuccess: (data) => {
      // Invalidate jobs queries
      queryClient.invalidateQueries({ queryKey: ['jobs', projectId, currentOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ['job', data.id, currentOrganization?.id] });

      if (showToast) {
        toast.success('Job unassigned successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to unassign job');
      }

      onError?.(error);
    },
  });
};

// ============================================
// API FUNCTIONS - update job
// ============================================

export const updateJob = async (
  organizationId: string,
  projectId: string,
  jobId: string,
  payload: UpdateJobPayload
): Promise<JobResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/jobs/${jobId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: 'Failed to update job' 
    }));
    throw new Error(error.detail || 'Failed to update job');
  }

  return response.json();
};

export const useUpdateJob = (
  projectId: string,
  options?: {
    onSuccess?: (data: JobResponse) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: UpdateJobPayload }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return updateJob(currentOrganization.id, projectId, jobId, payload);
    },

    onSuccess: (data) => {
      // Invalidate job queries
      queryClient.invalidateQueries({ queryKey: ['jobs', projectId, currentOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ['job', data.id, currentOrganization?.id] });

      if (showToast) {
        toast.success('Job updated successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to update job');
      }

      onError?.(error);
    },
  });
};

// ============================================
// API FUNCTIONS - Split Job
// ============================================

export const splitJob = async (
  organizationId: string,
  projectId: string,
  jobId: string,
  payload: SplitJobPayload
): Promise<SplitJobResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/projects/${projectId}/jobs/${jobId}/split`,
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
    const error = await response.json().catch(() => ({ 
      detail: 'Failed to split job' 
    }));
    throw new Error(error.detail || 'Failed to split job');
  }

  return response.json();
};

export const useSplitJob = (
  projectId: string,
  options?: {
    onSuccess?: (data: SplitJobResponse) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: SplitJobPayload }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return splitJob(currentOrganization.id, projectId, jobId, payload);
    },

    onSuccess: (data) => {
      // Invalidate jobs list to show new slices
      queryClient.invalidateQueries({ queryKey: ['jobs', projectId, currentOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ['job', data.original_job_id, currentOrganization?.id] });

      if (showToast) {
        toast.success(data.message);
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to split job');
      }

      onError?.(error);
    },
  });
};

// ============================================
// HOOKS - Delete Job
// ============================================


export const deleteJob = async (
  organizationId: string,
  projectId: string,
  jobId: string,
  hardDelete: boolean = false
): Promise<void> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const url = `${baseURL}/api/v1/projects/${projectId}/jobs/${jobId}${
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
    const error = await response.json().catch(() => ({ 
      detail: 'Failed to delete job' 
    }));
    throw new Error(error.detail || 'Failed to delete job');
  }
};

export const useDeleteJob = (
  projectId: string,
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
    mutationFn: ({ jobId, hardDelete = false }: { 
      jobId: string; 
      hardDelete?: boolean 
    }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return deleteJob(currentOrganization.id, projectId, jobId, hardDelete);
    },

    onSuccess: () => {
      // Invalidate jobs list
      queryClient.invalidateQueries({ queryKey: ['jobs', projectId] });

      if (showToast) {
        toast.success('Job deleted successfully');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to delete job');
      }

      onError?.(error);
    },
  });
};