// "/": every project the person can open, at a glance. What needs attention
// across projects, each project's pipeline as a mini rail (same states as its
// overview), what is training and what is in production.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, FolderPlus, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { ContinueCard } from '@/components/resume/ContinueCard';
import { ActionLink, type Can } from '@/components/overview/ActionLink';
import { STATE_STYLE } from '@/components/overview/stateStyle';
import {
  STATE_LABEL,
  ago,
  buildAttention,
  buildStages,
  type AttentionItem,
  type Stage,
} from '@/components/overview/pipeline';
import { useOrganizationHome } from '@/hooks/useProjectOverview';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { cn } from '@/lib/utils';
import type { OrganizationHome as Home, ProjectOverview } from '@/types/overview';

const n = (value: number) => value.toLocaleString();
const LEVEL_ORDER: Record<AttentionItem['level'], number> = { attention: 0, waiting: 1, idle: 2 };
const SHOWN_ATTENTION = 5;
const SEARCH_FROM = 8;

interface ProjectRow {
  overview: ProjectOverview;
  base: string;
  stages: Stage[];
  attention: AttentionItem[];
}

function summary(home: Home): string {
  const parts = [`${n(home.project_count)} project${home.project_count === 1 ? '' : 's'}`];
  parts.push(`${n(home.production.length)} model${home.production.length === 1 ? '' : 's'} in production`);
  const alerts = home.projects.reduce((sum, p) => sum + p.monitoring.open_alerts, 0);
  if (alerts) parts.push(`${n(alerts)} open alert${alerts === 1 ? '' : 's'}`);
  if (home.running.length) parts.push(`${n(home.running.length)} training run${home.running.length === 1 ? '' : 's'} active`);
  return parts.join(', ') + '.';
}

function fleetLine(f: Home['fleet']): string {
  const parts = [`${n(f.online)} online`];
  if (f.stale) parts.push(`${n(f.stale)} missed heartbeats`);
  if (f.offline) parts.push(`${n(f.offline)} offline`);
  if (f.pending) parts.push(`${n(f.pending)} waiting to enroll`);
  return `${n(f.total)} device${f.total === 1 ? '' : 's'}: ${parts.join(', ')}`;
}

function oneLine(o: ProjectOverview): string {
  const prod = o.deployment.production[0];
  const run = o.training.running > 0 ? o.training.latest : null;
  const model = prod
    ? `${prod.version_name} in production`
    : run ? `training ${run.model_name} ${run.version_name}`
    : o.models.trained_versions ? 'nothing deployed' : o.models.count ? 'not trained yet' : 'no models yet';
  return `${n(o.data.total_images)} image${o.data.total_images === 1 ? '' : 's'}, ${model}`;
}

