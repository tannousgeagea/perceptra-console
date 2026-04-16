// hooks/useSimilarity.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import {
  BulkClusterActionPayload,
  BulkClusterActionResponse,
  ClusterActionPayload,
  ClusterActionResponse,
  ClusterDetail,
  ClusterResultsFilters,
  ClusterResultsPagination,
  ClusterResultsResponse,
  CreateScanPayload,
  CreateScanResponse,
  ScanListFilters,
  ScanListPagination,
  ScanListResponse,
  ScanSummary,
  SimilarImagesParams,
  SimilarImagesResponse,
  SimilarityStats,
} from "@/types/similarity";

// ============================================
// HELPERS
// ============================================

const getAuthHeaders = (organizationId: string): HeadersInit => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");
  return {
    Authorization: `Bearer ${token}`,
    "X-Organization-ID": organizationId,
    "Content-Type": "application/json",
  };
};

const handleResponse = async <T>(response: Response, fallbackMessage: string): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: fallbackMessage }));
    throw new Error(error.detail || fallbackMessage);
  }
  return response.json();
};

// ============================================
// API FUNCTIONS
// ============================================

export const createScan = async (
  organizationId: string,
  payload: CreateScanPayload
): Promise<CreateScanResponse> => {
  const response = await fetch(`${baseURL}/api/v1/similarity/scans`, {
    method: "POST",
    headers: getAuthHeaders(organizationId),
    body: JSON.stringify(payload),
  });
  return handleResponse<CreateScanResponse>(response, "Failed to create scan");
};

export const listScans = async (
  organizationId: string,
  filters?: ScanListFilters,
  pagination?: ScanListPagination
): Promise<ScanListResponse> => {
  const params = new URLSearchParams();
  if (filters?.status)     params.append("status",     filters.status);
  if (filters?.scope)      params.append("scope",      filters.scope);
  if (filters?.project_id) params.append("project_id", filters.project_id);
  if (filters?.algorithm)  params.append("algorithm",  filters.algorithm);
  if (pagination?.skip  != null) params.append("skip",  String(pagination.skip));
  if (pagination?.limit != null) params.append("limit", String(pagination.limit));

  const response = await fetch(
    `${baseURL}/api/v1/similarity/scans?${params}`,
    { headers: getAuthHeaders(organizationId) }
  );
  return handleResponse<ScanListResponse>(response, "Failed to fetch scans");
};

export const getScan = async (
  organizationId: string,
  scanId: string
): Promise<ScanSummary> => {
  const response = await fetch(
    `${baseURL}/api/v1/similarity/scans/${scanId}`,
    { headers: getAuthHeaders(organizationId) }
  );
  return handleResponse<ScanSummary>(response, "Failed to fetch scan");
};

