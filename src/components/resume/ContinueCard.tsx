import { ArrowRight, Loader, MessageSquareWarning, PlayCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/ui/button';
import { useJobImageCounts } from '@/hooks/useJobImages';
import { toFixUrl, useUserJobs } from '@/hooks/useUserJobs';
import { useUserProjects } from '@/hooks/useUserProjects';
import { formatAgo, useRecentSessions, useResumeSession } from '@/hooks/useResumeSession';
import { PALETTE_SHORTCUT, useCommandPaletteStore } from '@/stores/commandPaletteStore';
import { useResumeStore } from '@/stores/resumeStore';
import { cn } from '@/lib/utils';

interface ContinueCardProps {
  /** Only sessions of this project (e.g. on its Annotate page). */
  projectId?: string;
  className?: string;
}

/**
 * Images a reviewer sent back to the current user, ahead of everything else:
 * the total, the jobs they are in, and one click to the first job's fixes.
 */
const SentBackStrip = ({ projectId }: { projectId?: string }) => {
  const navigate = useNavigate();
  const { data: jobs } = useUserJobs();
  const waiting = (jobs ?? [])
    .filter((job) => (job.to_fix ?? 0) > 0 && (!projectId || job.project_id === projectId))
    .sort((a, b) => (b.to_fix ?? 0) - (a.to_fix ?? 0));
  if (waiting.length === 0) return null;
  const total = waiting.reduce((sum, job) => sum + (job.to_fix ?? 0), 0);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
          <MessageSquareWarning className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-rose-600">
            Sent back to you · {total} image{total === 1 ? '' : 's'}
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {waiting.map((job) => `${job.name} (${job.to_fix})`).join(' · ')}
          </div>
        </div>
      </div>
      <Button
        className="shrink-0 gap-2 bg-rose-600 text-white hover:bg-rose-500"
        onClick={() => navigate(toFixUrl(waiting[0]))}
      >
        Fix now <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

/**
 * "Continue where you left off": the annotator's latest session, with the
 * job's live progress, one click (or Enter) from the next image to do.
 * Work sent back by a reviewer is shown first.
 */
export const ContinueCard = ({ projectId, className }: ContinueCardProps) => (
  <div className={cn('space-y-3 empty:hidden', className)}>
    <SentBackStrip projectId={projectId} />
    <LatestSession projectId={projectId} />
  </div>
);

const LatestSession = ({ projectId, className }: ContinueCardProps) => {
  const sessions = useRecentSessions(projectId);
  const session = sessions[0];
  const { resume, resuming } = useResumeSession();
  const forget = useResumeStore((s) => s.forget);
  const openPalette = useCommandPaletteStore((s) => s.setOpen);
  const { data: projects } = useUserProjects();
  const { data: counts } = useJobImageCounts(session?.projectId ?? '', session?.jobId ?? '');

  if (!session) return null;

  const projectName = projects?.find((p) => p.project_id === session.projectId)?.name ?? session.projectName;
  const done = counts ? counts.total - counts.unannotated : null;
  const pct = counts?.total && done !== null ? Math.round((done / counts.total) * 100) : null;
  const finished = counts && counts.total > 0 && counts.unannotated === 0 && session.status === 'unannotated';
  const isResuming = resuming === session.key;
  const more = sessions.length - 1;

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4',
        className,
      )}
    >
      {/* accent bar */}
      <div className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,var(--mtx-accent),var(--mtx-primary),var(--mtx-secondary))]" />

      <div className="flex min-w-0 flex-1 items-center gap-3 pl-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PlayCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Continue where you left off · {formatAgo(session.at)}
          </div>
          <div className="truncate font-semibold text-foreground">
            {session.jobName ?? projectName ?? 'Annotation'}
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {[!projectId && session.jobName ? projectName : null, `Last image: ${session.imageName}`]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
      </div>

      {counts && counts.total > 0 && done !== null && (
        <div className="w-full shrink-0 sm:w-44">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium tabular-nums">
              {done.toLocaleString()} / {counts.total.toLocaleString()}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {finished ? 'all done' : `${counts.unannotated.toLocaleString()} left`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-2">
        {more > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => openPalette(true)}
            title={`All recent sessions (${PALETTE_SHORTCUT})`}
          >
            +{more} more
          </Button>
        )}
        <Button onClick={() => void resume(session)} disabled={isResuming} className="gap-2">
          {isResuming ? <Loader className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {finished ? 'Open job' : 'Continue'}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => forget(session.key)}
        className="absolute right-1.5 top-1.5 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
        aria-label="Dismiss"
        title="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
