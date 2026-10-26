// hooks/useOpenInAnnotator.ts
//
// Jump from an image (Dataset page) straight into the annotator — inside its
// annotation job when it has one, on the right page of that job so previous /
// next work — and come back to exactly where you were (`returnTo`).

import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiFetch, withQuery } from '@/services/apiClient';

export interface ImageJob {
  id: string;
  name: string;
  status?: string;
}

interface JobImagePosition {
  job_id: string;
  job_name: string;
  status: string | null;
  index: number;
  page: number;
  limit: number;
  total: number;
}

/** Page size of the job view (JobAnnotation's default). */
export const JOB_PAGE_SIZE = 20;

/** Only same-project paths are accepted as return targets (no open redirects). */
export function safeReturnTo(value: string | null, projectId: string): string | null {
  if (!value || !value.startsWith(`/projects/${projectId}/`) || value.startsWith('//')) return null;
  return value;
}

export function useOpenInAnnotator(projectId: string) {
  const navigate = useNavigate();
  const location = useLocation();
  const [opening, setOpening] = useState<string | null>(null);

  const open = useCallback(
    async (imageId: string, job?: ImageJob) => {
      const params = new URLSearchParams();
      params.set('returnTo', `${location.pathname}${location.search}`);

      if (job) {
        setOpening(imageId);
        try {
          const response = await apiFetch(
            withQuery(`/api/v1/projects/${projectId}/jobs/${job.id}/images/${imageId}/position`, {
              limit: JOB_PAGE_SIZE,
            }),
          );
          if (response.ok) {
            const position: JobImagePosition = await response.json();
            params.set('jobId', String(position.job_id));
            params.set('status', position.status || '');
            params.set('page', String(position.page));
            params.set('limit', String(position.limit));
            params.set('index', String(((position.index - 1) % position.limit) + 1));
          } else {
            toast.message(`Opening without job context: ${job.name} no longer contains this image`);
          }
        } catch {
          toast.message('Opening without job context');
        } finally {
          setOpening(null);
        }
      }
      navigate(`/projects/${projectId}/images/${imageId}?${params.toString()}`);
    },
    [projectId, navigate, location.pathname, location.search],
  );

  return { open, opening };
}
