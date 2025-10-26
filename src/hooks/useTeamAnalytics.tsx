import { useQuery, useQueries } from "@tanstack/react-query";
import { UserAnalytics, AnalyticsKPIs, AnalyticsFilters } from "@/types/analytics";
import { ImageAnalyticsFilters, ImageAnalyticsResponse, ImageStatusBreakdown, UserImagePerformance, UserImageAnalytics, ImageAnalyticsKPIs } from "@/types/analytics";
import axios from "axios";
import { baseURL } from "@/components/api/base";

// API client
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token if available (adjust based on your auth implementation)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // or get from your auth context
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API response types
interface AnalyticsResponse {
  data: UserAnalytics[];
  kpis: AnalyticsKPIs;
}

interface UserInfo {
  id: string;
  name: string;
  role: string;
}

interface ProjectInfo {
  id: string;
  name: string;
}

// API functions
const fetchAnalytics = async (filters: AnalyticsFilters): Promise<AnalyticsResponse> => {
  const params = new URLSearchParams();
  params.append("timeFrame", filters.timeFrame);
  
  if (filters.role) {
    params.append("role", filters.role);
  }
//   if (filters.selectedUsers) {
//     params.append("userId", filters.selectedUsers);
//   }
  if (filters.projectId) {
    params.append("projectId", filters.projectId);
  }

  const { data } = await apiClient.get<AnalyticsResponse>(
    `/api/v1/analytics?${params.toString()}`
  );
  return data;
};

const fetchImageAnalytics = async (filters: ImageAnalyticsFilters): Promise<ImageAnalyticsResponse> => {
  const params = new URLSearchParams();
  params.append("timeFrame", filters.timeFrame);
  
  if (filters.role) {
    params.append("role", filters.role);
  }
  // if (filters.userId) {
  //   params.append("userId", filters.userId);
  // }
  if (filters.projectId) {
    params.append("projectId", filters.projectId);
  }
  if (filters.status) {
    params.append("status", filters.status);
  }

  const { data } = await apiClient.get<ImageAnalyticsResponse>(
    `/api/v1/analytics/images?${params.toString()}`
  );
  return data;
};

const fetchImageStatusBreakdown = async (projectId?: string): Promise<ImageStatusBreakdown> => {
  const params = new URLSearchParams();
  if (projectId) {
    params.append("projectId", projectId);
  }

  const { data } = await apiClient.get<ImageStatusBreakdown>(
    `/api/v1/analytics/images/status-breakdown?${params.toString()}`
  );
  return data;
};

const fetchUserImagePerformance = async (
  userId: string,
  timeFrame: string
): Promise<UserImagePerformance> => {
  const params = new URLSearchParams();
  params.append("timeFrame", timeFrame);

  const { data } = await apiClient.get<UserImagePerformance>(
    `/api/v1/analytics/images/user/${userId}?${params.toString()}`
  );
  return data;
};

const fetchUsers = async (): Promise<UserInfo[]> => {
  const { data } = await apiClient.get<UserInfo[]>("/api/v1/analytics/users");
  return data;
};

const fetchRoles = async (): Promise<string[]> => {
  const { data } = await apiClient.get<string[]>("/api/v1/analytics/roles");
  return data;
};

const fetchProjects = async (): Promise<ProjectInfo[]> => {
  const { data } = await apiClient.get<ProjectInfo[]>("/api/v1/analytics/projects");
  return data;
};

// Main hook for team analytics
export const useTeamAnalytics = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", filters],
    queryFn: () => fetchAnalytics(filters),
    staleTime: 60000, // Consider data stale after 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
    refetchOnWindowFocus: true, // Refetch when user focuses window
    retry: 2, // Retry failed requests twice
    select: (data) => ({
      data: data.data,
      kpis: data.kpis,
    }),
  });
};

// Hook for image-level analytics
export const useImageAnalytics = (filters: ImageAnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "images", filters],
    queryFn: () => fetchImageAnalytics(filters),
    staleTime: 60000,
    refetchInterval: 300000,
    refetchOnWindowFocus: true,
    retry: 2,
    select: (data) => ({
      data: data.data,
      kpis: data.kpis,
    }),
  });
};

