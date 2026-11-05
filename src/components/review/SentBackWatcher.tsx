import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeEvent } from '@/contexts/RealtimeContext';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { mergeNotice, useMarkNoticeRead, useNotifications, type Notice } from '@/hooks/useNotifications';
import { toFixUrl, useUserJobs } from '@/hooks/useUserJobs';
import { useNotificationStore } from '@/stores/notificationStore';

const SESSION_KEY = 'mtx-sent-back-summary-shown';
/** More new notices than this at once (e.g. back from a break): one summary toast. */
const MAX_TOASTS = 3;

const plural = (n: number) => `${n} image${n === 1 ? '' : 's'}`;

/**
 * Toasts new notifications wherever the user is in the app. Notices are made
 * on the server (job assigned, work sent back, a job ready for review) and
 * arrive live on the realtime stream, or with the next poll after the tab was
 * away; either way they land in the notifications cache and are toasted once.
 * On the first load of a browser session, one summary if fixes are already
 * waiting. Renders nothing.
 */
export const SentBackWatcher = () => {
  const { isAuthenticated } = useAuth();
  const { currentOrganization } = useCurrentOrganization();
  const orgId = currentOrganization?.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: jobs } = useUserJobs();
  const { data: page } = useNotifications();
  const { mutate: markRead } = useMarkNoticeRead();
  const openPanel = useNotificationStore((s) => s.setOpen);
  const seen = useRef<Map<number, string> | null>(null);
  const summaryChecked = useRef(false);

  // Live notices: into the cache (the effect below toasts them); my jobs change too.
  useRealtimeEvent((event) => {
    if (event.type !== 'notification' || !orgId) return;
    const notice = event.data as Notice;
    if (notice?.organization_id !== orgId) return;
    mergeNotice(queryClient, orgId, notice);
    if (notice.kind !== 'ready_for_review') {
      queryClient.invalidateQueries({ queryKey: ['userAssignedJobs'] });
    }
  });

  // Another organization: a fresh baseline, nothing from it is "new".
  useEffect(() => {
    seen.current = null;
  }, [orgId]);

  // Toast notices that are new, or updated (more images sent back), since the page loaded.
  useEffect(() => {
    if (!page) return;
    const before = seen.current;
    seen.current = new Map(page.items.map((n) => [n.id, n.updated_at]));
    if (before === null) return; // first load: just the baseline
    const fresh = page.items.filter((n) => !n.read && before.get(n.id) !== n.updated_at);
    if (fresh.length > MAX_TOASTS) {
      toast.info(`${fresh.length} new notifications`, {
        id: 'notices-summary',
        action: { label: 'Show', onClick: () => openPanel(true) },
        duration: 10_000,
      });
      return;
    }
    for (const notice of fresh) {
      const show = notice.kind === 'sent_back' ? toast.warning : toast.info;
      show(notice.title, {
        id: `notice-${notice.id}`, // a merged notice updates its toast instead of stacking
        description: notice.body,
        duration: 10_000,
        action: notice.url
          ? {
              label: 'Open',
              onClick: () => {
                markRead(notice.id);
                navigate(notice.url);
              },
            }
          : undefined,
      });
    }
  }, [page, markRead, navigate, openPanel]);

  // Once per browser session: fixes already waiting from before.
  useEffect(() => {
    if (!isAuthenticated || !jobs || summaryChecked.current) return;
    summaryChecked.current = true;
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
  }, [jobs, isAuthenticated, navigate]);

  return null;
};