function MiniRail({ stages }: { stages: Stage[] }) {
  return (
    <ol className="flex items-center" aria-label="Pipeline">
      {stages.map((stage, i) => {
        const { icon: Icon, tone } = STATE_STYLE[stage.state];
        const amount = stage.value === '—' ? stage.unit : `${stage.value} ${stage.unit}`;
        const text = `${stage.name}: ${STATE_LABEL[stage.state]}, ${amount}`;
        return (
          <li key={stage.key} className="flex items-center">
            <span title={text} className="flex">
              <Icon className={cn('h-4 w-4', tone)} aria-hidden />
              <span className="sr-only">{text}</span>
            </span>
            {i < stages.length - 1 && <span className="mx-0.5 h-px w-2.5 bg-border" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-24 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    </div>
  );
}

export default function OrganizationHome() {
  const { data, isLoading, error, refetch } = useOrganizationHome();
  const { hasAdminPermission } = useCurrentOrganization();
  // Org admins hold every project permission; others get links to look, and
  // each project's own pages offer what their role allows.
  const can: Can = () => hasAdminPermission;
  const [showAllAttention, setShowAllAttention] = useState(false);
  const [query, setQuery] = useState('');

  const rows = useMemo<ProjectRow[]>(() => {
    if (!data) return [];
    const list = data.projects.map((overview) => {
      const base = `/projects/${overview.project.project_id}`;
      return { overview, base, stages: buildStages(overview, base), attention: buildAttention(overview, base) };
    });
    // Projects with something red first; otherwise most recently active (server order).
    const red = (r: ProjectRow) => (r.stages.some((s) => s.state === 'attention') ? 0 : 1);
    return list.map((r, i) => ({ r, i })).sort((a, b) => red(a.r) - red(b.r) || a.i - b.i).map(({ r }) => r);
  }, [data]);

  const attention = useMemo(
    () =>
      rows
        .flatMap((row, rank) => row.attention.map((item) => ({ item, row, rank })))
        .sort((a, b) => LEVEL_ORDER[a.item.level] - LEVEL_ORDER[b.item.level] || a.rank - b.rank),
    [rows],
  );

  const shownRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => r.overview.project.name.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  return (
    // Full width like the other pages (capped for very wide monitors).
    <div className="mx-auto w-full max-w-[1800px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title={data?.organization.name ?? 'Home'}
        description={data ? summary(data) : 'Every project you can open, at a glance.'}
      />

      <ContinueCard />

      {isLoading ? (
        <HomeSkeleton />
      ) : error ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">Couldn't load your projects: {error instanceof Error ? error.message : 'unknown error'}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : !data || data.project_count === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed px-6 py-14 text-center">
          <FolderPlus className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
          <h2 className="text-lg font-semibold">No projects yet</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            A project holds one computer vision task: its images, labels, datasets, models and deployments.
          </p>
          <Button asChild className="mt-4"><Link to="/projects/add">Create your first project</Link></Button>
        </div>
      ) : (
        // Wide screens: what needs work on the left, what runs on the right.
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 space-y-8">
          <section aria-labelledby="home-attention" className="space-y-3">
            <h2 id="home-attention" className="text-lg font-semibold">
              Needs attention
              {attention.length > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">{attention.length}</span>}
            </h2>
            {attention.length === 0 ? (
              <p className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                Nothing needs you right now in any project.
              </p>
            ) : (
              <>
                <ul className="divide-y rounded-lg border">
                  {(showAllAttention ? attention : attention.slice(0, SHOWN_ATTENTION)).map(({ item, row }) => {
                    const { icon: Icon, tone } = STATE_STYLE[item.level];
                    return (
                      <li key={`${row.base}-${item.key}`} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', tone)} aria-hidden />
                          <span className="sr-only">{STATE_LABEL[item.level]}:</span>
                          <div className="min-w-0">
                            <Link to={row.base} className="text-xs font-medium text-muted-foreground hover:underline">
                              {row.overview.project.name}
                            </Link>
                            <p className="text-sm">{item.text}</p>
                          </div>
                        </div>
                        <div className="pl-7 sm:pl-0"><ActionLink action={item.action} can={can} /></div>
                      </li>
                    );
                  })}
                </ul>
                {attention.length > SHOWN_ATTENTION && (
                  <Button variant="ghost" size="sm" onClick={() => setShowAllAttention((v) => !v)}>
                    {showAllAttention ? 'Show fewer' : `Show all (${attention.length})`}
                  </Button>
                )}
              </>
            )}
          </section>

          <section aria-labelledby="home-projects" className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="home-projects" className="text-lg font-semibold">Projects</h2>
              {rows.length > SEARCH_FROM && (
                <div className="relative w-full max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a project"
                         aria-label="Find a project" className="pl-9" />
                </div>
              )}
            </div>
            <ul className="divide-y rounded-lg border">
              {shownRows.map((row) => (
                <li key={row.base}>
                  <Link
                    to={row.base}
                    className="flex flex-col gap-2 px-4 py-3 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none md:flex-row md:items-center md:gap-6"
                  >
                    <span className="min-w-0 font-medium md:w-56 md:shrink-0 md:truncate">{row.overview.project.name}</span>
                    <MiniRail stages={row.stages} />
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{oneLine(row.overview)}</span>
                    {row.overview.project.last_activity_at && (
                      <span className="shrink-0 text-xs text-muted-foreground">{ago(row.overview.project.last_activity_at)}</span>
                    )}
                  </Link>
                </li>
              ))}
              {shownRows.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">No project matches "{query.trim()}".</li>
              )}
            </ul>
            <p className="text-xs text-muted-foreground">
              Data → annotate → review → dataset → train → evaluate → deploy → monitor. Hover a mark for details.
              {data.project_count > data.project_limit && (
                <> Showing the {data.project_limit} most recently active of {n(data.project_count)} projects.{' '}
                  <Link to="/projects" className="underline">All projects</Link></>
              )}
            </p>
          </section>
          </div>

          {/* Side column on wide screens; two columns, then one, below that. */}
          <aside className="grid content-start gap-8 md:grid-cols-2 xl:grid-cols-1">
            <section aria-labelledby="home-running" className="space-y-3">
              <h2 id="home-running" className="text-lg font-semibold">Running now</h2>
              {data.running.length === 0 ? (
                <p className="text-sm text-muted-foreground">No training runs right now.</p>
              ) : (
                <ul className="space-y-3">
                  {data.running.map((s) => (
                    <li key={s.id}>
                      <Link to={`/projects/${s.project_id}/sessions/${s.id}`} className="block rounded-lg border px-4 py-3 hover:bg-muted/50">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="truncate text-sm font-medium">{s.model_name} {s.version_name}</span>
                          <span className="shrink-0 text-sm tabular-nums">{Math.round(s.progress)}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                          <div className="h-full rounded-full bg-[var(--mtx-primary)]" style={{ width: `${Math.min(100, Math.max(0, s.progress))}%` }} />
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {s.project_name} · epoch {s.current_epoch} of {s.total_epochs}
                          {s.eta_seconds != null && ` · about ${Math.max(1, Math.round(s.eta_seconds / 60))} min left`}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="home-production" className="space-y-3">
              <h2 id="home-production" className="text-lg font-semibold">In production</h2>
              {data.production.length === 0 ? (
                <p className="text-sm text-muted-foreground">No model is in production yet.</p>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {data.production.map((d) => (
                    <li key={`${d.project_id}-${d.version_id}`}>
                      <Link to={`/projects/${d.project_id}/models/${d.model_id}?tab=deployment`}
                            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{d.model_name} {d.version_name}</p>
                          <p className="truncate text-xs text-muted-foreground">{d.project_name}</p>
                        </div>
                        <div className="shrink-0 text-right text-xs text-muted-foreground">
                          {d.metric_value != null && <p className="tabular-nums">{d.metric_name} {d.metric_value.toFixed(2)}</p>}
                          {d.deployed_at && <p>since {new Date(d.deployed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="home-fleet" className="space-y-3">
              <h2 id="home-fleet" className="text-lg font-semibold">Edge fleet</h2>
              <Link to="/fleet" className="block rounded-lg border px-4 py-3 hover:bg-muted/50">
                {data.fleet.total === 0 ? (
                  <p className="text-sm text-muted-foreground">No edge devices yet. Add one to run models at your sites.</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">{fleetLine(data.fleet)}</p>
                    {data.fleet.offline + data.fleet.stale > 0 && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden />
                        {n(data.fleet.offline + data.fleet.stale)} not checking in
                      </p>
                    )}
                  </>
                )}
              </Link>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