export const cancelScan = async (
  organizationId: string,
  scanId: string
): Promise<ScanSummary> => {
  const response = await fetch(
    `${baseURL}/api/v1/similarity/scans/${scanId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(organizationId),
    }
  );
  return handleResponse<ScanSummary>(response, "Failed to cancel scan");
};

export const getScanResults = async (
  organizationId: string,
  scanId: string,
  filters?: ClusterResultsFilters,
  pagination?: ClusterResultsPagination,
  includeMembers?: boolean
): Promise<ClusterResultsResponse> => {
  const params = new URLSearchParams();
  if (filters?.status)   params.append("status",   filters.status);
  if (filters?.sort)     params.append("sort",      filters.sort);
  if (filters?.min_size != null) params.append("min_size", String(filters.min_size));
  if (pagination?.skip  != null) params.append("skip",  String(pagination.skip));
  if (pagination?.limit != null) params.append("limit", String(pagination.limit));
  if (includeMembers)            params.append("include_members", "true");

  const response = await fetch(
    `${baseURL}/api/v1/similarity/scans/${scanId}/results?${params}`,
    { headers: getAuthHeaders(organizationId) }
  );
  return handleResponse<ClusterResultsResponse>(response, "Failed to fetch scan results");
};

export const getClusterDetail = async (
  organizationId: string,
  scanId: string,
  clusterId: string
): Promise<ClusterDetail> => {
  const response = await fetch(
    `${baseURL}/api/v1/similarity/scans/${scanId}/results/${clusterId}`,
    { headers: getAuthHeaders(organizationId) }
  );
  return handleResponse<ClusterDetail>(response, "Failed to fetch cluster detail");
};

export const performClusterAction = async (
  organizationId: string,
  clusterId: string,
  payload: ClusterActionPayload
): Promise<ClusterActionResponse> => {
  const response = await fetch(
    `${baseURL}/api/v1/similarity/clusters/${clusterId}/action`,
    {
      method: "POST",
      headers: getAuthHeaders(organizationId),
      body: JSON.stringify(payload),
    }
  );
  return handleResponse<ClusterActionResponse>(response, "Failed to perform cluster action");
};

export const performBulkClusterAction = async (
  organizationId: string,
  payload: BulkClusterActionPayload
): Promise<BulkClusterActionResponse> => {
  const response = await fetch(
    `${baseURL}/api/v1/similarity/clusters/bulk-action`,
    {
      method: "POST",
      headers: getAuthHeaders(organizationId),
      body: JSON.stringify(payload),
    }
  );
  return handleResponse<BulkClusterActionResponse>(response, "Failed to perform bulk action");
};

export const getSimilarImages = async (
  organizationId: string,
  imageId: string,
  params?: SimilarImagesParams
): Promise<SimilarImagesResponse> => {
  const query = new URLSearchParams();
  if (params?.threshold != null) query.append("threshold", String(params.threshold));
  if (params?.algorithm)         query.append("algorithm", params.algorithm);
  if (params?.limit != null)     query.append("limit",     String(params.limit));

  const response = await fetch(
    `${baseURL}/api/v1/similarity/images/${imageId}/similar?${query}`,
    { headers: getAuthHeaders(organizationId) }
  );
  return handleResponse<SimilarImagesResponse>(response, "Failed to fetch similar images");
};

export const getSimilarityStats = async (
  organizationId: string,
  projectId?: string
): Promise<SimilarityStats> => {
  const params = new URLSearchParams();
  if (projectId) params.append("project_id", projectId);

  const response = await fetch(
    `${baseURL}/api/v1/similarity/stats?${params}`,
    { headers: getAuthHeaders(organizationId) }
  );
  return handleResponse<SimilarityStats>(response, "Failed to fetch similarity stats");
};

// ============================================
// QUERY KEYS — centralised for easy invalidation
// ============================================

export const similarityKeys = {
  all: (orgId: string) => ["similarity", orgId] as const,
  scans: (orgId: string, filters?: ScanListFilters, pagination?: ScanListPagination) => ["similarity", orgId, "scans", filters, pagination] as const,
  scan: (orgId: string, scanId: string) => ["similarity", orgId, "scan", scanId] as const,
  results: (orgId: string, scanId: string, filters?: ClusterResultsFilters, pagination?: ClusterResultsPagination) => ["similarity", orgId, "results", scanId, filters, pagination] as const,
  cluster: (orgId: string, scanId: string, clusterId: string) => ["similarity", orgId, "cluster", scanId, clusterId] as const,
  similarImages: (orgId: string, imageId: string, params?: SimilarImagesParams) => ["similarity", orgId, "similar", imageId, params]  as const,
  stats: (orgId: string, projectId?: string) => ["similarity", orgId, "stats", projectId] as const,
} as const;

// ============================================
// QUERY HOOKS
// ============================================

/**
 * List all scans for the current organization.
 * Supports filtering by status, scope, project, algorithm and pagination.
 */
export const useScans = (
  filters?: ScanListFilters,
  pagination?: ScanListPagination,
  options?: { enabled?: boolean }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: similarityKeys.scans(currentOrganization?.id ?? "", filters, pagination),
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return listScans(currentOrganization.id, filters, pagination);
    },
    enabled: !!currentOrganization && (options?.enabled ?? true),
  });
};

/**
 * Fetch a single scan by ID.
 *
 * When `poll` is true (default for running/pending scans), the hook
 * refetches every 2 seconds and stops automatically once the scan
 * reaches a terminal state (completed | failed | cancelled).
 */
export const useScan = (
  scanId: string,
  options?: {
    enabled?: boolean;
    /** Enable 2-second live polling. Pass true for running/pending scans. */
    poll?: boolean;
  }
) => {
  const { currentOrganization } = useCurrentOrganization();
  const shouldPoll = options?.poll ?? false;

  return useQuery({
    queryKey: similarityKeys.scan(currentOrganization?.id ?? "", scanId),
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getScan(currentOrganization.id, scanId);
    },
    enabled: !!currentOrganization && !!scanId && (options?.enabled ?? true),
    refetchInterval: shouldPoll
      ? (query) => {
          const s = query.state.data?.status;
          return s === "running" || s === "pending" ? 2_000 : false;
        }
      : false,
  });
};

/**
 * Paginated list of clusters produced by a completed scan.
 * Pass `includeMembers: true` to include all member images in each cluster (used by DataLake panel).
 */
export const useScanResults = (
  scanId: string,
  filters?: ClusterResultsFilters,
  pagination?: ClusterResultsPagination,
  options?: { enabled?: boolean; includeMembers?: boolean }
) => {
  const { currentOrganization } = useCurrentOrganization();
  const includeMembers = options?.includeMembers ?? false;

  return useQuery({
    queryKey: similarityKeys.results(currentOrganization?.id ?? "", scanId, filters, pagination),
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getScanResults(currentOrganization.id, scanId, filters, pagination, includeMembers);
    },
    enabled: !!currentOrganization && !!scanId && (options?.enabled ?? true),
  });
};

/**
 * Full cluster detail: all member images + action history.
 */
export const useClusterDetail = (
  scanId: string,
  clusterId: string,
  options?: { enabled?: boolean }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: similarityKeys.cluster(currentOrganization?.id ?? "", scanId, clusterId),
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getClusterDetail(currentOrganization.id, scanId, clusterId);
    },
    enabled: !!currentOrganization && !!scanId && !!clusterId && (options?.enabled ?? true),
  });
};

/**
 * Images similar to a given image, using cached perceptual hashes.
 */
export const useSimilarImages = (
  imageId: string,
  params?: SimilarImagesParams,
  options?: { enabled?: boolean }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: similarityKeys.similarImages(currentOrganization?.id ?? "", imageId, params),
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getSimilarImages(currentOrganization.id, imageId, params);
    },
    enabled: !!currentOrganization && !!imageId && (options?.enabled ?? true),
  });
};

/**
 * Organization-level similarity statistics (scan counts, duplicate totals, etc.).
 */
export const useSimilarityStats = (
  projectId?: string,
  options?: { enabled?: boolean }
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: similarityKeys.stats(currentOrganization?.id ?? "", projectId),
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return getSimilarityStats(currentOrganization.id, projectId);
    },
    enabled: !!currentOrganization && (options?.enabled ?? true),
  });
};

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Launch a new similarity scan (POST /similarity/scans).
 * Invalidates the scan list on success.
 */
export const useCreateScan = (options?: {
  onSuccess?: (data: CreateScanResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (payload: CreateScanPayload) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return createScan(currentOrganization.id, payload);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: similarityKeys.scans(currentOrganization?.id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: similarityKeys.stats(currentOrganization?.id ?? ""),
      });

      if (showToast) {
        toast.success("Similarity scan started");
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || "Failed to start scan");
      }
      onError?.(error);
    },
  });
};

/**
 * Cancel a PENDING or RUNNING scan (DELETE /similarity/scans/{scan_id}).
 * Invalidates both the scan list and the individual scan entry.
 */
export const useCancelScan = (options?: {
  onSuccess?: (data: ScanSummary) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  return useMutation({
    mutationFn: (scanId: string) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return cancelScan(currentOrganization.id, scanId);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: similarityKeys.scans(currentOrganization?.id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: similarityKeys.scan(currentOrganization?.id ?? "", data.scan_id),
      });
      queryClient.invalidateQueries({
        queryKey: similarityKeys.stats(currentOrganization?.id ?? ""),
      });

      if (showToast) {
        toast.success("Scan cancelled");
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || "Failed to cancel scan");
      }
      onError?.(error);
    },
  });
};

/**
 * Perform an action on a single cluster:
 * archive_duplicates | delete_duplicates | mark_reviewed |
 * set_representative | remove_from_cluster
 *
 * Invalidates the results list and the specific cluster detail on success.
 */
export const useClusterAction = (options?: {
  onSuccess?: (data: ClusterActionResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  const ACTION_LABELS: Record<string, string> = {
    archive_duplicates:  "Duplicates archived",
    delete_duplicates:   "Duplicates deleted",
    mark_reviewed:       "Cluster marked as reviewed",
    set_representative:  "Representative updated",
    remove_from_cluster: "Images removed from cluster",
  };

  return useMutation({
    mutationFn: ({
      clusterId,
      scanId,
      payload,
    }: {
      clusterId: string;
      scanId: string;
      payload: ClusterActionPayload;
    }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return performClusterAction(currentOrganization.id, clusterId, payload);
    },

    onSuccess: (data, variables) => {
      const orgId = currentOrganization?.id ?? "";

      // Invalidate the results list for the scan
      queryClient.invalidateQueries({
        queryKey: similarityKeys.results(orgId, variables.scanId),
      });

      // Invalidate the specific cluster detail
      queryClient.invalidateQueries({
        queryKey: similarityKeys.cluster(orgId, variables.scanId, variables.clusterId),
      });

      // Refresh stats (duplicate count changes after delete/archive)
      queryClient.invalidateQueries({
        queryKey: similarityKeys.stats(orgId),
      });

      if (showToast) {
        toast.success(ACTION_LABELS[data.action] ?? "Action applied");
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || "Failed to perform action");
      }
      onError?.(error);
    },
  });
};

/**
 * Apply the same action (archive | delete | mark_reviewed) to multiple
 * clusters at once (POST /similarity/clusters/bulk-action).
 *
 * Invalidates the entire results list for the scan on success.
 */
export const useBulkClusterAction = (options?: {
  onSuccess?: (data: BulkClusterActionResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options || {};

  const BULK_LABELS: Record<string, string> = {
    archive_duplicates: "Duplicates archived across selected clusters",
    delete_duplicates:  "Duplicates deleted across selected clusters",
    mark_reviewed:      "Selected clusters marked as reviewed",
  };

  return useMutation({
    mutationFn: ({
      scanId,
      payload,
    }: {
      scanId: string;
      payload: BulkClusterActionPayload;
    }) => {
      if (!currentOrganization) throw new Error("No organization selected");
      return performBulkClusterAction(currentOrganization.id, payload);
    },

    onSuccess: (data, variables) => {
      const orgId = currentOrganization?.id ?? "";

      queryClient.invalidateQueries({
        queryKey: similarityKeys.results(orgId, variables.scanId),
      });
      queryClient.invalidateQueries({
        queryKey: similarityKeys.stats(orgId),
      });

      if (showToast) {
        const label = BULK_LABELS[data.action] ?? "Bulk action applied";
        const detail =
          data.failed > 0
            ? ` (${data.successful} succeeded, ${data.failed} failed)`
            : ` (${data.successful} clusters)`;

        if (data.failed > 0) {
          toast.warning(`${label}${detail}`);
        } else {
          toast.success(`${label}${detail}`);
        }
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || "Failed to perform bulk action");
      }
      onError?.(error);
    },
  });
};