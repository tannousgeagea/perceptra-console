import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { jobImagesQuery } from '@/hooks/useJobImages';
import { selectSessions, useResumeStore, type ResumeEntry } from '@/stores/resumeStore';

/** Lists that images leave as they are worked on (see the annotator's queue mode). */
const QUEUE_STATUSES = new Set(['unannotated', 'annotated']);

export const annotatorUrl = (entry: ResumeEntry, imageId: string, page: number, index: number) => {
  const params = new URLSearchParams();
  if (entry.jobId) {
    params.set('jobId', entry.jobId);
    params.set('status', entry.status);
    params.set('page', String(page));
    params.set('limit', String(entry.limit));
    params.set('index', String(index));
  }
  const query = params.toString();
  return `/projects/${entry.projectId}/images/${imageId}${query ? `?${query}` : ''}`;
};

export const jobUrl = (entry: ResumeEntry) =>
  entry.jobId
    ? `/projects/${entry.projectId}/annotate/job/${entry.jobId}?status=${encodeURIComponent(entry.status || 'unannotated')}`
    : `/projects/${entry.projectId}/dataset`;

/** This user's recent annotation sessions in the current organization (optionally one project), newest first. */
export const useRecentSessions = (projectId?: string) => {
  const { user } = useAuth();
  const { currentOrganization } = useCurrentOrganization();
  const entries = useResumeStore((s) => s.entries);
  return useMemo(() => {
    const sessions = selectSessions(entries, user?.id ? String(user.id) : undefined, currentOrganization?.id);
    return projectId ? sessions.filter((s) => s.projectId === projectId) : sessions;
  }, [entries, user?.id, currentOrganization?.id, projectId]);
};

/**
 * Opens the annotator where a session left off. For queue lists ("to annotate",
 * "annotated") the last image has usually left the list since, so this lands
 * on the first image still waiting — or on that same image if it still is.
 */
export const useResumeSession = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const forget = useResumeStore((s) => s.forget);
  const [resuming, setResuming] = useState<string | null>(null);

  const resume = useCallback(
    async (entry: ResumeEntry) => {
      if (!entry.jobId || !QUEUE_STATUSES.has(entry.status)) {
        navigate(annotatorUrl(entry, entry.imageId, entry.page, entry.index));
        return;
      }
      setResuming(entry.key);
      try {
        // Same params as the annotator's page 1, so it reuses this response.
        const fresh = await queryClient.fetchQuery({
          ...jobImagesQuery(currentOrganization?.id, entry.projectId, entry.jobId, {
            status: entry.status,
            skip: 0,
            limit: entry.limit,
            includeCounts: false,
          }),
          staleTime: 0,
        });
        const ids = fresh.images.map((img) => img.image_id);
        if (!ids.length) {
          toast.success(`Nothing left to do in ${entry.jobName ?? 'this job'} 🎉`);
          navigate(jobUrl(entry));
          return;
        }
        const index = Math.max(0, ids.indexOf(entry.imageId));
        navigate(annotatorUrl(entry, ids[index], 1, index));
      } catch {
        toast.error(`${entry.jobName ?? 'This job'} is no longer available`);
        forget(entry.key);
      } finally {
        setResuming(null);
      }
    },
    [navigate, queryClient, currentOrganization?.id, forget],
  );

  return { resume, resuming };
};

export const formatAgo = (at: number) => {
  const minutes = Math.round((Date.now() - at) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
};
