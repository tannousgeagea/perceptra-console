import { create } from 'zustand';

/** Gaps longer than this are breaks, not work, and are left out of the pace. */
const BREAK_MS = 10 * 60 * 1000;
const WINDOW = 25;

interface AnnotationPaceState {
  /** The job (or other scope) the timestamps belong to. */
  scope: string | null;
  /** When the annotator finished each image (approved / marked empty), oldest first. */
  finishedAt: number[];
  setScope: (scope: string | null) => void;
  recordFinished: () => void;
}

/**
 * Per-session annotation pace. Lives outside React so it survives moving
 * between images (and the annotator remounting).
 */
export const useAnnotationPaceStore = create<AnnotationPaceState>((set) => ({
  scope: null,
  finishedAt: [],
  setScope: (scope) =>
    set((state) => (state.scope === scope ? state : { scope, finishedAt: [] })),
  recordFinished: () =>
    set((state) => ({ finishedAt: [...state.finishedAt, Date.now()].slice(-WINDOW) })),
}));

/**
 * Median time per image over recent work, ignoring breaks.
 * Null until there is enough data to be meaningful.
 */
export const medianMsPerImage = (finishedAt: number[]): number | null => {
  const gaps: number[] = [];
  for (let i = 1; i < finishedAt.length; i++) {
    const gap = finishedAt[i] - finishedAt[i - 1];
    if (gap > 0 && gap < BREAK_MS) gaps.push(gap);
  }
  if (gaps.length < 2) return null;
  gaps.sort((a, b) => a - b);
  const mid = Math.floor(gaps.length / 2);
  return gaps.length % 2 ? gaps[mid] : (gaps[mid - 1] + gaps[mid]) / 2;
};
