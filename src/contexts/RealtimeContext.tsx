import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { useCurrentProjectId } from '@/hooks/useCurrentProjectId';
import { jobImagesKeys } from '@/hooks/useJobImages';
import { apiFetch, CLIENT_ID } from '@/services/apiClient';
import { authStorage } from '@/services/authService';
import { openProjectStream, type RealtimeEvent, type StreamStatus } from '@/services/realtimeStream';
import type { ProjectImageOut } from '@/types/image';

export interface PresenceEntry {
  user_id: string;
  name: string;
  view: 'annotate' | 'project';
  /** Image open in the annotator (its URL id). */
  image_uid?: string | null;
  job_id?: string | null;
  /** Project page, e.g. "dataset", when not annotating. */
  page?: string | null;
  /** Distinguishes two tabs of the same user. */
  session?: string;
  ts: number;
}

export type RealtimeStatus = StreamStatus | 'off';
type Listener = (event: RealtimeEvent) => void;

interface RealtimeValue {
  projectId?: string;
  status: RealtimeStatus;
  /** Everyone on the project right now, this user's tabs included. */
  presence: PresenceEntry[];
  subscribe: (listener: Listener) => () => void;
}

const RealtimeContext = createContext<RealtimeValue>({
  status: 'off',
  presence: [],
  subscribe: () => () => undefined,
});

const HEARTBEAT_MS = 20_000;

/** Presence calls are skipped once signed out (a 401 there would start a refresh/logout cycle). */
const signedIn = () => !!authStorage.getAuthData().accessToken;
/** A tab hidden this long leaves (frees its connection, stops showing as present). */
const AWAY_AFTER_MS = 60_000;
/** Remote changes are applied at most this often, so busy projects don't refetch constantly. */
const MIN_REFRESH_INTERVAL_MS = 3_000;
const REFRESH_DELAY_MS = 600;

interface PendingRefresh {
  /** Project images whose details changed (annotations, status). */
  images: Set<number>;
  /** Image lists, job counts, project statistics. */
  lists: boolean;
  jobs: boolean;
  classes: boolean;
}

const emptyPending = (): PendingRefresh => ({ images: new Set(), lists: false, jobs: false, classes: false });

/** False once the tab has been hidden for a while; true again as soon as it is shown. */
const usePageActive = () => {
  const [active, setActive] = useState(() => typeof document === 'undefined' || !document.hidden);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onChange = () => {
      clearTimeout(timer);
      if (document.hidden) timer = setTimeout(() => setActive(false), AWAY_AFTER_MS);
      else setActive(true);
    };
    document.addEventListener('visibilitychange', onChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onChange);
    };
  }, []);
  return active;
};

/** Where this tab is in the project, for presence. */
const useWhere = (projectId?: string) => {
  const { pathname, search } = useLocation();
  return useMemo(() => {
    if (!projectId) return null;
    const rest = pathname.slice(`/projects/${projectId}/`.length).split('/');
    if (rest[0] === 'images' && rest[1]) {
      const jobId = new URLSearchParams(search).get('jobId');
      return { view: 'annotate' as const, image_uid: decodeURIComponent(rest[1]), job_id: jobId || null, page: null };
    }
    if (rest[0] === 'annotate' && rest[1] === 'job' && rest[2]) {
      return { view: 'project' as const, image_uid: null, job_id: rest[2], page: 'job' };
    }
    return { view: 'project' as const, image_uid: null, job_id: null, page: rest[0] || 'overview' };
  }, [pathname, search, projectId]);
};

