// The top of a training run's page: where the run stands right now.
// Running: epoch N of M, time left, best so far, and a warning when epochs stop.
// Finished: how long it took, the best result, and where to go next.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import { cn } from '@/lib/utils';
import type { TrainingSession } from '@/types/training_session';
import { useProjectPermissions } from '@/hooks/usePermissions';
import StopRunButton from './StopRunButton';
import { fmtDateTime, fmtDuration, fmtMetric, keyLabel } from '@/components/lineage/format';

const ACTIVE = new Set(['pending', 'queued', 'initializing', 'running']);

const STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: 'Pending', tone: 'text-amber-700 dark:text-amber-400' },
  queued: { label: 'Queued', tone: 'text-amber-700 dark:text-amber-400' },
  initializing: { label: 'Starting', tone: 'text-amber-700 dark:text-amber-400' },
  running: { label: 'Training', tone: 'text-[var(--mtx-primary)] dark:text-violet-400' },
  completed: { label: 'Completed', tone: 'text-emerald-700 dark:text-emerald-400' },
  failed: { label: 'Failed', tone: 'text-rose-700 dark:text-rose-400' },
  cancelled: { label: 'Cancelled', tone: 'text-muted-foreground' },
};

const WAITING: Record<string, string> = {
  pending: 'Waiting to be scheduled.',
  queued: 'Waiting for a compute resource.',
  initializing: 'Preparing the dataset and the compute environment. The first epoch shows up here as soon as it ends.',
};

/** Seconds between two ISO times (or until now). */
const secondsBetween = (from?: string | null, to?: string | null) =>
  from ? Math.max(0, ((to ? new Date(to) : new Date()).getTime() - new Date(from).getTime()) / 1000) : null;

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm">{children}</dd>
    </div>
  );
}

