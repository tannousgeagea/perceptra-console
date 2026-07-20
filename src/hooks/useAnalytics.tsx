import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiFetch, withQuery } from "@/services/apiClient";
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

// apiFetch injects Authorization and X-Organization-ID and handles 401 refresh.

// ############################################################
// Project Summary
// ############################################################

const fetchProjectSummary = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<ProjectSummary> => {
  const response = await apiFetch(
    withQuery(`/api/v1/projects/${projectId}/analytics/summary`, params)
  );

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
      return fetchProjectSummary(projectId);
    },
    enabled: !!currentOrganization && !!projectId,
  });
};


// ###########################################################
// Image Stats
// ###########################################################

const fetchImageStats = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<ImageStats> => {
  const response = await apiFetch(
    withQuery(`/api/v1/projects/${projectId}/analytics/images`, params)
  );

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
      return fetchImageStats(projectId, { days });
    },
    enabled: !!currentOrganization && !!projectId,
  });
};


// ########################################################
// Annotation stats
// #######################################################

const fetchAnnotationStats = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<AnnotationStats> => {
  const response = await apiFetch(
    withQuery(`/api/v1/projects/${projectId}/analytics/annotations`, params)
  );

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
      return fetchAnnotationStats(projectId);
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

// #####################################################
// Annotation Groups
// #####################################################

const fetchAnnotationGroups = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<AnnotationGroup> => {
  const response = await apiFetch(
    withQuery(`/api/v1/projects/${projectId}/analytics/annotation-groups`, params)
  );

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
      return fetchAnnotationGroups(projectId);
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

// #######################################################
// Job Stats
// #######################################################

const fetchJobStats = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<JobStats> => {
  const response = await apiFetch(
    withQuery(`/api/v1/projects/${projectId}/analytics/jobs`, params)
  );

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
      return fetchJobStats(projectId);
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

// ########################################################
// Version Stats
// ########################################################


const fetchVersionStats = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<VersionStats[]> => {
  const response = await apiFetch(
    withQuery(`/api/v1/projects/${projectId}/analytics/versions`, params)
  );

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
      return fetchVersionStats(projectId);
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

// #######################################################
// Evaluation Stats
// #######################################################


const fetchEvaluationStats = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<EvaluationStats> => {
  const response = await apiFetch(
    withQuery(`/api/v1/projects/${projectId}/analytics/evaluation`, params)
  );

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
      return fetchEvaluationStats(projectId);
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

      const response = await apiFetch(
        `/api/v1/projects/${projectId}/analytics/clear-cache`,
        { method: 'POST' }
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
