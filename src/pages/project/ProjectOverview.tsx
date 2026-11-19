// /projects/:projectId: the project's pipeline as one connected line of
// stations (data -> annotate -> review -> dataset -> train -> evaluate ->
// deploy -> monitor), each with its key number and the action that moves work
// on, followed by what needs someone's attention.
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleDot,
  Hourglass,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/ui/button';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { cn } from '@/lib/utils';
import { useProjectOverview } from '@/hooks/useProjectOverview';
import { useProjectPermissions } from '@/hooks/usePermissions';
import {
  STATE_LABEL,
  ago,
  buildAttention,
  buildStages,
  healthSentence,
  type AttentionItem,
  type Stage,
  type StageAction,
  type StageState,
} from '@/components/overview/pipeline';

const STATE_STYLE: Record<StageState, { icon: LucideIcon; tone: string }> = {
  done: { icon: CheckCircle2, tone: 'text-emerald-600 dark:text-emerald-400' },
  running: { icon: CircleDot, tone: 'text-[var(--mtx-primary)] dark:text-violet-400' },
  waiting: { icon: Hourglass, tone: 'text-amber-600 dark:text-amber-400' },
  attention: { icon: AlertTriangle, tone: 'text-rose-600 dark:text-rose-400' },
  idle: { icon: Circle, tone: 'text-muted-foreground' },
};

type Can = (permission: NonNullable<StageAction['needs']>) => boolean;

/** The action, or a plain link to look when the person may not do it. */
function ActionLink({ action, can, primary }: { action: StageAction; can: Can; primary?: boolean }) {
  const allowed = !action.needs || can(action.needs);
  const label = allowed ? action.label : action.viewLabel ?? action.label;
  const to = allowed ? action.to : action.viewTo ?? action.to;
  if (allowed && primary) {
    return (
      <Button asChild size="sm" variant="outline" className="h-8">
        <Link to={to}>{label}</Link>
      </Button>
    );
  }
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-[var(--mtx-primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-violet-400"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}

function Station({ stage, isLast, isNext, can }: { stage: Stage; isLast: boolean; isNext: boolean; can: Can }) {
  const { icon: Icon, tone } = STATE_STYLE[stage.state];
  const running = stage.state === 'running';
  return (
    // Phones: the rail runs down the left side. Wider: it runs across the top.
    <li className="flex min-w-0 gap-4 sm:flex-col sm:gap-3">
      {/* The rail: this station's marker and the segment to the next one. */}
      <div className="flex flex-col items-center sm:flex-row" aria-hidden>
        <Icon className={cn('h-5 w-5 shrink-0', tone)} />
        {!isLast && (
          <span className="relative -mb-8 mt-2 w-px flex-1 overflow-hidden bg-border sm:mb-0 sm:ml-2 sm:mt-0 sm:h-px sm:w-auto">
            {running && <span className="overview-rail-pulse absolute inset-y-0 left-0 w-1/3" />}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pr-3">
        <h3 className="text-sm font-medium text-muted-foreground">{stage.name}</h3>
        <p className={cn('text-xs font-medium', tone)}>{STATE_LABEL[stage.state]}</p>
        <p className="mt-2 truncate text-3xl font-semibold tabular-nums tracking-tight" title={stage.value}>
          {stage.value}
        </p>
        <p className="line-clamp-2 text-sm text-muted-foreground" title={stage.unit}>{stage.unit}</p>
        {stage.detail.map((line) => (
          <p key={line} className="line-clamp-2 text-xs text-muted-foreground">{line}</p>
        ))}
        <div className="mt-auto pt-3">
          {/* A button where work waits, and on the first unfinished station (where to start). */}
          <ActionLink
            action={stage.action}
            can={can}
            primary={isNext || (stage.state !== 'done' && stage.state !== 'idle')}
          />
        </div>
      </div>
    </li>
  );
}

const LEVEL_STYLE: Record<AttentionItem['level'], StageState> = {
  attention: 'attention',
  waiting: 'waiting',
  idle: 'idle',
};

function Attention({ items, can }: { items: AttentionItem[]; can: Can }) {
  return (
    <section aria-labelledby="attention-heading" className="space-y-3">
      <h2 id="attention-heading" className="text-lg font-semibold">
        Needs attention
        {items.length > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">{items.length}</span>}
      </h2>
      {items.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
          Nothing needs you right now: every stage is up to date.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((item) => {
            const { icon: Icon, tone } = STATE_STYLE[LEVEL_STYLE[item.level]];
            return (
              <li key={item.key} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', tone)} aria-hidden />
                  <span className="sr-only">{STATE_LABEL[LEVEL_STYLE[item.level]]}:</span>
                  <p className="text-sm">{item.text}</p>
                </div>
                <div className="pl-7 sm:pl-0">
                  <ActionLink action={item.action} can={can} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function RailSkeleton() {
  return (
    <ol className="grid grid-cols-1 gap-x-2 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-32" />
        </li>
      ))}
    </ol>
  );
}

export default function ProjectOverview() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useProjectOverview(projectId);
  const permissions = useProjectPermissions(projectId);
  const can: Can = (p) => !permissions.isLoading && permissions.can(p);

  const base = `/projects/${projectId}`;
  const stages = useMemo(() => (data ? buildStages(data, base) : []), [data, base]);
  const attention = useMemo(() => (data ? buildAttention(data, base) : []), [data, base]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-6 sm:px-6">
      {/* One moving thing on the page: the active training segment. */}
      <style>{`
        .overview-rail-pulse { background: linear-gradient(90deg, transparent, var(--mtx-primary), transparent); }
        @media (prefers-reduced-motion: no-preference) {
          .overview-rail-pulse { animation: overview-rail 2.4s linear infinite; }
          @keyframes overview-rail { from { transform: translateX(-100%); } to { transform: translateX(300%); } }
        }
      `}</style>

      <PageHeader
        title="Overview"
        description={data ? healthSentence(data) : 'Where every stage of this project stands.'}
        actions={
          data && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Updated {ago(new Date(dataUpdatedAt).toISOString())}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh overview"
              >
                <RefreshCw className={cn('h-4 w-4', isFetching && 'motion-safe:animate-spin')} />
              </Button>
            </div>
          )
        }
      />

      <section aria-label="Pipeline">
        {isLoading ? (
          <RailSkeleton />
        ) : error ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <p className="text-destructive">
              Couldn't load the overview: {error instanceof Error ? error.message : 'unknown error'}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
          </div>
        ) : (
          <ol className="grid grid-cols-1 gap-x-2 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
            {stages.map((stage, i) => (
              <Station
                key={stage.key}
                stage={stage}
                isLast={i === stages.length - 1}
                isNext={i === stages.findIndex((s) => s.state !== 'done')}
                can={can}
              />
            ))}
          </ol>
        )}
      </section>

      {data && <Attention items={attention} can={can} />}
    </div>
  );
}