export default function LiveRunHeader({ session, projectId }: { session: TrainingSession; projectId: string }) {
  const s = session;
  const status = STATUS[s.status] ?? { label: s.status, tone: 'text-muted-foreground' };
  const active = ACTIVE.has(s.status);
  const running = s.status === 'running';
  // Whoever may start a run may stop it (editor role, server rule).
  const permissions = useProjectPermissions(projectId);
  const canStop = active && !permissions.isLoading && permissions.can('edit');
  const stalled = running && s.stalledSeconds != null;
  const pct = Math.max(0, Math.min(100, s.progress || 0));
  const best = s.bestEpoch;
  const bestText = best ? `${keyLabel(best.metric)} ${fmtMetric(best.metric, best.value)} at epoch ${best.epoch}` : null;
  const took = secondsBetween(s.startedAt, s.completedAt);
  const versionUrl = s.modelId ? `/projects/${projectId}/models/${s.modelId}/versions/${encodeURIComponent(s.modelVersionId)}` : null;
  const compareUrl =
    s.modelId && s.productionVersionId
      ? `/projects/${projectId}/models/${s.modelId}/compare?a=${encodeURIComponent(s.productionVersionId)}&b=${encodeURIComponent(s.modelVersionId)}`
      : null;

  return (
    <header className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link to={`/projects/${projectId}/sessions`} className="hover:text-foreground">Training</Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="text-foreground">{s.modelName} {s.modelVersionName}</span>
      </nav>

      <div className="flex flex-col gap-1">
        <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-2xl font-semibold tracking-tight">
          {s.modelName} {s.modelVersionName}
          <span className={cn('text-sm font-medium', status.tone)}>{status.label}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {s.projectName}
          {s.triggeredBy ? `, started by ${s.triggeredBy}` : ''}
          {s.startedAt ? ` on ${fmtDateTime(s.startedAt)}` : ` (created ${fmtDateTime(s.createdAt)})`}
        </p>
      </div>

      {/* The one live region: screen readers hear each new epoch. */}
      <section aria-live="polite" className="space-y-4 rounded-lg border p-5">
        {active && !running ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{WAITING[s.status]}</p>
            {canStop && <StopRunButton session={s} />}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {running ? 'Epoch' : s.status === 'completed' ? 'Finished' : s.status === 'failed' ? 'Failed at epoch' : 'Stopped at epoch'}
                </p>
                <p className="text-4xl font-semibold tabular-nums tracking-tight">
                  {s.status === 'completed' && took != null ? (
                    <>in {fmtDuration(took)}</>
                  ) : (
                    <>
                      {s.currentEpoch || 0}
                      {s.totalEpochs > 0 && <span className="text-xl font-normal text-muted-foreground"> of {s.totalEpochs}</span>}
                    </>
                  )}
                </p>
              </div>
              <dl className="flex flex-wrap gap-x-8 gap-y-2">
                {running && (
                  <Fact label="Time left">
                    <span className="tabular-nums">
                      {s.stalledSeconds != null ? 'unknown while stalled'
                        : s.etaSeconds != null ? `about ${fmtDuration(s.etaSeconds)}` : 'after the first epochs'}
                    </span>
                  </Fact>
                )}
                {s.secondsPerEpoch != null && (
                  <Fact label="Per epoch"><span className="tabular-nums">{fmtDuration(s.secondsPerEpoch)}</span></Fact>
                )}
                {bestText && <Fact label={running ? 'Best so far' : 'Best epoch'}>{bestText}</Fact>}
              </dl>
              {/* Prominent when stalled: that's when stopping is most likely what you want. */}
              {canStop && <StopRunButton session={s} prominent={stalled} />}
            </div>

            <div
              className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Training progress"
            >
              <div
                className={cn(
                  'relative h-full overflow-hidden rounded-full transition-[width] duration-700',
                  s.status === 'completed' ? 'bg-emerald-600 dark:bg-emerald-500'
                    : s.status === 'failed' ? 'bg-rose-600 dark:bg-rose-500'
                    : 'bg-[var(--mtx-primary)] dark:bg-violet-400',
                )}
                style={{ width: `${pct}%` }}
              >
                {/* The one moving thing: a sheen across the done part while it trains. */}
                {running && <span className="run-pulse absolute inset-y-0 left-0 w-1/3" aria-hidden />}
              </div>
            </div>

            {s.status === 'cancelled' && s.errorMessage && (
              <p className="text-sm text-muted-foreground">{s.errorMessage}</p>
            )}

            {stalled && (
              <div className="flex gap-3 rounded-md border border-amber-300/70 bg-amber-50 px-3 py-2.5 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                <p className="text-amber-900 dark:text-amber-200">
                  No new epoch for {fmtDuration(s.stalledSeconds)}
                  {s.secondsPerEpoch != null ? `; epochs usually take ${fmtDuration(s.secondsPerEpoch)}` : ''}. The run may be stuck:
                  check the compute resource{s.computeResource ? ` (${s.computeResource})` : ''}{canStop ? ', or stop the run' : ''}.
                </p>
              </div>
            )}

            {s.status === 'completed' && (versionUrl || compareUrl) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {compareUrl && (
                  <Button asChild size="sm">
                    <Link to={compareUrl}>
                      <GitCompare className="mr-2 h-4 w-4" aria-hidden />
                      Compare with production {s.productionVersionName}
                    </Link>
                  </Button>
                )}
                {versionUrl && (
                  <Button asChild size="sm" variant={compareUrl ? 'outline' : 'default'}>
                    <Link to={versionUrl}>See {s.modelVersionName}</Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <Fact label="Created">{fmtDateTime(s.createdAt)}</Fact>
        <Fact label={s.completedAt ? 'Took' : 'Running for'}>
          <span className="tabular-nums">{s.startedAt ? fmtDuration(took) : '—'}</span>
        </Fact>
        <Fact label="Compute">{s.computeResource ?? '—'}</Fact>
        <Fact label="Last epoch">{s.lastEpochAt ? fmtDateTime(s.lastEpochAt) : '—'}</Fact>
      </dl>

      <style>{`
        .run-pulse { background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent); }
        @media (prefers-reduced-motion: no-preference) {
          .run-pulse { animation: run-pulse 2.4s linear infinite; }
          @keyframes run-pulse { from { transform: translateX(-100%); } to { transform: translateX(300%); } }
        }
      `}</style>
    </header>
  );
}