// Hook for image status breakdown
export const useImageStatusBreakdown = (projectId?: string) => {
  return useQuery({
    queryKey: ["analytics", "images", "status", projectId],
    queryFn: () => fetchImageStatusBreakdown(projectId),
    staleTime: 120000, // 2 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

// Hook for individual user image performance
export const useUserImagePerformance = (userId: string, timeFrame: string = "week") => {
  return useQuery({
    queryKey: ["analytics", "images", "user", userId, timeFrame],
    queryFn: () => fetchUserImagePerformance(userId, timeFrame),
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !!userId, // Only fetch if userId is provided
  });
};

// Hook for fetching available users
export const useAnalyticsUsers = () => {
  return useQuery({
    queryKey: ["analytics", "users"],
    queryFn: fetchUsers,
    staleTime: 300000, // 5 minutes - users don't change often
    retry: 2,
  });
};

// Hook for fetching available roles
export const useAnalyticsRoles = () => {
  return useQuery({
    queryKey: ["analytics", "roles"],
    queryFn: fetchRoles,
    staleTime: 300000, // 5 minutes - roles don't change often
    retry: 2,
  });
};

// Hook for fetching available projects
export const useAnalyticsProjects = () => {
  return useQuery({
    queryKey: ["analytics", "projects"],
    queryFn: fetchProjects,
    staleTime: 300000, // 5 minutes - projects don't change often
    retry: 2,
  });
};

// Combined hook for both job and image analytics
export const useCombinedAnalytics = (filters: AnalyticsFilters) => {
  const jobAnalytics = useTeamAnalytics(filters);
  const imageAnalytics = useImageAnalytics(filters);

  return {
    jobs: {
      data: jobAnalytics.data?.data || [],
      kpis: jobAnalytics.data?.kpis,
      isLoading: jobAnalytics.isLoading,
      isError: jobAnalytics.isError,
      error: jobAnalytics.error,
      refetch: jobAnalytics.refetch,
    },
    images: {
      data: imageAnalytics.data?.data || [],
      kpis: imageAnalytics.data?.kpis,
      isLoading: imageAnalytics.isLoading,
      isError: imageAnalytics.isError,
      error: imageAnalytics.error,
      refetch: imageAnalytics.refetch,
    },
    isLoading: jobAnalytics.isLoading || imageAnalytics.isLoading,
    isError: jobAnalytics.isError || imageAnalytics.isError,
  };
};


// Combined hook for all filter options (useful for filter dropdowns)
export const useAnalyticsFilterOptions = () => {
  const queries = useQueries({
    queries: [
      {
        queryKey: ["analytics", "users"],
        queryFn: fetchUsers,
        staleTime: 300000,
      },
      {
        queryKey: ["analytics", "roles"],
        queryFn: fetchRoles,
        staleTime: 300000,
      },
      {
        queryKey: ["analytics", "projects"],
        queryFn: fetchProjects,
        staleTime: 300000,
      },
    ],
  });

  return {
    users: queries[0].data || [],
    roles: queries[1].data || [],
    projects: queries[2].data || [],
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    errors: queries.map((query) => query.error),
  };
};

// Hook for analytics with multiple filters (returns all combinations)
export const useMultipleAnalytics = (filtersList: AnalyticsFilters[]) => {
  const queries = useQueries({
    queries: filtersList.map((filters) => ({
      queryKey: ["analytics", filters],
      queryFn: () => fetchAnalytics(filters),
      staleTime: 60000,
      refetchInterval: 300000,
    })),
  });

  return {
    results: queries.map((query) => query.data),
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    errors: queries.map((query) => query.error),
  };
};

// Hook for multiple image analytics queries
export const useMultipleImageAnalytics = (filtersList: ImageAnalyticsFilters[]) => {
  const queries = useQueries({
    queries: filtersList.map((filters) => ({
      queryKey: ["analytics", "images", filters],
      queryFn: () => fetchImageAnalytics(filters),
      staleTime: 60000,
      refetchInterval: 300000,
    })),
  });

  return {
    results: queries.map((query) => query.data),
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    errors: queries.map((query) => query.error),
  };
};

// Hook for comparing analytics between two time periods
export const useAnalyticsComparison = (
  currentFilters: AnalyticsFilters,
  previousFilters: AnalyticsFilters
) => {
  const currentQuery = useQuery({
    queryKey: ["analytics", "current", currentFilters],
    queryFn: () => fetchAnalytics(currentFilters),
    staleTime: 60000,
  });

  const previousQuery = useQuery({
    queryKey: ["analytics", "previous", previousFilters],
    queryFn: () => fetchAnalytics(previousFilters),
    staleTime: 60000,
  });

  // Calculate percentage changes
  const comparison = {
    annotationsChange: 0,
    reviewsChange: 0,
    completionsChange: 0,
  };

  if (currentQuery.data && previousQuery.data) {
    const current = currentQuery.data.kpis;
    const previous = previousQuery.data.kpis;

    if (previous.totalAnnotationsThisWeek > 0) {
      comparison.annotationsChange =
        ((current.totalAnnotationsThisWeek - previous.totalAnnotationsThisWeek) /
          previous.totalAnnotationsThisWeek) *
        100;
    }

    if (previous.totalReviewsThisWeek > 0) {
      comparison.reviewsChange =
        ((current.totalReviewsThisWeek - previous.totalReviewsThisWeek) /
          previous.totalReviewsThisWeek) *
        100;
    }

    if (previous.totalCompletionsThisWeek > 0) {
      comparison.completionsChange =
        ((current.totalCompletionsThisWeek - previous.totalCompletionsThisWeek) /
          previous.totalCompletionsThisWeek) *
        100;
    }
  }

  return {
    current: currentQuery.data,
    previous: previousQuery.data,
    comparison,
    isLoading: currentQuery.isLoading || previousQuery.isLoading,
    isError: currentQuery.isError || previousQuery.isError,
    errors: [currentQuery.error, previousQuery.error],
  };
};

// Hook for comparing image analytics between two time periods
export const useImageAnalyticsComparison = (
  currentFilters: ImageAnalyticsFilters,
  previousFilters: ImageAnalyticsFilters
) => {
  const currentQuery = useQuery({
    queryKey: ["analytics", "images", "current", currentFilters],
    queryFn: () => fetchImageAnalytics(currentFilters),
    staleTime: 60000,
  });

  const previousQuery = useQuery({
    queryKey: ["analytics", "images", "previous", previousFilters],
    queryFn: () => fetchImageAnalytics(previousFilters),
    staleTime: 60000,
  });

  // Calculate percentage changes
  const comparison = {
    annotatedChange: 0,
    reviewedChange: 0,
    finalizedChange: 0,
    completionRateChange: 0,
  };

  if (currentQuery.data && previousQuery.data) {
    const current = currentQuery.data.kpis;
    const previous = previousQuery.data.kpis;

    if (previous.totalAnnotatedThisWeek > 0) {
      comparison.annotatedChange =
        ((current.totalAnnotatedThisWeek - previous.totalAnnotatedThisWeek) /
          previous.totalAnnotatedThisWeek) *
        100;
    }

    if (previous.totalReviewedThisWeek > 0) {
      comparison.reviewedChange =
        ((current.totalReviewedThisWeek - previous.totalReviewedThisWeek) /
          previous.totalReviewedThisWeek) *
        100;
    }

    if (previous.totalFinalizedThisWeek > 0) {
      comparison.finalizedChange =
        ((current.totalFinalizedThisWeek - previous.totalFinalizedThisWeek) /
          previous.totalFinalizedThisWeek) *
        100;
    }

    if (previous.imageCompletionRate > 0) {
      comparison.completionRateChange =
        ((current.imageCompletionRate - previous.imageCompletionRate) /
          previous.imageCompletionRate) *
        100;
    }
  }

  return {
    current: currentQuery.data,
    previous: previousQuery.data,
    comparison,
    isLoading: currentQuery.isLoading || previousQuery.isLoading,
    isError: currentQuery.isError || previousQuery.isError,
    errors: [currentQuery.error, previousQuery.error],
  };
};


// Utility function to prefetch analytics data (useful for optimistic navigation)
export const prefetchAnalytics = async (
  queryClient: any,
  filters: AnalyticsFilters
) => {
  await queryClient.prefetchQuery({
    queryKey: ["analytics", filters],
    queryFn: () => fetchAnalytics(filters),
    staleTime: 60000,
  });
};

// Hook for real-time analytics updates (polls more frequently)
export const useRealtimeAnalytics = (filters: AnalyticsFilters, enabled = true) => {
  return useQuery({
    queryKey: ["analytics", "realtime", filters],
    queryFn: () => fetchAnalytics(filters),
    staleTime: 10000, // 10 seconds
    refetchInterval: enabled ? 30000 : false, // Poll every 30 seconds when enabled
    refetchOnWindowFocus: true,
    enabled,
  });
};

// Hook for real-time image analytics updates
export const useRealtimeImageAnalytics = (filters: ImageAnalyticsFilters, enabled = true) => {
  return useQuery({
    queryKey: ["analytics", "images", "realtime", filters],
    queryFn: () => fetchImageAnalytics(filters),
    staleTime: 10000,
    refetchInterval: enabled ? 30000 : false,
    refetchOnWindowFocus: true,
    enabled,
  });
};

// Export types for convenience
export type {
  AnalyticsResponse,
  UserInfo,
  ProjectInfo,
  UserImageAnalytics,
  ImageAnalyticsKPIs,
  ImageAnalyticsResponse,
  ImageStatusBreakdown,
  ImageAnalyticsFilters,
  UserImagePerformance,
};

