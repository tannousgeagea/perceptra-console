
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
  ActivityHeatmap
} from "@/types/activity";

// ============= Fetch Functions ============
const fetchUserActivitySummary = async (
  organizationId: string,
  params?: Record<string, string | number>
): Promise<UserSummary> => {
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
): Promise<ActivityTrend[]> => {
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
  params?: Record<string, string | number>
): Promise<ActivityHeatmap> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const url = new URL(`${baseURL}/api/v1/activity/activity-heatmap`);
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
  userId: string,
  options?: {
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'user-summary', userId, options],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      
      const params: Record<string, string> = {};
      if (options?.projectId) params.project_id = options.projectId;
      if (options?.startDate) params.start_date = options.startDate;
      if (options?.endDate) params.end_date = options.endDate;

      return fetchUserActivitySummary(
        currentOrganization.id,
        params
      );
    },
    enabled: !!currentOrganization && !!userId,
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
  startDate: string,
  endDate: string
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['activity', 'heatmap', startDate, endDate],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchActivityHeatmap(
        currentOrganization.id,
        { start_date: startDate, end_date: endDate }
      );
    },
    enabled: !!currentOrganization && !!startDate && !!endDate,
  });
};