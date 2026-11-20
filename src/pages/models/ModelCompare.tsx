// /projects/:projectId/models/:modelId/compare?a=<version>&b=<version>
// What changed from version A (the reference, usually production) to version B
// (the candidate): metrics, the data it trained on, its settings and its run.
import { useMemo, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowLeftRight, ArrowUp, ChevronRight, Minus, Rocket } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/ui/button';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { cn } from '@/lib/utils';
import { useModelDetail } from '@/hooks/useModels';
import { useProjectPermissions } from '@/hooks/usePermissions';
import { useVersionComparison } from '@/hooks/useVersionLineage';
import {
  comparisonSentence,
  fmtDelta,
  fmtDuration,
  fmtMetric,
  fmtSetting,
  headlineMetric,
  isRatioMetric,
  keyLabel,
} from '@/components/lineage/format';
import type { MetricChange, MetricVerdict, TrainingSummary, VersionComparison } from '@/types/lineage';
import type { ModelVersion } from '@/types/models';

const VERDICT: Record<MetricVerdict, { icon: typeof ArrowUp; text: string; tone: string; line: string }> = {
  improved: { icon: ArrowUp, text: 'Better', tone: 'text-emerald-700 dark:text-emerald-400', line: 'bg-emerald-500' },
  worse: { icon: ArrowDown, text: 'Worse', tone: 'text-rose-700 dark:text-rose-400', line: 'bg-rose-500' },
  same: { icon: Minus, text: 'Same', tone: 'text-muted-foreground', line: 'bg-muted-foreground/40' },
};

const versionLabel = (v: ModelVersion) => v.version_name || `v${v.version_number}`;

/** Hollow marker = A (reference), filled = B (candidate); used in headers and the bars. */
const MarkA = ({ className }: { className?: string }) => (
  <span aria-hidden className={cn('inline-block h-2.5 w-2.5 shrink-0 rounded-full border-2 border-muted-foreground bg-background', className)} />
);
const MarkB = ({ className }: { className?: string }) => (
  <span aria-hidden className={cn('inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--mtx-primary)] dark:bg-violet-400', className)} />
);

