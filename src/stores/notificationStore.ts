import { create } from 'zustand';

interface NotificationPanelState {
  /** The notifications panel (shared, so the nav bell and toasts can open it). */
  open: boolean;
  setOpen: (open: boolean) => void;
}

/** UI state only: the notices themselves come from the server (useNotifications). */
export const useNotificationStore = create<NotificationPanelState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

// Notices used to be kept in this browser; drop that old copy.
try {
  localStorage.removeItem('mtx-notifications');
} catch {
  // storage unavailable
}
