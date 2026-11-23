// A device's health over time: one small chart per number (each has its own
// scale, so never a shared or second axis). Gaps stay gaps: a line never
// bridges a stretch when the device was silent.
import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { HealthPoint } from '@/types/fleet';
import { HEALTH_METRICS, metricValue } from './format';

type Row = { t: number } & Record<string, number | null>;

const GAP_MS = 5 * 60_000; // no sample for 5 min: break the line

function toRows(points: HealthPoint[], keys: string[]): Row[] {
  const rows: Row[] = [];
  let last: number | null = null;
  for (const p of points) {
    const t = new Date(p.at).getTime();
    if (last != null && t - last > GAP_MS) {
      rows.push({ t: last + 60_000, ...Object.fromEntries(keys.map((k) => [k, null])) } as Row);
    }
    const row = { t } as Row;
    keys.forEach((k) => { row[k] = typeof p[k] === 'number' ? (p[k] as number) : null; });
    rows.push(row);
    last = t;
  }
  return rows;
}

const timeTick = (hours: number) => (t: number) =>
  new Date(t).toLocaleString(undefined, hours > 36 ? { weekday: 'short', hour: '2-digit' } : { hour: '2-digit', minute: '2-digit' });

function MetricChart({ rows, metric, hours }: { rows: Row[]; metric: (typeof HEALTH_METRICS)[number]; hours: number }) {
  const latest = [...rows].reverse().find((r) => r[metric.key] != null)?.[metric.key] ?? null;
  const now = Date.now();
  return (
    <figure className="min-w-0 rounded-lg border p-4">
      <figcaption className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">{metric.label}</h3>
        <span className="text-sm font-medium tabular-nums">{metricValue(latest, metric.digits, metric.unit)}</span>
      </figcaption>
      <div className="mt-3 h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={[now - hours * 3_600_000, now]}
              ticks={[4, 3, 2, 1, 0].map((i) => now - (i * hours * 3_600_000) / 4)}
              tickFormatter={timeTick(hours)}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              width={40}
              domain={metric.max ? [0, metric.max] : ['auto', 'auto']}
              tickFormatter={(v: number) => Number(v.toPrecision(3)).toString()}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={metric.digits > 0}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
                color: 'hsl(var(--popover-foreground))',
              }}
              labelFormatter={(t: number) => new Date(t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              formatter={(v: number) => [metricValue(v, metric.digits, metric.unit), metric.label]}
            />
            <Line
              type="monotone"
              dataKey={metric.key}
              stroke="var(--hc-line)"
              strokeWidth={2}
              dot={rows.length <= 1 ? { r: 4 } : false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export function HealthCharts({ points, hours }: { points: HealthPoint[]; hours: number }) {
  const metrics = useMemo(
    () => HEALTH_METRICS.filter((m) => points.some((p) => typeof p[m.key] === 'number')),
    [points],
  );
  const rows = useMemo(() => toRows(points, metrics.map((m) => m.key)), [points, metrics]);

  if (metrics.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
        No health reports in this period.
      </p>
    );
  }
  return (
    <div className="health-charts grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      <style>{`
        .health-charts { --hc-line: #6d28d9; }
        .dark .health-charts { --hc-line: #a78bfa; }
      `}</style>
      {metrics.map((m) => <MetricChart key={m.key} rows={rows} metric={m} hours={hours} />)}
    </div>
  );
}
