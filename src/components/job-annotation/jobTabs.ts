import type { JobImageTab } from '@/types/image';

/** The job view's status tabs, in display order. 'dataset' = completed. */
export const JOB_TABS: { id: JobImageTab; label: string; color: string; hint: string }[] = [
  { id: 'unannotated', label: 'Unannotated', color: 'hsl(var(--chart-1))', hint: 'Waiting to be annotated' },
  { id: 'annotated', label: 'Annotated', color: 'hsl(var(--chart-2))', hint: 'Annotated, waiting for review' },
  { id: 'reviewed', label: 'Reviewed', color: 'hsl(var(--chart-3))', hint: 'Reviewed, ready to move to a dataset' },
  { id: 'dataset', label: 'Completed', color: 'hsl(var(--chart-4))', hint: 'Moved to a dataset' },
];
