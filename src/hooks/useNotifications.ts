// hooks/useNotifications.ts
//
// The signed-in user's notifications in the current organization, from the
// server. Live: the "notification" realtime event merges into the cache (see
// NotificationWatcher); a slow poll covers a tab that was away.

import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { apiFetch } from '@/services/apiClient';

export type NoticeKind = 'assigned' | 'sent_back' | 'ready_for_review';

export interface Notice {
  id: number;
  kind: NoticeKind;
  title: string;
  body: string;
  /** Console path that "open" goes to. */
  url: string;
  /** Events folded into this notice (e.g. images sent back). */
  count: number;
  read: boolean;
  organization_id: string;
  project_id: string | null;
  actor: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoticePage {
  items: Notice[];
  unread: number;
  next_before: string | null;
}

const PAGE_SIZE = 50;

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (orgId?: string) => ['notifications', orgId] as const,
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  if (!response.ok) throw new Error(`Notifications request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const { currentOrganization } = useCurrentOrganization();
  const orgId = currentOrganization?.id;

  return useQuery({
    queryKey: notificationKeys.list(orgId),
    // The organization is sent explicitly so the cache key and the request agree.
    queryFn: () =>
      call<NoticePage>(`/api/v1/notifications?limit=${PAGE_SIZE}`, { headers: { 'X-Organization-ID': orgId! } }),
    enabled: isAuthenticated && !!orgId,
    refetchInterval: 60_000,
    staleTime: 15_000,
  });
};

/** Put a pushed notice into the cached list (new on top, or replacing its older self). */
export const mergeNotice = (queryClient: QueryClient, orgId: string, notice: Notice) => {
  queryClient.setQueryData<NoticePage>(notificationKeys.list(orgId), (page) => {
    if (!page) return page;
    const previous = page.items.find((n) => n.id === notice.id);
    const items = [notice, ...page.items.filter((n) => n.id !== notice.id)];
    const unread = page.unread + (notice.read ? 0 : 1) - (previous && !previous.read ? 1 : 0);
    return { ...page, items: items.slice(0, PAGE_SIZE), unread: Math.max(0, unread) };
  });
};

/** Optimistic change of the cached list; rolled back by a refetch if the request fails. */
const useNoticeMutation = <V>(
  request: (vars: V) => Promise<unknown>,
  update: (page: NoticePage, vars: V) => NoticePage,
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const key = notificationKeys.list(currentOrganization?.id);

  return useMutation({
    mutationFn: request,
    onMutate: async (vars: V) => {
      await queryClient.cancelQueries({ queryKey: key });
      queryClient.setQueryData<NoticePage>(key, (page) => (page ? update(page, vars) : page));
    },
    onError: () => queryClient.invalidateQueries({ queryKey: key }),
  });
};

export const useMarkNoticeRead = () =>
  useNoticeMutation(
    (id: number) => call(`/api/v1/notifications/${id}/read`, { method: 'POST' }),
    (page, id) => {
      const target = page.items.find((n) => n.id === id);
      if (!target || target.read) return page;
      return {
        ...page,
        unread: Math.max(0, page.unread - 1),
        items: page.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
      };
    },
  );

export const useMarkAllNoticesRead = () =>
  useNoticeMutation<void>(
    () => call('/api/v1/notifications/read-all', { method: 'POST' }),
    (page) => ({ ...page, unread: 0, items: page.items.map((n) => ({ ...n, read: true })) }),
  );

export const useClearNotices = () =>
  useNoticeMutation<void>(
    () => call('/api/v1/notifications', { method: 'DELETE' }),
    (page) => ({ ...page, unread: 0, items: [], next_before: null }),
  );