const applyRefresh = (queryClient: QueryClient, projectId: string, pending: PendingRefresh, orgId?: string) => {
  if (pending.images.size) {
    // Drop cached details of changed images that are not on screen, so the
    // annotator never opens one from a stale cache. The image open in the
    // annotator is left alone: it shows a "changed by …" notice instead.
    queryClient.removeQueries({
      predicate: (query) => {
        if (query.queryKey[0] !== 'projectImageDetails' || query.getObserversCount() > 0) return false;
        const data = query.state.data as ProjectImageOut | undefined;
        return !!data && pending.images.has(Number(data.id));
      },
    });
  }
  if (pending.lists) {
    queryClient.invalidateQueries({ queryKey: jobImagesKeys.counts });
    // Job image lists only go stale: the annotator walks a frozen list.
    // The job grid listens for events and refetches its own page.
    queryClient.invalidateQueries({ queryKey: jobImagesKeys.all, refetchType: 'none' });
    queryClient.invalidateQueries({ queryKey: ['projectImages', orgId, projectId] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
  }
  if (pending.jobs) {
    queryClient.invalidateQueries({ queryKey: ['jobs', projectId] });
    queryClient.invalidateQueries({ queryKey: ['userAssignedJobs'] });
  }
  if (pending.classes) {
    queryClient.invalidateQueries({ queryKey: ['annotationClasses', projectId] });
  }
};

/**
 * Live connection to the project the user is on (from the URL): applies
 * other people's changes to cached data, keeps presence ("who's here, on
 * which image"), and lets components react to events. One stream per tab,
 * kept across navigation within a project.
 */
export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const projectId = useCurrentProjectId();
  const { isAuthenticated } = useAuth();
  const { currentOrganization } = useCurrentOrganization();
  const orgId = currentOrganization?.id;
  const queryClient = useQueryClient();
  const active = usePageActive();
  const where = useWhere(projectId);
  const enabled = !!projectId && isAuthenticated && !!orgId && active;

  const [status, setStatus] = useState<RealtimeStatus>('off');
  const [presence, setPresence] = useState<PresenceEntry[]>([]);
  const listenersRef = useRef(new Set<Listener>());

  // ─── Applying remote changes (batched, throttled) ─────────────────────────
  const pendingRef = useRef<PendingRefresh>(emptyPending());
  const flushTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastFlushRef = useRef(0);

  const scheduleRefresh = useCallback(() => {
    if (flushTimerRef.current || !projectId) return;
    const wait = Math.max(REFRESH_DELAY_MS, lastFlushRef.current + MIN_REFRESH_INTERVAL_MS - Date.now());
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = undefined;
      lastFlushRef.current = Date.now();
      const pending = pendingRef.current;
      pendingRef.current = emptyPending();
      applyRefresh(queryClient, projectId, pending, orgId);
    }, wait);
  }, [projectId, orgId, queryClient]);

  const queueEvent = useCallback(
    (event: RealtimeEvent) => {
      const pending = pendingRef.current;
      const data = (event.data ?? {}) as { project_image_id?: number; resource?: string; status?: string };
      switch (event.type) {
        case 'annotation.changed':
        case 'image.changed':
          if (data.project_image_id != null) pending.images.add(Number(data.project_image_id));
          pending.lists = true;
          // Sent back: the assignee's "to fix" counts (jobs/me) change right away.
          if (event.type === 'image.changed' && data.status === 'rejected') pending.jobs = true;
          break;
        case 'project.changed':
          if (data.resource === 'classes') pending.classes = true;
          else if (data.resource === 'jobs') pending.jobs = pending.lists = true;
          else pending.lists = true;
          break;
        default:
          return;
      }
      scheduleRefresh();
    },
    [scheduleRefresh],
  );

  // After an outage or a long absence, events were missed: refresh broadly once.
  const missedEventsRef = useRef(false);

  // ─── The stream ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !projectId) {
      setStatus('off');
      setPresence([]);
      return;
    }
    const close = openProjectStream(projectId, {
      onStatus: (next) => {
        setStatus(next);
        if (next === 'reconnecting') missedEventsRef.current = true;
        if (next === 'live' && missedEventsRef.current) {
          missedEventsRef.current = false;
          pendingRef.current.lists = pendingRef.current.jobs = true;
          scheduleRefresh();
        }
      },
      onEvent: (event) => {
        if (event.type === 'presence') {
          setPresence(Array.isArray(event.data) ? (event.data as PresenceEntry[]) : []);
          return;
        }
        listenersRef.current.forEach((listener) => listener(event));
        if (event.origin && event.origin === CLIENT_ID) return; // this tab's own change
        queueEvent(event);
      },
    });
    return () => {
      close();
      missedEventsRef.current = true; // whatever happens until the next connection is missed
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = undefined;
      pendingRef.current = emptyPending();
    };
  }, [enabled, projectId, orgId, queueEvent, scheduleRefresh]);

  // A new project starts without a backlog.
  useEffect(() => {
    missedEventsRef.current = false;
  }, [projectId, orgId]);

  // ─── Presence ─────────────────────────────────────────────────────────────
  const whereKey = where ? JSON.stringify(where) : '';
  useEffect(() => {
    if (!enabled || !projectId || !whereKey) return;
    const send = () =>
      signedIn() &&
      apiFetch(`/api/v1/projects/${projectId}/presence`, {
        method: 'PUT',
        body: JSON.stringify({ client_id: CLIENT_ID, ...JSON.parse(whereKey) }),
      }).catch(() => undefined);
    const first = setTimeout(send, 300); // navigation settles first
    const interval = setInterval(send, HEARTBEAT_MS);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [enabled, projectId, whereKey]);

  useEffect(() => {
    if (!enabled || !projectId) return;
    const leave = () =>
      signedIn() &&
      apiFetch(`/api/v1/projects/${projectId}/presence?client_id=${encodeURIComponent(CLIENT_ID)}`, {
        method: 'DELETE',
        keepalive: true, // still sent while the page unloads
      }).catch(() => undefined);
    window.addEventListener('pagehide', leave);
    return () => {
      window.removeEventListener('pagehide', leave);
      void leave(); // left the project, logged out, or tab went away
    };
  }, [enabled, projectId, orgId]);

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const value = useMemo(
    () => ({ projectId: enabled ? projectId : undefined, status, presence, subscribe }),
    [enabled, projectId, status, presence, subscribe],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = () => useContext(RealtimeContext);

/** Calls the handler for every live event of the current project (the latest handler, no resubscribing). */
export const useRealtimeEvent = (handler: Listener) => {
  const { subscribe } = useRealtime();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => subscribe((event) => handlerRef.current(event)), [subscribe]);
};

/** Other people on the project (not this user), one entry per person, annotators first. */
export const useOthersPresence = () => {
  const { presence } = useRealtime();
  const { user } = useAuth();
  const me = user?.id != null ? String(user.id) : undefined;
  return useMemo(() => {
    const byUser = new Map<string, PresenceEntry>();
    for (const entry of presence) {
      if (String(entry.user_id) === me) continue;
      const existing = byUser.get(entry.user_id);
      // Keep the most telling tab: annotating beats browsing, then the freshest.
      if (
        !existing ||
        (entry.view === 'annotate' && existing.view !== 'annotate') ||
        (entry.view === existing.view && entry.ts > existing.ts)
      ) {
        byUser.set(entry.user_id, entry);
      }
    }
    return [...byUser.values()].sort(
      (a, b) => Number(b.view === 'annotate') - Number(a.view === 'annotate') || a.name.localeCompare(b.name),
    );
  }, [presence, me]);
};
