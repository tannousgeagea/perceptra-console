import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type NoticeKind = 'assigned' | 'sent_back';

export interface Notice {
  id: string;
  kind: NoticeKind;
  title: string;
  description?: string;
  /** Where "open" goes (a job, or its Needs fixes tab). */
  url?: string;
  at: number;
  read: boolean;
}

const MAX_PER_SCOPE = 50;

interface NotificationState {
  /** Notices per "<userId>:<orgId>", newest first. */
  byScope: Record<string, Notice[]>;
  /** The notifications panel (shared, so the nav bell and toasts can open it). */
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (scope: string, notice: Omit<Notice, 'id' | 'at' | 'read'>) => void;
  markAllRead: (scope: string) => void;
  markRead: (scope: string, id: string) => void;
  clear: (scope: string) => void;
}

/**
 * The notices the app raised for this user (new jobs, work sent back), kept in
 * this browser so a missed toast can be found again. Per user and organization.
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      byScope: {},
      open: false,
      setOpen: (open) => set({ open }),
      add: (scope, notice) =>
        set((state) => ({
          byScope: {
            ...state.byScope,
            [scope]: [
              { ...notice, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, at: Date.now(), read: false },
              ...(state.byScope[scope] ?? []),
            ].slice(0, MAX_PER_SCOPE),
          },
        })),
      markAllRead: (scope) =>
        set((state) => ({
          byScope: { ...state.byScope, [scope]: (state.byScope[scope] ?? []).map((n) => ({ ...n, read: true })) },
        })),
      markRead: (scope, id) =>
        set((state) => ({
          byScope: {
            ...state.byScope,
            [scope]: (state.byScope[scope] ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)),
          },
        })),
      clear: (scope) => set((state) => ({ byScope: { ...state.byScope, [scope]: [] } })),
    }),
    {
      name: 'mtx-notifications',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ byScope: state.byScope }),
    },
  ),
);

/** The notification scope of the signed-in user in the current organization. */
export const noticeScope = (userId?: string | number | null, orgId?: string | null) =>
  userId != null && orgId ? `${userId}:${orgId}` : null;
