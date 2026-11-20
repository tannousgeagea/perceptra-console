// /projects/:projectId/models/:modelId/versions/:versionId
// One version: what it scored, what it trained on and how, the versions it
// came from and led to, and where it has been deployed.
import { type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, GitCompare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/ui/button';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { cn } from '@/lib/utils';
import { useModelDetail } from '@/hooks/useModels';
import { useVersionLineage } from '@/hooks/useVersionLineage';
import {
  asNumber,
  fmtDate,
  fmtDateTime,
  fmtDuration,
  fmtMetric,
  fmtSetting,
  keyLabel,
} from '@/components/lineage/format';
import type { DatasetSummary, LineageVersionRef, VersionLineage } from '@/types/lineage';

const STATUS_TONE: Record<string, string> = {
  trained: 'text-emerald-700 dark:text-emerald-400',
  training: 'text-[var(--mtx-primary)] dark:text-violet-400',
  queued: 'text-amber-700 dark:text-amber-400',
  failed: 'text-rose-700 dark:text-rose-400',
};

const DEPLOY_LABEL: Record<string, string> = {
  production: 'In production',
  staging: 'In staging',
  retired: 'Retired',
};

function Section({ id, title, children, aside }: { id: string; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={id} className="text-lg font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

const linkCls =
  'font-medium text-[var(--mtx-primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm dark:text-violet-400';

/** Parent -> this -> versions trained from it, as one line. */
function LineageRail({ l, base }: { l: VersionLineage; base: string }) {
  type Node = { ref: LineageVersionRef; role: string; current?: boolean };
  const nodes: Node[] = [
    ...(l.parent ? [{ ref: l.parent, role: 'Fine-tuned from' }] : []),
    { ref: l.version, role: l.parent ? 'This version' : 'This version, trained from scratch', current: true },
    ...l.children.map((c) => ({ ref: c, role: 'Fine-tuned into' })),
  ];
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-0">
      {nodes.map((n, i) => (
        <li key={n.ref.version_id} className="flex items-center gap-0 sm:min-w-0">
          {i > 0 && <span aria-hidden className="mx-3 hidden h-px w-8 bg-border sm:block" />}
          <div
            className={cn(
              'min-w-[10rem] rounded-lg border px-4 py-3',
              n.current ? 'border-[var(--mtx-primary)] bg-violet-50 dark:border-violet-400 dark:bg-violet-950/40' : 'bg-background',
            )}
            aria-current={n.current ? 'page' : undefined}
          >
            <p className="text-xs text-muted-foreground">{n.role}</p>
            {n.current ? (
              <p className="mt-0.5 text-lg font-semibold">{n.ref.label}</p>
            ) : (
              <Link to={`${base}/versions/${encodeURIComponent(n.ref.version_id)}`} className={cn(linkCls, 'mt-0.5 inline-block text-lg')}>
                {n.ref.label}
              </Link>
            )}
            <p className={cn('text-xs', STATUS_TONE[n.ref.status] ?? 'text-muted-foreground')}>
              {DEPLOY_LABEL[n.ref.deployment_status] ?? n.ref.status}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function SplitBar({ ds }: { ds: DatasetSummary }) {
  const total = ds.train_count + ds.val_count + ds.test_count;
  if (!total) return null;
  const parts = [
    { label: 'Train', n: ds.train_count, cls: 'bg-[var(--mtx-primary)] dark:bg-violet-400' },
    { label: 'Val', n: ds.val_count, cls: 'bg-violet-300 dark:bg-violet-700' },
    { label: 'Test', n: ds.test_count, cls: 'bg-muted-foreground/30' },
  ];
  return (
    <div className="space-y-2">
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden>
        {parts.filter((p) => p.n).map((p) => (
          <div key={p.label} className={p.cls} style={{ width: `${(p.n / total) * 100}%` }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span aria-hidden className={cn('h-2 w-2 rounded-full', p.cls)} />
            {p.label} <span className="tabular-nums text-foreground">{p.n.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClassBalance({ ds }: { ds: DatasetSummary }) {
  if (!ds.classes.length) return <p className="text-sm text-muted-foreground">No labelled objects on these images.</p>;
  const max = ds.classes[0].count || 1;
  const total = ds.classes.reduce((s, c) => s + c.count, 0);
  const shown = ds.classes.slice(0, 8);
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Objects per class, as the images are labelled today</p>
      <ul className="space-y-1.5">
        {shown.map((c) => (
          <li key={c.name} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3 text-sm">
            <span className="truncate" title={c.name}>{c.name}</span>
            <span className="h-1.5 rounded-full bg-[var(--mtx-primary)] dark:bg-violet-400" style={{ width: `${Math.max(2, (c.count / max) * 100)}%` }} aria-hidden />
            <span className="tabular-nums text-muted-foreground">
              {c.count.toLocaleString()} <span className="text-xs">({Math.round((c.count / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
      {ds.classes.length > shown.length && (
        <p className="text-xs text-muted-foreground">and {ds.classes.length - shown.length} more classes</p>
      )}
    </div>
  );
}

function MetricsGrid({ metrics }: { metrics: Record<string, unknown> }) {
  const entries = Object.entries(metrics)
    .map(([k, v]) => [k, asNumber(v)] as const)
    .filter((e): e is readonly [string, number] => e[1] != null)
    .sort(([a], [b]) => Number(/epoch|learning_rate/.test(a)) - Number(/epoch|learning_rate/.test(b)));
  if (!entries.length) {
    return <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">No metrics recorded. They are saved when training finishes.</p>;
  }
  return (
    // Cells draw their own right and bottom rules; the -m-px hides the outer ones
    // under the frame, so an unfilled last row leaves no grey gap.
    <div className="overflow-hidden rounded-lg border">
    <dl className="-mb-px -mr-px grid grid-cols-2 sm:grid-cols-4">
      {entries.map(([k, v]) => (
        <div key={k} className="border-b border-r px-4 py-3">
          <dt className="text-xs text-muted-foreground">{keyLabel(k)}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{fmtMetric(k, v)}</dd>
        </div>
      ))}
    </dl>
    </div>
  );
}

export default function ModelVersionDetail() {
  const { projectId, modelId, versionId } = useParams<{ projectId: string; modelId: string; versionId: string }>();
  const { data: model } = useModelDetail(modelId!);
  const { data: l, isLoading, error, refetch } = useVersionLineage(modelId, versionId);
  const base = `/projects/${projectId}/models/${modelId}`;
  const compare = (a: string, b: string) => `${base}/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`;

  const v = l?.version;
  const settings = v ? Object.entries({ ...v.config, ...(v.model_size ? { model_size: v.model_size } : {}) }) : [];

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link to={`/projects/${projectId}/models`} className="hover:text-foreground">Models</Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <Link to={`${base}?tab=versions`} className="truncate hover:text-foreground">{model?.name ?? 'Model'}</Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="text-foreground">{v?.label ?? 'Version'}</span>
      </nav>

      {isLoading ? (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error || !l || !v ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">Couldn't load this version: {error instanceof Error ? error.message : 'unknown error'}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : (
        <>
          <PageHeader
            title={
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {v.label}
                <span className={cn('text-sm font-medium', STATUS_TONE[v.status] ?? 'text-muted-foreground')}>
                  {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                </span>
                {DEPLOY_LABEL[v.deployment_status] && (
                  <span className="text-sm font-medium text-muted-foreground">{DEPLOY_LABEL[v.deployment_status]}</span>
                )}
              </span>
            }
            description={
              <>
                {l.dataset ? `Trained on dataset ${l.dataset.label} (${l.dataset.total_images.toLocaleString()} images)` : 'Dataset not recorded'}
                {v.created_by ? `, started by ${v.created_by}` : ''} on {fmtDate(v.created_at)}.
              </>
            }
            actions={
              <div className="flex flex-wrap items-center gap-2">
                {l.production && l.production.version_id !== v.version_id && (
                  <Button asChild size="sm">
                    <Link to={compare(l.production.version_id, v.version_id)}>
                      <GitCompare className="mr-2 h-4 w-4" aria-hidden />
                      Compare with production {l.production.label}
                    </Link>
                  </Button>
                )}
                {l.previous && l.previous.version_id !== l.production?.version_id && (
                  <Button asChild size="sm" variant="outline">
                    <Link to={compare(l.previous.version_id, v.version_id)}>Compare with {l.previous.label}</Link>
                  </Button>
                )}
                <div className="flex items-center">
                  <Button asChild={!!l.previous} size="icon" variant="ghost" className="h-8 w-8" disabled={!l.previous} aria-label={l.previous ? `Previous version, ${l.previous.label}` : 'No previous version'}>
                    {l.previous ? (
                      <Link to={`${base}/versions/${encodeURIComponent(l.previous.version_id)}`}><ChevronLeft className="h-4 w-4" /></Link>
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button asChild={!!l.next} size="icon" variant="ghost" className="h-8 w-8" disabled={!l.next} aria-label={l.next ? `Next version, ${l.next.label}` : 'No newer version'}>
                    {l.next ? (
                      <Link to={`${base}/versions/${encodeURIComponent(l.next.version_id)}`}><ChevronRight className="h-4 w-4" /></Link>
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            }
          />

          {v.status === 'failed' && v.error_message && (
            <div className="flex gap-3 rounded-lg border border-rose-300/60 bg-rose-50 p-4 text-sm dark:border-rose-900 dark:bg-rose-950/30">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden />
              <div className="min-w-0">
                <p className="font-medium text-rose-800 dark:text-rose-300">Training failed</p>
                <p className="mt-1 line-clamp-4 break-words text-rose-700 dark:text-rose-400">{v.error_message}</p>
              </div>
            </div>
          )}

          <Section id="ver-lineage" title="Lineage">
            <LineageRail l={l} base={base} />
          </Section>

          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="min-w-0 space-y-10">
              <Section id="ver-metrics" title="Metrics">
                <MetricsGrid metrics={v.metrics} />
              </Section>

              <Section id="ver-settings" title="Settings">
                {settings.length ? (
                  <dl className="divide-y rounded-lg border">
                    {settings.map(([k, val]) => (
                      <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-4 px-4 py-2.5 text-sm">
                        <dt className="text-muted-foreground">{keyLabel(k)}</dt>
                        <dd className="font-medium tabular-nums">{fmtSetting(val)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">No settings recorded.</p>
                )}
              </Section>
            </div>

            <aside className="min-w-0 space-y-10">
              <Section
                id="ver-data"
                title="Trained on"
                aside={l.dataset && <Link to={`/projects/${projectId}/versions`} className={cn(linkCls, 'text-sm')}>Dataset versions</Link>}
              >
                {l.dataset ? (
                  <div className="space-y-5 rounded-lg border p-4">
                    <p className="text-sm">
                      Dataset <span className="font-medium">{l.dataset.label}</span>, created {fmtDate(l.dataset.created_at)}:{' '}
                      <span className="tabular-nums">{l.dataset.total_images.toLocaleString()}</span> images
                    </p>
                    <SplitBar ds={l.dataset} />
                    <ClassBalance ds={l.dataset} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">This version doesn't record its dataset version.</p>
                )}
              </Section>

              <Section
                id="ver-run"
                title="Training run"
                aside={l.training && <Link to={`/projects/${projectId}/sessions/${l.training.id}`} className={cn(linkCls, 'text-sm')}>Open run</Link>}
              >
                {l.training ? (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg border p-4 text-sm">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="capitalize">{l.training.status}</dd>
                    <dt className="text-muted-foreground">Started by</dt>
                    <dd className="truncate">{l.training.started_by ?? '—'}</dd>
                    <dt className="text-muted-foreground">Started</dt>
                    <dd>{fmtDateTime(l.training.started_at)}</dd>
                    <dt className="text-muted-foreground">Took</dt>
                    <dd className="tabular-nums">{fmtDuration(l.training.duration_seconds)}</dd>
                    <dt className="text-muted-foreground">Epochs</dt>
                    <dd className="tabular-nums">{l.training.epochs_run ?? '—'}{l.training.total_epochs ? ` of ${l.training.total_epochs}` : ''}</dd>
                    {l.training.compute_resource && (
                      <>
                        <dt className="text-muted-foreground">Ran on</dt>
                        <dd className="truncate">{l.training.compute_resource}</dd>
                      </>
                    )}
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">No training run recorded for this version.</p>
                )}
              </Section>

              <Section id="ver-deploy" title="Deployments">
                {l.deployments.length ? (
                  <ul className="divide-y rounded-lg border">
                    {l.deployments.map((d) => (
                      <li key={`${d.target_env}-${d.deployed_at}`} className="px-4 py-2.5 text-sm">
                        <p className="font-medium capitalize">
                          {d.target_env}
                          {d.is_active && <span className="ml-2 text-xs font-medium normal-case text-emerald-700 dark:text-emerald-400">active</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fmtDateTime(d.deployed_at)} to {d.undeployed_at ? fmtDateTime(d.undeployed_at) : 'now'}
                          {d.deployed_by ? `, by ${d.deployed_by}` : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Never deployed.</p>
                )}
              </Section>

              {v.tags.length > 0 && (
                <Section id="ver-tags" title="Tags">
                  <ul className="flex flex-wrap gap-1.5">
                    {v.tags.map((t) => (
                      <li key={t} className="rounded-md border px-2 py-0.5 text-xs">{t}</li>
                    ))}
                  </ul>
                </Section>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
