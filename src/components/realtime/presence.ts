import type { PresenceEntry } from '@/contexts/RealtimeContext';

/** Stable per-person colour (same person, same colour on every screen). */
const PALETTE = [
  'bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-600', 'bg-fuchsia-500', 'bg-lime-600',
];
export const personColor = (userId: string) => {
  let hash = 0;
  for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

export const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const PAGE_LABELS: Record<string, string> = {
  job: 'a job’s images',
  annotate: 'jobs',
  dataset: 'the dataset',
  overview: 'the project',
};

/** "annotating an image in this job", "on the dataset", … */
export const describeWhere = (entry: PresenceEntry, context?: { imageUid?: string; jobId?: string }) => {
  if (entry.view === 'annotate') {
    if (context?.imageUid && entry.image_uid === context.imageUid) return 'on this image';
    if (context?.jobId && entry.job_id === context.jobId) return 'annotating in this job';
    return 'annotating';
  }
  if (entry.page === 'job' && context?.jobId && entry.job_id === context.jobId) return 'viewing this job';
  return `on ${PAGE_LABELS[entry.page ?? ''] ?? (entry.page ? entry.page.replace(/-/g, ' ') : 'the project')}`;
};