function MetricsTable({ c }: { c: VersionComparison }) {
  if (!c.metrics.length) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
        Neither version has recorded metrics. Metrics are saved when training finishes.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">Metric</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              <span className="inline-flex items-center gap-1.5"><MarkA />{c.a.label}</span>
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              <span className="inline-flex items-center gap-1.5"><MarkB />{c.b.label}</span>
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Change</th>
            <th scope="col" className="hidden w-[30%] px-4 py-2.5 font-medium lg:table-cell">
              <span className="sr-only">On a 0–100% scale</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {c.metrics.map((m) => {
            const ratio = isRatioMetric(m.key, m.a, m.b);
            const v = m.verdict ? VERDICT[m.verdict] : null;
            // The arrow shows which way the number moved; the colour says whether that is good.
            const Icon = m.delta == null || m.verdict === 'same' ? v?.icon : m.delta > 0 ? ArrowUp : ArrowDown;
            return (
              <tr key={m.key} className={cn(m.better == null && 'text-muted-foreground')}>
                <th scope="row" className="px-4 py-2.5 text-left font-medium">
                  {keyLabel(m.key)}
                  {m.better === 'lower' && <span className="ml-1.5 text-xs font-normal text-muted-foreground">lower is better</span>}
                </th>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmtMetric(m.key, m.a, ratio)}</td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums">{fmtMetric(m.key, m.b, ratio)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
                  {v && Icon ? (
                    <span className={cn('inline-flex items-center gap-1 font-medium', v.tone)}>
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {m.verdict === 'same' ? v.text : fmtDelta(m.key, m.delta, ratio)}
                      <span className="sr-only">({v.text})</span>
                    </span>
                  ) : m.a == null || m.b == null ? (
                    <span className="text-xs">only in {m.a == null ? c.b.label : c.a.label}</span>
                  ) : (
                    fmtDelta(m.key, m.delta, ratio)
                  )}
                </td>
                <td className="hidden px-4 py-2.5 lg:table-cell">{ratio && <MetricBar m={m} />}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** A 0–100% track with A and B placed on it and the move between them, coloured by verdict. */
function MetricBar({ m }: { m: MetricChange }) {
  if (m.a == null || m.b == null) return null;
  const pa = Math.max(0, Math.min(100, m.a * 100));
  const pb = Math.max(0, Math.min(100, m.b * 100));
  const tone = m.verdict ? VERDICT[m.verdict].line : 'bg-muted-foreground/40';
  return (
    <div className="relative h-3 w-full" aria-hidden>
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      <div
        className={cn('absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full', tone)}
        style={{ left: `${Math.min(pa, pb)}%`, width: `${Math.abs(pb - pa)}%` }}
      />
      <span className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2" style={{ left: `${pa}%` }}><MarkA /></span>
      <span className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2" style={{ left: `${pb}%` }}><MarkB /></span>
    </div>
  );
}

function DataSection({ c }: { c: VersionComparison }) {
  const d = c.data;
  if (!d.a || !d.b) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
        {!d.a && !d.b ? 'Neither version records' : `${!d.a ? c.a.label : c.b.label} doesn't record`} the dataset version it trained on.
      </p>
    );
  }
  const figures = [
    { value: `+${d.only_b.toLocaleString()}`, label: `images only in ${c.b.label}'s data` },
    { value: `−${d.only_a.toLocaleString()}`, label: `images only in ${c.a.label}'s data` },
    { value: d.shared.toLocaleString(), label: 'images in both' },
    { value: d.moved_split.toLocaleString(), label: 'shared images in a different split' },
  ];
  return (
    <div className="space-y-4">
      {d.same_dataset ? (
        <p className="text-sm">
          Both trained on dataset <DatasetLink c={c} which="b" />: {d.b.total_images.toLocaleString()} images
          ({d.b.train_count} train, {d.b.val_count} val, {d.b.test_count} test).
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {c.a.label} trained on dataset <DatasetLink c={c} which="a" />, {c.b.label} on dataset <DatasetLink c={c} which="b" />.
          </p>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
            {figures.map((f) => (
              <div key={f.label} className="bg-background px-4 py-3">
                <dt className="text-xs text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{f.value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {d.classes.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <caption className="px-4 pt-3 text-left text-xs text-muted-foreground">
              Objects per class, counted from each dataset's images as they are labelled today.
            </caption>
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Class</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  <span className="inline-flex items-center gap-1.5"><MarkA />{c.a.label}</span>
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  <span className="inline-flex items-center gap-1.5"><MarkB />{c.b.label}</span>
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Change</th>
                {!d.same_dataset && <th scope="col" className="px-4 py-2.5 text-right font-medium">On new images</th>}
                <th scope="col" className="hidden w-[24%] px-4 py-2.5 font-medium md:table-cell">
                  <span className="sr-only">Share of objects</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {d.classes.map((k) => (
                <ClassRow key={k.name} k={k} c={c} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ClassRow({ k, c }: { k: VersionComparison['data']['classes'][number]; c: VersionComparison }) {
  const totalA = c.data.classes.reduce((s, x) => s + x.a, 0) || 1;
  const totalB = c.data.classes.reduce((s, x) => s + x.b, 0) || 1;
  const shareA = (k.a / totalA) * 100;
  const shareB = (k.b / totalB) * 100;
  return (
    <tr>
      <th scope="row" className="px-4 py-2.5 text-left font-medium">{k.name}</th>
      <td className="px-4 py-2.5 text-right tabular-nums">{k.a.toLocaleString()}</td>
      <td className="px-4 py-2.5 text-right font-medium tabular-nums">{k.b.toLocaleString()}</td>
      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
        {k.delta === 0 ? '—' : `${k.delta > 0 ? '+' : '−'}${Math.abs(k.delta).toLocaleString()}`}
      </td>
      {!c.data.same_dataset && (
        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{k.in_added_images ? k.in_added_images.toLocaleString() : '—'}</td>
      )}
      <td className="hidden px-4 py-2.5 md:table-cell">
        {/* Share of all objects: A's bar above, B's below. */}
        <div className="space-y-1" title={`${shareA.toFixed(0)}% of ${c.a.label}'s objects, ${shareB.toFixed(0)}% of ${c.b.label}'s`}>
          <div className="h-1.5 rounded-full bg-muted-foreground/30" style={{ width: `${Math.max(shareA, k.a ? 2 : 0)}%` }} />
          <div className="h-1.5 rounded-full bg-[var(--mtx-primary)] dark:bg-violet-400" style={{ width: `${Math.max(shareB, k.b ? 2 : 0)}%` }} />
        </div>
      </td>
    </tr>
  );
}

function DatasetLink({ c, which }: { c: VersionComparison; which: 'a' | 'b' }) {
  const { projectId } = useParams<{ projectId: string }>();
  const ds = c.data[which];
  if (!ds) return null;
  return (
    <Link to={`/projects/${projectId}/versions`} className="font-medium text-[var(--mtx-primary)] underline-offset-4 hover:underline dark:text-violet-400">
      {ds.label}
    </Link>
  );
}

function SettingsSection({ c }: { c: VersionComparison }) {
  return (
    <div className="space-y-3">
      {c.settings_changed.length === 0 ? (
        <p className="text-sm text-muted-foreground">Same settings ({c.settings_identical} compared).</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {c.settings_changed.map((s) => (
            <li key={s.key} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5 text-sm">
              <span className="font-medium">{keyLabel(s.key)}</span>
              <span className="tabular-nums">
                <span className="text-muted-foreground">{fmtSetting(s.a)}</span>
                <span className="mx-1.5 text-muted-foreground" aria-hidden>→</span>
                <span className="sr-only"> changed to </span>
                <span className="font-medium">{fmtSetting(s.b)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {c.settings_changed.length > 0 && c.settings_identical > 0 && (
        <p className="text-xs text-muted-foreground">
          {c.settings_identical} other setting{c.settings_identical === 1 ? ' is' : 's are'} identical.
        </p>
      )}
    </div>
  );
}

function RunColumn({ label, run, mark }: { label: string; run: TrainingSummary | null; mark: ReactNode }) {
  const { projectId } = useParams<{ projectId: string }>();
  return (
    <div className="space-y-2 px-4 py-3">
      <h3 className="flex items-center gap-1.5 text-sm font-medium">{mark}{label}</h3>
      {run ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Took</dt>
          <dd className="tabular-nums">{fmtDuration(run.duration_seconds)}</dd>
          <dt className="text-muted-foreground">Epochs</dt>
          <dd className="tabular-nums">{run.epochs_run ?? '—'}{run.total_epochs ? ` of ${run.total_epochs}` : ''}</dd>
          <dt className="text-muted-foreground">Started by</dt>
          <dd className="truncate">{run.started_by ?? '—'}</dd>
          <dd className="col-span-2 pt-1">
            <Link to={`/projects/${projectId}/sessions/${run.id}`} className="text-sm font-medium text-[var(--mtx-primary)] underline-offset-4 hover:underline dark:text-violet-400">
              Open run
            </Link>
          </dd>
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">No training run recorded.</p>
      )}
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function ModelCompare() {
  const { projectId, modelId } = useParams<{ projectId: string; modelId: string }>();
  const [params, setParams] = useSearchParams();
  const { data: model } = useModelDetail(modelId!);
  const permissions = useProjectPermissions(projectId);

  const versions = useMemo(
    () => [...(model?.versions ?? [])].sort((x, y) => y.version_number - x.version_number),
    [model],
  );
  // Defaults: B = newest trained version, A = production (or the one before B).
  const b = params.get('b') ?? versions.find((v) => v.status === 'trained')?.id ?? versions[0]?.id ?? null;
  const a =
    params.get('a') ??
    (model?.production_version && model.production_version.id !== b ? model.production_version.id : null) ??
    versions.find((v) => v.id !== b && v.version_number < (versions.find((x) => x.id === b)?.version_number ?? Infinity))?.id ??
    null;

  const { data: c, isLoading, error, refetch } = useVersionComparison(modelId, a, b);

  const setPair = (nextA: string | null, nextB: string | null) =>
    setParams(() => {
      const next = new URLSearchParams();
      if (nextA) next.set('a', nextA);
      if (nextB) next.set('b', nextB);
      return next;
    }, { replace: true });

  const head = c ? headlineMetric(c.metrics) : undefined;
  const canPromote =
    // Only when B beats what is actually serving (or nothing is serving yet).
    !!c && head?.verdict === 'improved' && c.b.status === 'trained' && c.b.deployment_status !== 'production' &&
    (c.production_version_id == null || c.production_version_id === c.a.version_id) &&
    !permissions.isLoading && permissions.can('manage');

  const base = `/projects/${projectId}/models/${modelId}`;

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link to={`/projects/${projectId}/models`} className="hover:text-foreground">Models</Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <Link to={`${base}?tab=versions`} className="truncate hover:text-foreground">{model?.name ?? 'Model'}</Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="text-foreground">Compare</span>
      </nav>

      <PageHeader
        title={c ? `${c.a.label} → ${c.b.label}` : 'Compare versions'}
        description={c ? comparisonSentence(c) : 'What changed between two versions of this model: metrics, data and settings.'}
        actions={
          canPromote && (
            <Button asChild size="sm">
              <Link to={`${base}?tab=deployment`}>
                <Rocket className="mr-2 h-4 w-4" aria-hidden />
                Promote {c!.b.label}
              </Link>
            </Button>
          )
        }
      >
        {versions.length > 0 && (
          <div className="flex flex-wrap items-end gap-3">
            <VersionPicker label="Reference" mark={<MarkA />} value={a} versions={versions} onChange={(v) => setPair(v, b)} production={model?.production_version?.id} />
            <Button
              variant="ghost"
              size="icon"
              className="mb-0.5 h-9 w-9"
              onClick={() => setPair(b, a)}
              disabled={!a || !b}
              aria-label="Swap the two versions"
              title="Swap"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <VersionPicker label="Candidate" mark={<MarkB />} value={b} versions={versions} onChange={(v) => setPair(a, v)} production={model?.production_version?.id} />
          </div>
        )}
      </PageHeader>

      {!a || !b ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          {versions.length < 2 ? 'This model needs at least two versions to compare.' : 'Pick a reference and a candidate version.'}
        </p>
      ) : isLoading ? (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error || !c ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">Couldn't compare these versions: {error instanceof Error ? error.message : 'unknown error'}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : (
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="min-w-0 space-y-10">
            <Section id="cmp-metrics" title="Metrics">
              <MetricsTable c={c} />
            </Section>
            <Section id="cmp-data" title="Training data">
              <DataSection c={c} />
            </Section>
          </div>
          <aside className="min-w-0 space-y-10">
            <Section id="cmp-settings" title="Settings">
              <SettingsSection c={c} />
            </Section>
            <Section id="cmp-runs" title="Training runs">
              <div className="grid divide-y rounded-lg border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
                <RunColumn label={c.a.label} run={c.a_training} mark={<MarkA />} />
                <RunColumn label={c.b.label} run={c.b_training} mark={<MarkB />} />
              </div>
            </Section>
            <p className="text-sm">
              <Link to={`${base}/versions/${encodeURIComponent(c.b.version_id)}`} className="font-medium text-[var(--mtx-primary)] underline-offset-4 hover:underline dark:text-violet-400">
                Where {c.b.label} came from
              </Link>
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function VersionPicker({
  label, mark, value, versions, onChange, production,
}: {
  label: string;
  mark: ReactNode;
  value: string | null;
  versions: ModelVersion[];
  onChange: (id: string) => void;
  production?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">{mark}{label}</span>
      <Select value={value ?? undefined} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-48" aria-label={`${label} version`}>
          <SelectValue placeholder="Pick a version" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((v) => (
            <SelectItem key={v.id} value={v.id}>
              {versionLabel(v)}
              <span className="ml-2 text-xs text-muted-foreground">
                {v.id === production ? 'production' : v.status}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
