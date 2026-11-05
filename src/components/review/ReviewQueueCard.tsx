import { ArrowRight, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/ui/button';
import { useCanReview } from '@/hooks/useCanReview';
import { ALL_JOBS_ID, reviewQueueUrl, useJobImageCounts } from '@/hooks/useJobImages';
import { formatAgo } from '@/hooks/useResumeSession';
import { cn } from '@/lib/utils';

/** Waiting longer than this is flagged (amber). */
const STALE_MS = 24 * 60 * 60 * 1000;

/**
 * For reviewers: how much annotated work waits for review across every job of
 * the project, and for how long, one click from the queue (All jobs →
 * Annotated, oldest first). Renders nothing for others, or when nothing waits.
 */
export const ReviewQueueCard = ({ projectId, className }: { projectId: string; className?: string }) => {
  const navigate = useNavigate();
  const canReview = useCanReview(projectId);
  const { data: counts } = useJobImageCounts(canReview ? projectId : '', ALL_JOBS_ID);

  if (!canReview || !counts?.annotated) return null;

  const oldest = counts.oldest_annotated_at ? new Date(counts.oldest_annotated_at).getTime() : null;
  const stale = oldest != null && Date.now() - oldest > STALE_MS;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4',
        stale ? 'border-amber-500/40' : 'border-border',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-600">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Review queue</div>
          <div className="truncate font-semibold text-foreground">
            {counts.annotated.toLocaleString()} image{counts.annotated === 1 ? '' : 's'} waiting for review
          </div>
          <div className={cn('truncate text-sm', stale ? 'text-amber-600' : 'text-muted-foreground')}>
            Across all jobs
            {oldest != null && <> · oldest waiting since {formatAgo(oldest)}</>}
            {counts.rejected > 0 && <> · {counts.rejected.toLocaleString()} sent back, being fixed</>}
          </div>
        </div>
      </div>
      <Button className="shrink-0 gap-2" onClick={() => navigate(reviewQueueUrl(projectId))}>
        Start reviewing <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
