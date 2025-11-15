
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
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
const fetchUserActivitySummary = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<UserSummary> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/projects/${projectId}/summary`);
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
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};


const fetchProjectProgress = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<ProjectProgress> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/projects/${projectId}/progress`);
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
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};


const fetchProjectLeaderBoard = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<LeaderboardEntry[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/projects/${projectId}/leaderboard`);
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
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchProjectTimeline = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number | string[]>
): Promise<TimelineEvent[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/projects/${projectId}/timeline`);
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
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchPredictionQuality = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<PredictionQuality> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/projects/${projectId}/prediction-quality`);
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
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchActivityHeatmap = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<ActivityHeatmap> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/projects/${projectId}/heatmap`);
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
    const error = await response.json().catch(() => ({ detail: 'Failed to user activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};


const fetchActivityTrend = async (
  organizationId: string,
  projectId: string,
  params?: Record<string, string | number>
): Promise<ActivityTrend[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/projects/${projectId}/activity-trend`);
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

      return fetchUserActivitySummary(
        currentOrganization.id,
        projectId,
        params
      );
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
      return fetchProjectProgress(
        currentOrganization.id,
        projectId
      );
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

      return fetchProjectLeaderBoard(
        currentOrganization.id,
        projectId,
        params
      );
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

      return fetchProjectTimeline(
        currentOrganization.id,
        projectId,
        params
      );
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
      return fetchPredictionQuality(
        currentOrganization.id,
        projectId
      );
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
        currentOrganization.id,
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

      return fetchActivityTrend(
        currentOrganization.id,
        projectId,
        params
      );
    },
    enabled: !!currentOrganization && !!projectId,
  });
};

///////////////////////////////////////////////////////////////////
// ============= Organization Level Fetch Functions ===============
///////////////////////////////////////////////////////////////////

const fetchOrgActivitySummary = async (
  organizationId: string,
  params?: Record<string, string>
): Promise<OrganizationSummary> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/organization/summary`);
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
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch org activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgUsersActivity = async (
  organizationId: string,
  params?: Record<string, string | number>
): Promise<UserSummary[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/organization/users`);
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
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch users activity' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgProjectsProgress = async (
  organizationId: string,
  params?: Record<string, string | number>
): Promise<ProjectProgress[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/organization/projects`);
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
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch projects progress' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgTimeline = async (
  organizationId: string,
  params?: Record<string, string | number | string[]>
): Promise<TimelineEvent[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/organization/timeline`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.append(key, String(value));
      }
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
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch timeline' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgLeaderboard = async (
  organizationId: string,
  params?: Record<string, string | number>
): Promise<LeaderboardEntry[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/organization/leaderboard`);
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
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch leaderboard' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgActivityTrend = async (
  organizationId: string,
  params?: Record<string, string | number>
): Promise<ActivityTrend[]> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/organization/activity-trend`);
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
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch activity trend' }));
    throw new Error(error.detail);
  }

  return response.json();
};

const fetchOrgHeatmap = async (
  organizationId: string,
  params: Record<string, string>
): Promise<ActivityHeatmap> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/organization/heatmap`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

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

      return fetchOrgActivitySummary(currentOrganization.id, params);
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

      return fetchOrgUsersActivity(currentOrganization.id, params);
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

      return fetchOrgProjectsProgress(currentOrganization.id, params);
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

      return fetchOrgTimeline(currentOrganization.id, params);
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

      return fetchOrgLeaderboard(currentOrganization.id, params);
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

      return fetchOrgActivityTrend(currentOrganization.id, params);
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
      return fetchOrgHeatmap(currentOrganization.id, { 
        start_date: startDate, 
        end_date: endDate 
      });
    },
    enabled: !!currentOrganization && !!startDate && !!endDate,
  });
};