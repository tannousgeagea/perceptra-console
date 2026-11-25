// Each place (a site, or a device without one) against its own baseline: the
// first days of the version it runs now. One line per signal in words, and a
// small chart of daily mean confidence with the baseline drawn across it.
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Hourglass, MapPin, Router } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import type { FieldPlace, ModelField, Severity } from '@/types/fleet';
import { dateTime, plural } from '../format';
import { worst } from './fieldText';

const pct = (v: number | null | undefined, digits = 0) => (v == null ? '—' : `${(v * 100).toFixed(digits)} %`);
const conf = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(2));
// A change in whole units with its sign ("−26 %", "+24 points"); "no change" once it rounds to zero.
const change = (v: number | null | undefined, unit: string, falling = false) => {
  if (v == null) return '—';
  const n = Math.round(Math.abs(v * 100));
  if (n === 0) return 'no change';
  return `${(v > 0) !== falling ? '+' : '−'}${n} ${unit}`;
};

const TONE: Record<'critical' | 'warning', string> = {
  critical: 'text-rose-600 dark:text-rose-400',
  warning: 'text-amber-600 dark:text-amber-400',
};

function StatusMark({ place }: { place: FieldPlace }) {
  const w = worst(place);
  if (!place.baseline) {
    return <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Hourglass className="h-3.5 w-3.5" aria-hidden />Building a baseline</span>;
  }
  if (!w) {
    return <span className="inline-flex items-center gap-1.5 text-sm"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />Steady</span>;
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-medium', TONE[w])}>
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden />{w === 'critical' ? 'Drifting a lot' : 'Drifting'}
    </span>
  );
}

function Signal({ label, before, after, change, severity }: { label: string; before: string; after: string; change: string; severity: Severity }) {
  return (
    <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('tabular-nums', severity && TONE[severity])}>
        {before} → {after} <span className={cn('text-muted-foreground', severity && 'font-medium text-current')}>({change})</span>
      </dd>
    </div>
  );
}

function ClassMix({ place }: { place: FieldPlace }) {
  const base = place.baseline?.class_share ?? {};
  const rec = place.recent.class_share;
  const classes = [...new Set([...Object.keys(base), ...Object.keys(rec)])]
    .sort((a, b) => Math.abs((rec[b] ?? 0) - (base[b] ?? 0)) - Math.abs((rec[a] ?? 0) - (base[a] ?? 0)))
    .slice(0, 4);
  if (classes.length === 0) return null;
  return (
    <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 text-sm">
      <dt className="text-muted-foreground">Class mix</dt>
      <dd className={cn(place.signals.class_mix && TONE[place.signals.class_mix])}>
        {classes.map((c) => `${c} ${pct(base[c] ?? 0)} → ${pct(rec[c] ?? 0)}`).join(', ')}
      </dd>
    </div>
  );
}

function ConfidenceChart({ place }: { place: FieldPlace }) {
  const rows = place.daily.filter((d) => d.mean_confidence != null);
  if (rows.length < 2) return null;
  const base = place.baseline?.mean_confidence;
  return (
    <figure className="h-32 w-full" aria-label={`Daily mean confidence at ${place.site?.name ?? place.device?.name}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
          <XAxis dataKey="date" tickFormatter={(d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                 tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={{ stroke: 'hsl(var(--border))' }} minTickGap={24} />
          <YAxis width={36} domain={[0, 1]} ticks={[0, 0.5, 1]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
          {base != null && (
            <ReferenceLine y={base} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 3"
                           label={{ value: 'baseline', position: 'insideTopLeft', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          )}
          <Tooltip
            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
            contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12, color: 'hsl(var(--popover-foreground))' }}
            labelFormatter={(d: string) => new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            formatter={(v: number, _n, item) => [`${v.toFixed(2)} (${(item.payload as { inferences: number }).inferences.toLocaleString()} inferences)`, 'Mean confidence']}
          />
          <Line type="monotone" dataKey="mean_confidence" stroke="var(--fp-line)" strokeWidth={2} dot={rows.length <= 2 ? { r: 3 } : false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}

function PlaceRow({ place, field }: { place: FieldPlace; field: ModelField }) {
  const name = place.site?.name ?? place.device?.name ?? '—';
  const b = place.baseline;
  return (
    <li className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h4 className="flex min-w-0 items-center gap-1.5 font-medium">
            {place.kind === 'site' ? <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /> : <Router className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
            {place.device
              ? <Link to={`/fleet/devices/${place.device.device_id}`} className="truncate hover:underline">{name}</Link>
              : <span className="truncate">{name}</span>}
          </h4>
          <StatusMark place={place} />
        </div>
        <p className="text-xs text-muted-foreground">
          {place.version ? `${place.version.version_name}, ` : ''}
          {plural(place.recent.inferences, 'inference')} in the last {field.recent_hours} h
          {place.kind === 'site' && `, ${place.devices.length === 1 ? place.devices[0] : plural(place.devices.length, 'device')}`}
        </p>
        {b ? (
          <dl className="space-y-1.5">
            <Signal label="Mean confidence" before={conf(b.mean_confidence)} after={conf(place.recent.mean_confidence)}
                    change={change(place.confidence_drop, '%', true)}
                    severity={place.signals.confidence} />
            <Signal label="Below 0.5" before={pct(b.low_confidence_share)} after={pct(place.recent.low_confidence_share)}
                    change={change(place.low_confidence_rise, 'points')}
                    severity={place.signals.low_confidence} />
            <ClassMix place={place} />
            <p className="pt-1 text-xs text-muted-foreground">
              Baseline: {place.version?.version_name ?? 'this version'}'s first {field.baseline_hours} h here ({dateTime(place.baseline_from)} to {dateTime(place.baseline_to)}).
            </p>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Compared once {place.version?.version_name ?? 'the version'} has run here for {field.baseline_hours} h plus a day,
            with at least {field.min_inferences.toLocaleString()} inferences in each.
            {place.recent.mean_confidence != null && ` Mean confidence now: ${conf(place.recent.mean_confidence)}.`}
          </p>
        )}
      </div>
      <ConfidenceChart place={place} />
    </li>
  );
}

export function FieldPlaces({ field }: { field: ModelField }) {
  return (
    <ul className="field-places divide-y rounded-lg border">
      <style>{`
        .field-places { --fp-line: #6d28d9; }
        .dark .field-places { --fp-line: #a78bfa; }
      `}</style>
      {field.places.map((p) => <PlaceRow key={`${p.kind}-${p.site?.site_id ?? p.device?.device_id}`} place={p} field={field} />)}
    </ul>
  );
}
