import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Where an annotator left off in a job (or a project outside a job). */
export interface ResumeEntry {
  /** user|org|job-or-project — one entry per job. */
  key: string;
  userId: string;
  orgId: string;
  projectId: string;
  projectName?: string;
  jobId?: string;
  jobName?: string;
  imageId: string;
  imageName: string;
  /** Job list the annotator was walking (tab), page and page size. */
  status: string;
  page: number;
  limit: number;
  /** 0-based index on that page. */
  index: number;
  at: number;
}

const MAX_ENTRIES = 30;
/** Older sessions are not worth offering. */
export const RESUME_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

interface ResumeState {
  entries: ResumeEntry[];
  record: (entry: Omit<ResumeEntry, 'key' | 'at'>) => void;
  forget: (key: string) => void;
}

export const resumeKey = (userId: string, orgId: string, scopeId: string) => `${userId}|${orgId}|${scopeId}`;

/**
 * Recent annotation sessions, newest first, kept in this browser so
 * "Continue where you left off" survives reloads and logouts.
 * Entries are scoped by user and organization.
 */
export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      entries: [],
      record: (entry) =>
        set((state) => {
          const key = resumeKey(entry.userId, entry.orgId, entry.jobId || entry.projectId);
          const previous = state.entries[0];
          // Same image again (re-render, refetch): nothing new to remember.
          if (
            previous?.key === key &&
            previous.imageId === entry.imageId &&
            previous.status === entry.status &&
            previous.page === entry.page &&
            previous.index === entry.index &&
            previous.jobName === entry.jobName
          ) {
            return state;
          }
          const rest = state.entries.filter((e) => e.key !== key);
          return { entries: [{ ...entry, key, at: Date.now() }, ...rest].slice(0, MAX_ENTRIES) };
        }),
      forget: (key) => set((state) => ({ entries: state.entries.filter((e) => e.key !== key) })),
    }),
    {
      name: 'mtx-resume-sessions',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Sessions of this user in this organization, newest first. */
export const selectSessions = (entries: ResumeEntry[], userId?: string, orgId?: string) => {
  if (!userId || !orgId) return [];
  const cutoff = Date.now() - RESUME_MAX_AGE_MS;
  return entries.filter((e) => e.userId === userId && e.orgId === orgId && e.at >= cutoff);
};
