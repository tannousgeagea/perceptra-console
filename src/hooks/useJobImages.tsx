import { keepPreviousData, useQuery, type QueryClient } from "@tanstack/react-query";
import { apiFetch, withQuery } from "@/services/apiClient";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import type { JobImageCounts, JobImagesResponse } from "@/types/image";

interface JobImagesParams {
  skip?: number;
  limit?: number;
  q?: string;
  status?: string;
  annotated?: boolean;
  /** Ask the list endpoint for per-tab counts. Pages that use useJobImageCounts pass false. */
  includeCounts?: boolean;
}

/**
 * Pseudo job id: every image of the project's active jobs as one list (same
 * endpoints' shapes, under /jobs/all/…). The review queue is All jobs → Annotated.
 */
export const ALL_JOBS_ID = "all";

/** The project-wide review queue: annotated images across all jobs, oldest first. */
export const reviewQueueUrl = (projectId: string) =>
  `/projects/${projectId}/annotate/job/${ALL_JOBS_ID}?status=annotated`;

export const jobImagesKeys = {
  all: ["job-images"] as const,
  counts: ["job-image-counts"] as const,
};

export const fetchJobImages = async (
  projectId: string,
  jobId: string,
  params: JobImagesParams = {}
): Promise<JobImagesResponse> => {
  const { skip = 0, limit = 100, q, status, annotated, includeCounts = true } = params;

  const response = await apiFetch(
    withQuery(`/api/v1/projects/${projectId}/jobs/${jobId}/images`, {
      skip,
      limit,
      // q takes precedence over the legacy filters
      q: q || undefined,
      status: q ? undefined : status || undefined,
      annotated: q ? undefined : annotated,
      include_counts: includeCounts ? undefined : false,
    }),
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) throw new Error("Failed to fetch job images");
  return response.json();
};

export const fetchJobImageCounts = async (
  projectId: string,
  jobId: string
): Promise<JobImageCounts> => {
  const response = await apiFetch(`/api/v1/projects/${projectId}/jobs/${jobId}/images/counts`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch job image counts");
  return response.json();
};

/** Query key + fetcher for one page of a job's images (shared with prefetching). */
export const jobImagesQuery = (
  orgId: string | undefined,
  projectId: string,
  jobId: string,
  params: JobImagesParams = {}
) => ({
  queryKey: [...jobImagesKeys.all, orgId, projectId, jobId, params],
  queryFn: () => fetchJobImages(projectId, jobId, params),
});

export const useJobImages = (
  projectId: string,
  jobId: string,
  params: JobImagesParams = {},
  /**
   * frozen: keep the list exactly as loaded (no refetch on focus/reconnect).
   * The annotator walks this list by index, so it must not reshuffle as
   * images change status underneath it.
   */
  { frozen = false }: { frozen?: boolean } = {}
) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    ...jobImagesQuery(currentOrganization?.id, projectId, jobId, params),
    enabled: !!currentOrganization && !!projectId && !!jobId,
    // Keep showing the previous tab/page while the next one loads — no
    // blank grid flashes. Revisiting a tab within 30s is served from cache.
    placeholderData: keepPreviousData,
    staleTime: frozen ? Infinity : 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: !frozen,
    refetchOnReconnect: !frozen,
  });
};

/**
 * Per-tab counts for a job. Keyed by job only — switching tabs or pages never
 * refetches it; it refreshes on mutations (see invalidateJobImages) and focus.
 */
export const useJobImageCounts = (projectId: string, jobId: string) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: [...jobImagesKeys.counts, currentOrganization?.id, projectId, jobId],
    queryFn: () => fetchJobImageCounts(projectId, jobId),
    enabled: !!currentOrganization && !!projectId && !!jobId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
};

/**
 * Call after anything that changes an image's status (review, null, delete, …).
 * Counts refetch right away; image lists are only marked stale, so the
 * annotator's prev/next list doesn't reshuffle mid-session — the job grid
 * picks up the change when it is next shown.
 */
export const invalidateJobImages = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: jobImagesKeys.counts });
  queryClient.invalidateQueries({ queryKey: jobImagesKeys.all, refetchType: "none" });
};
