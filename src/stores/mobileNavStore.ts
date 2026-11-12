import { create } from 'zustand';

/** On phones the app menu and the project menu are drawers; at most one is open. */
export type MobileNavPanel = 'app' | 'project' | null;

interface MobileNavState {
  panel: MobileNavPanel;
  setPanel: (panel: MobileNavPanel) => void;
}

export const useMobileNavStore = create<MobileNavState>()((set) => ({
  panel: null,
  setPanel: (panel) => set({ panel }),
}));
