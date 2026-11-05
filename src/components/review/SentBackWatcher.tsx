import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime, useRealtimeEvent } from '@/contexts/RealtimeContext';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { toFixUrl, useUserJobs } from '@/hooks/useUserJobs';
import { CLIENT_ID } from '@/services/apiClient';
import { noticeScope, useNotificationStore, type NoticeKind } from '@/stores/notificationStore';

const SESSION_KEY = 'mtx-sent-back-summary-shown';

const plural = (n: number) => `${n} image${n === 1 ? '' : 's'}`;

/**
 * Tells annotators about new work, wherever they are in the app: a job newly
 * assigned to them, and images a reviewer sent back. Watches /jobs/me (polled,
 * and refreshed at once by live events inside a project): a job id not seen
 * before is a new assignment; a rising "to fix" count is work sent back. On
 * the first load of a browser session, one summary if fixes are already
 * waiting (existing jobs are not announced). Renders nothing.
 */
export const SentBackWatcher = () => {
  const { isAuthenticated, user } = useAuth();
  const me = user?.id != null ? String(user.id) : null;
  const { currentOrganization } = useCurrentOrganization();
  const scope = noticeScope(me, currentOrganization?.id);
  const addNotice = useNotificationStore((s) => s.add);
  const { data: jobs } = useUserJobs();
  const { presence } = useRealtime();
  const navigate = useNavigate();
  const previous = useRef<Map<string, number> | null>(null);
  const lastReviewer = useRef<string | null>(null);

  /** Toast now, and keep it in the notifications panel. */
  const notify = (kind: NoticeKind, title: string, description: string, url: string) => {
    const show = kind === 'sent_back' ? toast.warning : toast.info;
    show(title, { description, action: { label: 'Open', onClick: () => navigate(url) }, duration: 10_000 });
    if (scope) addNotice(scope, { kind, title, description, url });
  };

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

    // New assignments: job ids that were not in the last snapshot (not ones I gave myself).
    const added = jobs.filter(
      (job) =>
        !previous.current!.has(String(job.id)) &&
        String(job.status) !== 'sliced' &&
        !(me && job.assigned_by_id === me),
    );
    const givers = [...new Set(added.map((job) => job.assigned_by).filter(Boolean))];
    const giver = givers.length === 1 ? givers[0] : null;
    if (added.length === 1) {
      const job = added[0];
      notify(
        'assigned',
        giver ? `${giver} assigned you ${job.name}` : `New job assigned: ${job.name}`,
        `${job.image_count.toLocaleString()} images${job.project_name ? ` in ${job.project_name}` : ''}.`,
        `/projects/${job.project_id}/annotate/job/${job.id}`,
      );
    } else if (added.length > 1) {
      const images = added.reduce((sum, job) => sum + (job.image_count ?? 0), 0);
      notify(
        'assigned',
        giver ? `${giver} assigned you ${added.length} jobs` : `${added.length} new jobs assigned to you`,
        `${images.toLocaleString()} images: ${added.map((job) => job.name).join(', ')}.`,
        `/projects/${added[0].project_id}/annotate/job/${added[0].id}`,
      );
    }

    for (const job of jobs) {
      if (!previous.current.has(String(job.id))) continue; // new: announced above
      const before = previous.current.get(String(job.id)) ?? 0;
      const now = job.to_fix ?? 0;
      if (now > before) {
        notify(
          'sent_back',
          `${lastReviewer.current ?? 'A reviewer'} sent back ${plural(now - before)}`,
          `In ${job.name}: open it to see what needs fixing.`,
          toFixUrl(job),
        );
      }
    }
    lastReviewer.current = null;
    previous.current = counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify reads scope/navigate, listed here
  }, [jobs, isAuthenticated, navigate, me, scope]);

  return null;
};
