
import { useQuery } from "@tanstack/react-query";
import { apiFetch, withQuery } from "@/services/apiClient";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import {
  UserSummary,
  ProjectProgress,
  ActivityTrend,
  LeaderboardEntry,
  PredictionQuality,
  ActivityHeatmap,
  TimelineEvent,
  OrganizationSummary
} from "@/types/activity";

// ============= Fetch Functions ============
// apiFetch injects Authorization and X-Organization-ID and handles 401 refresh.

const fetchUserActivitySummary = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<UserSummary> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/projects/${projectId}/summary`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};


const fetchProjectProgress = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<ProjectProgress> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/projects/${projectId}/progress`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};


const fetchProjectLeaderBoard = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<LeaderboardEntry[]> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/projects/${projectId}/leaderboard`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchProjectTimeline = async (
  projectId: string,
  params?: Record<string, string | number | string[]>
): Promise<TimelineEvent[]> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/projects/${projectId}/timeline`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchPredictionQuality = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<PredictionQuality> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/projects/${projectId}/prediction-quality`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchActivityHeatmap = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<ActivityHeatmap> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/projects/${projectId}/heatmap`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};


const fetchActivityTrend = async (
  projectId: string,
  params?: Record<string, string | number>
): Promise<ActivityTrend[]> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/projects/${projectId}/activity-trend`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};

// ============= Query Hooks =============
export const useUserActivitySummary = (
  projectId: string,
  options?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'user-summary', projectId, options],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");

      const params: Record<string, string> = {};
      if (options?.userId) params.project_id = options.userId;
      if (options?.startDate) params.start_date = options.startDate;
      if (options?.endDate) params.end_date = options.endDate;

      return fetchUserActivitySummary(projectId, params);
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

export const useProjectProgress = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'project-progress', projectId],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchProjectProgress(projectId);
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

export const useProjectLeaderboard = (
  projectId: string,
  options?: {
    metric?: 'annotations_created' | 'images_reviewed' | 'images_finalized';
    periodDays?: number;
    limit?: number;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'leaderboard', projectId, options],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");

      const params: Record<string, string | number> = {};
      if (options?.metric) params.metric = options.metric;
      if (options?.periodDays) params.period_days = options.periodDays;
      if (options?.limit) params.limit = options.limit;

      return fetchProjectLeaderBoard(projectId, params);
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

export const useProjectTimeline = (
  projectId: string,
  options?: {
    eventTypes?: string[];
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'timeline', projectId, options],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");

      const params: Record<string, string | number | string[]> = {};
      if (options?.eventTypes) params.event_types = options.eventTypes;
      if (options?.userId) params.user_id = options.userId;
      if (options?.startDate) params.start_date = options.startDate;
      if (options?.endDate) params.end_date = options.endDate;
      if (options?.limit) params.limit = options.limit;
      if (options?.offset) params.offset = options.offset;

      return fetchProjectTimeline(projectId, params);
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

export const usePredictionQuality = (projectId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'prediction-quality', projectId],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchPredictionQuality(projectId);
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

export const useActivityHeatmap = (
  projectId: string,
  startDate: string,
  endDate: string
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', projectId, 'heatmap', startDate, endDate],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchActivityHeatmap(
        projectId,
        { start_date: startDate, end_date: endDate }
      );
    },
    enabled: !!currentOrganization && !!projectId && !!startDate && !!endDate,
  });
};

export const useActivityTrend = (
  projectId: string,
  options?: {
    userId?: string;
    days?: number;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', projectId, 'heatmap', options],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");

      const params: Record<string, string | number> = {};
      if (options?.userId) params.project_id = options.userId;
      if (options?.days) params.days = options.days;

      return fetchActivityTrend(projectId, params);
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

///////////////////////////////////////////////////////////////////
// ============= Organization Level Fetch Functions ===============
///////////////////////////////////////////////////////////////////

const fetchOrgActivitySummary = async (
  params?: Record<string, string>
): Promise<OrganizationSummary> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/organization/summary`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch org activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgUsersActivity = async (
  params?: Record<string, string | number>
): Promise<UserSummary[]> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/organization/users`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch users activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgProjectsProgress = async (
  params?: Record<string, string | number>
): Promise<ProjectProgress[]> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/organization/projects`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch projects progress' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgTimeline = async (
  params?: Record<string, string | number | string[]>
): Promise<TimelineEvent[]> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/organization/timeline`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch timeline' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgLeaderboard = async (
  params?: Record<string, string | number>
): Promise<LeaderboardEntry[]> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/organization/leaderboard`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch leaderboard' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgActivityTrend = async (
  params?: Record<string, string | number>
): Promise<ActivityTrend[]> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/organization/activity-trend`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch activity trend' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgHeatmap = async (
  params: Record<string, string>
): Promise<ActivityHeatmap> => {
  const response = await apiFetch(
    withQuery(`/api/v1/activity/organization/heatmap`, params)
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch heatmap' }));
    throw new Error(error.detail);
  }

  return response.json();
};


// ============= Organization Level Hooks =============

export const useOrgActivitySummary = (options?: {
  userId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'org-summary', options],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");

      const params: Record<string, string> = {};
      if (options?.userId) params.user_id = options.userId;
      if (options?.projectId) params.project_id = options.projectId;
      if (options?.startDate) params.start_date = options.startDate;
      if (options?.endDate) params.end_date = options.endDate;

      return fetchOrgActivitySummary(params);
    },
    enabled: !!currentOrganization,
  });
};

export const useOrgUsersActivity = (options?: {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'total_annotations' | 'images_reviewed' | 'images_finalized';
  limit?: number;
}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'org-users', options],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");

      const params: Record<string, string | number> = {};
      if (options?.projectId) params.project_id = options.projectId;
      if (options?.startDate) params.start_date = options.startDate;
      if (options?.endDate) params.end_date = options.endDate;
      if (options?.sortBy) params.sort_by = options.sortBy;
      if (options?.limit) params.limit = options.limit;

      return fetchOrgUsersActivity(params);
    },
    enabled: !!currentOrganization,
  });
};

export const useOrgProjectsProgress = (options?: {
  userId?: string;
  status?: 'active' | 'completed' | 'stalled';
  limit?: number;
}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'org-projects', options],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");

      const params: Record<string, string | number> = {};
      if (options?.userId) params.user_id = options.userId;
      if (options?.status) params.status = options.status;
      if (options?.limit) params.limit = options.limit;

      return fetchOrgProjectsProgress(params);
    },
    enabled: !!currentOrganization,
  });
};

export const useOrgTimeline = (options?: {
  userId?: string;
  projectId?: string;
  eventTypes?: string[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'org-timeline', options],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");

      const params: Record<string, string | number | string[]> = {};
      if (options?.userId) params.user_id = options.userId;
      if (options?.projectId) params.project_id = options.projectId;
      if (options?.eventTypes) params.event_types = options.eventTypes;
      if (options?.startDate) params.start_date = options.startDate;
      if (options?.endDate) params.end_date = options.endDate;
      if (options?.limit) params.limit = options.limit;
      if (options?.offset) params.offset = options.offset;

      return fetchOrgTimeline(params);
    },
    enabled: !!currentOrganization,
  });
};

export const useOrgLeaderboard = (options?: {
  projectId?: string;
  metric?: 'annotations_created' | 'images_reviewed' | 'images_finalized';
  periodDays?: number;
  limit?: number;
}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'org-leaderboard', options],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");

      const params: Record<string, string | number> = {};
      if (options?.projectId) params.project_id = options.projectId;
      if (options?.metric) params.metric = options.metric;
      if (options?.periodDays) params.period_days = options.periodDays;
      if (options?.limit) params.limit = options.limit;

      return fetchOrgLeaderboard(params);
    },
    enabled: !!currentOrganization,
  });
};

export const useOrgActivityTrend = (options?: {
  userId?: string;
  projectId?: string;
  days?: number;
}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'org-trend', options],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");

      const params: Record<string, string | number> = {};
      if (options?.userId) params.user_id = options.userId;
      if (options?.projectId) params.project_id = options.projectId;
      if (options?.days) params.days = options.days;

      return fetchOrgActivityTrend(params);
    },
    enabled: !!currentOrganization,
  });
};

// Add to organization level hooks

export const useOrgHeatmap = (startDate: string, endDate: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'org-heatmap', startDate, endDate],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchOrgHeatmap({
        start_date: startDate,
        end_date: endDate
      });
    },
    enabled: !!currentOrganization && !!startDate && !!endDate,
  });
};
