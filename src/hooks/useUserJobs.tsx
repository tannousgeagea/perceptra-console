import { apiFetch } from '@/services/apiClient';

import { useQuery } from "@tanstack/react-query";
import { Job } from "@/types/jobs";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";

/** The "Needs fixes" tab of a job (images sent back to its assignee). */
export const toFixUrl = (job: Pick<Job, 'id' | 'project_id'>) =>
  `/projects/${job.project_id}/annotate/job/${job.id}?status=rejected`;

export const fetchMyAssignedJobs = async (organizationId: string): Promise<Job[]> => {
  // apiFetch adds the token; the organization is passed explicitly so the
  // cache key and the request always agree.
  const response = await apiFetch(`/api/v1/jobs/me`, {
    headers: { 'X-Organization-ID': organizationId },
  });

  if (!response.ok) throw new Error("Failed to fetch assigned jobs");
  const jobs: (Job & { imageCount?: number })[] = await response.json();
  // The API names it imageCount; the Job type (and the UI) use image_count.
  return jobs.map(({ imageCount, ...job }) => ({ ...job, image_count: job.image_count ?? imageCount ?? 0 }));
};

export const useUserJobs = () => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['userAssignedJobs', currentOrganization?.id],
    queryFn:() => {
          if (!currentOrganization) {
            throw new Error("No organization selected");
          }
          return fetchMyAssignedJobs(currentOrganization.id);
        },
    enabled: !!currentOrganization,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};
