import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime, useRealtimeEvent } from '@/contexts/RealtimeContext';
import { toFixUrl, useUserJobs } from '@/hooks/useUserJobs';
import { CLIENT_ID } from '@/services/apiClient';

const SESSION_KEY = 'mtx-sent-back-summary-shown';

const plural = (n: number) => `${n} image${n === 1 ? '' : 's'}`;

/**
 * Tells annotators when a reviewer sends their work back, wherever they are
 * in the app. Watches the per-job "to fix" counts of /jobs/me (polled; and
 * refreshed at once by live events inside a project) and toasts when a count
 * rises. On the first load of a browser session, one summary if anything is
 * already waiting. Renders nothing.
 */
export const SentBackWatcher = () => {
  const { isAuthenticated } = useAuth();
  const { data: jobs } = useUserJobs();
  const { presence } = useRealtime();
  const navigate = useNavigate();
  const previous = useRef<Map<string, number> | null>(null);
  const lastReviewer = useRef<string | null>(null);

  // Remember who sent something back most recently (live events carry the actor).
  useRealtimeEvent((event) => {
    if (event.origin === CLIENT_ID || event.type !== 'image.changed') return;
    if ((event.data as { status?: string })?.status !== 'rejected') return;
    const who = presence.find((p) => event.actor != null && String(p.user_id) === String(event.actor));
    lastReviewer.current = who?.name ?? null;
  });

  useEffect(() => {
    if (!isAuthenticated || !jobs) return;
    const counts = new Map(jobs.map((job) => [String(job.id), job.to_fix ?? 0]));

    if (previous.current === null) {
      previous.current = counts;
      const waiting = jobs.filter((job) => (job.to_fix ?? 0) > 0);
      const total = waiting.reduce((sum, job) => sum + (job.to_fix ?? 0), 0);
      let shown = false;
      try {
        shown = sessionStorage.getItem(SESSION_KEY) === '1';
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // storage unavailable: show it (once per page load)
      }
      if (total > 0 && !shown) {
        toast(`${plural(total)} sent back to you`, {
          description:
            waiting.length === 1
              ? `In ${waiting[0].name}. A reviewer left notes on what to fix.`
              : `Across ${waiting.length} jobs. A reviewer left notes on what to fix.`,
          action: { label: 'Open', onClick: () => navigate(toFixUrl(waiting[0])) },
          duration: 10_000,
        });
      }
      return;
    }

    for (const job of jobs) {
      const before = previous.current.get(String(job.id)) ?? 0;
      const now = job.to_fix ?? 0;
      if (now > before) {
        const who = lastReviewer.current;
        toast.warning(`${who ?? 'A reviewer'} sent back ${plural(now - before)}`, {
          description: `In ${job.name}: open it to see what needs fixing.`,
          action: { label: 'Open', onClick: () => navigate(toFixUrl(job)) },
          duration: 10_000,
        });
      }
    }
    lastReviewer.current = null;
    previous.current = counts;
  }, [jobs, isAuthenticated, navigate]);

  return null;
};
