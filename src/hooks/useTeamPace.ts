import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';

export interface MemberPace {
  user_id: string;
  username: string;
  name: string;
  role: string;
  images_finished: number;
  active_hours: number;
  active_days: number;
  /** Their own pace, when they have any history. */
  images_per_hour: number | null;
  /** Enough finished images to trust images_per_hour. */
  measured: boolean;
  /** Own pace when measured, else the team median; null when neither exists. */
  effective_images_per_hour: number | null;
  /** Images still to do in their active jobs. */
  open_images: number;
  hours_to_clear_queue: number | null;
}

export interface TeamPace {
  window_days: number;
  team_median_images_per_hour: number | null;
  members: MemberPace[];
}

/** Each project member's recent pace and open queue (server-side, last 14 days). */
export const useTeamPace = (projectId?: string, enabled = true) =>
  useQuery({
    queryKey: ['teamPace', projectId],
    enabled: !!projectId && enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<TeamPace> => {
      const response = await apiFetch(`/api/v1/projects/${projectId}/team-pace`);
      if (!response.ok) throw new Error('Failed to load team pace');
      return response.json();
    },
  });

/** "~3.5 h" style duration for an hour count. */
export const formatHours = (hours: number | null | undefined): string => {
  if (hours == null || !isFinite(hours)) return '—';
  if (hours < 1) return `~${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 24) return `~${hours.toFixed(hours < 10 ? 1 : 0)} h`;
  return `~${(hours / 8).toFixed(1)} work days`;
};

/**
 * Slice sizes so everyone finishes at about the same time.
 *
 * Person i, at pace p_i with q_i images already queued, finishes at
 * (q_i + x_i) / p_i. Equal finish times give x_i = T * p_i - q_i with
 * T = (total + Σq) / Σp. Anyone whose queue alone runs past T still gets
 * one image (each slice needs at least one) and T is recomputed for the
 * rest. Sizes are rounded with the largest-remainder method so they sum to
 * `total` exactly. Returns null when there is no pace to balance by.
 */
export const balanceByPace = (
  total: number,
  slots: { pace: number | null; queue: number }[],
): number[] | null => {
  const n = slots.length;
  if (n === 0 || total < n) return null;
  const known = slots.map((s) => s.pace).filter((p): p is number => !!p && p > 0);
  if (known.length === 0) return null;
  // Slots without a pace (unassigned, or no history) work at the average known pace.
  const fallback = known.reduce((a, b) => a + b, 0) / known.length;
  const pace = slots.map((s) => (s.pace && s.pace > 0 ? s.pace : fallback));

  const pinned = new Set<number>();
  let shares: number[] = [];
  for (let round = 0; round <= n; round++) {
    const free = pace.map((_, i) => i).filter((i) => !pinned.has(i));
    const budget = total - pinned.size; // pinned slices take one image each
    const sumPace = free.reduce((a, i) => a + pace[i], 0);
    const sumQueue = free.reduce((a, i) => a + slots[i].queue, 0);
    const finish = (budget + sumQueue) / sumPace;
    shares = pace.map((p, i) => (pinned.has(i) ? 1 : finish * p - slots[i].queue));
    const tooFull = free.filter((i) => shares[i] < 1);
    if (tooFull.length === 0) break;
    tooFull.forEach((i) => pinned.add(i));
  }

  const floors = shares.map((s) => Math.max(1, Math.floor(s)));
  let left = total - floors.reduce((a, b) => a + b, 0);
  const order = shares
    .map((s, i) => ({ i, frac: s - Math.floor(s) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; left > 0; k = (k + 1) % n, left--) floors[order[k].i] += 1;
  for (let k = n - 1; left < 0; k = (k - 1 + n) % n) {
    const i = order[k].i;
    if (floors[i] > 1) { floors[i] -= 1; left++; }
  }
  return floors;
};
