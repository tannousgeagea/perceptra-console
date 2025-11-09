import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { 
  ProjectSummary,
  ImageStats,
  AnnotationStats,
  AnnotationGroup,
  JobStats,
  VersionStats,
  EvaluationStats, 
} from "@/types/analytics";

// ############################################################
// Project Summary
// ############################################################

const fetchProjectSummary = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<ProjectSummary> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/projects/${projectId}/analytics/summary`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch analytics' }));
    throw new Error(error.detail);
  }

  return response.json();
};


export const useProjectSummary = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['analytics', 'summary', projectId],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchProjectSummary(
        currentOrganization.id,
        projectId,
      );
    },
    enabled: !!currentOrganization && !!projectId,
  });
};


// ###########################################################
// Image Stats
// ###########################################################

const fetchImageStats = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<ImageStats> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/projects/${projectId}/analytics/images`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch analytics' }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useImageStats = (projectId: string, days: number = 30) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['analytics', 'images', projectId, days],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchImageStats(
        currentOrganization.id,
        projectId,
        { days }
      );
    },
    enabled: !!currentOrganization && !!projectId,
  });
};


// ########################################################
// Annotation stats
// #######################################################

const fetchAnnotationStats = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<AnnotationStats> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/projects/${projectId}/analytics/annotations`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch analytics' }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useAnnotationStats = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['analytics', 'annotations', projectId],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchAnnotationStats(
        currentOrganization.id,
        projectId,
      );
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

// #####################################################
// Annotation Groups
// #####################################################

const fetchAnnotationGroups = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<AnnotationGroup> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/projects/${projectId}/analytics/annotation-groups`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch analytics' }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useAnnotationGroups = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['analytics', 'annotation-groups', projectId],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchAnnotationGroups(
        currentOrganization.id,
        projectId,
      );
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

// #######################################################
// Job Stats
// #######################################################

const fetchJobStats = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<JobStats> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/projects/${projectId}/analytics/jobs`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch analytics' }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useJobStats = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['analytics', 'jobs', projectId],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchJobStats(
        currentOrganization.id,
        projectId,
      );
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

// ########################################################
// Version Stats
// ########################################################


const fetchVersionStats = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<VersionStats[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/projects/${projectId}/analytics/versions`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch analytics' }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useVersionStats = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['analytics', 'versions', projectId],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchVersionStats(
        currentOrganization.id,
        projectId,
      );
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

// #######################################################
// Evaluation Stats
// #######################################################


const fetchEvaluationStats = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<EvaluationStats> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/projects/${projectId}/analytics/evaluation`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch analytics' }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const useEvaluationStats = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['analytics', 'evaluation', projectId],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchEvaluationStats(
        currentOrganization.id,
        projectId,
      );
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

// #####################################################
// Clear Stats Cache
// #####################################################

export const useClearAnalyticsCache = (projectId: string) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();

  return useMutation({
    mutationFn: async () => {
      if (!currentOrganization) throw new Error("No organization selected");
      
      const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${baseURL}/api/v1/projects/${projectId}/analytics/clear-cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Organization-ID': currentOrganization.id,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to clear cache' }));
        throw new Error(error.detail);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', projectId] });
      toast.success("Analytics cache cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};