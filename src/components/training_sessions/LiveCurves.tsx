// Two growing training curves: losses (lower is better) and scores (0–100%).
// Kept as two charts because the two have different scales (never a second axis).
// The x axis spans the whole run, so the line visibly advances toward the end.
import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { EpochMetric } from '@/types/training_session';
import { keyLabel } from '@/components/lineage/format';

// Fixed series order; light and dark steps are set in the <style> below.
const SERIES_VARS = ['--lc-1', '--lc-2', '--lc-3', '--lc-4'];

const LOSS_PREFERRED = ['train_loss', 'val_loss'];
const SCORE_PREFERRED = ['mAP50', 'mAP50-95', 'precision', 'recall', 'mAP75'];

type Row = { epoch: number } & Record<string, number>;

function pickKeys(rows: Row[], preferred: string[], test: (k: string) => boolean, max = 4): string[] {
  const present = new Set<string>();
  rows.forEach((r) => Object.keys(r).forEach((k) => k !== 'epoch' && present.add(k)));
  const chosen = preferred.filter((k) => present.has(k));
  if (chosen.length === 0) {
    // Nothing standard: fall back to whatever matches (e.g. component losses).
    [...present].filter(test).sort().forEach((k) => chosen.push(k));
  }
  return chosen.slice(0, max);
}

interface CurveProps {
  title: string;
  rows: Row[];
  keys: string[];
  totalEpochs: number;
  bestEpoch?: number | null;
  percent: boolean;
  /** Validation series are dashed so identity never rests on colour alone. */
  dashed: (key: string) => boolean;
}

/** Evenly spaced epoch ticks on a round step, at most 6, ending on a multiple of the step. */
function epochTicks(max: number): number[] {
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
  const step = steps.find((s) => max / s <= 5) ?? Math.ceil(max / 5);
  const end = Math.ceil(max / step) * step;
  return Array.from({ length: end / step + 1 }, (_, i) => i * step);
}

const fmt = (v: number, percent: boolean) => (percent ? `${(v * 100).toFixed(1)}%` : Number(v.toPrecision(4)).toString());

function Curve({ title, rows, keys, totalEpochs, bestEpoch, percent, dashed }: CurveProps) {
  const last = rows[rows.length - 1];
  const ticks = epochTicks(Math.max(totalEpochs || 0, last?.epoch ?? 1, 2));
  const domainMax = ticks[ticks.length - 1];
  return (
    <figure className="min-w-0 space-y-3 rounded-lg border p-4">
      <figcaption className="space-y-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {/* Legend with each series' latest value: names every line, so colour is never alone. */}
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
          {keys.map((k, i) => (
            <li key={k} className="flex items-center gap-2">
              <svg width="18" height="6" aria-hidden className="shrink-0">
                <line x1="0" y1="3" x2="18" y2="3" stroke={`var(${SERIES_VARS[i]})`} strokeWidth="2" strokeDasharray={dashed(k) ? '4 3' : undefined} />
              </svg>
              <span className="text-muted-foreground">{keyLabel(k)}</span>
              <span className="font-medium tabular-nums">{last && last[k] != null ? fmt(last[k], percent) : '—'}</span>
            </li>
          ))}
        </ul>
      </figcaption>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
            <XAxis
              dataKey="epoch"
              type="number"
              domain={[0, domainMax]}
              ticks={ticks}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              width={44}
              domain={percent ? [0, 1] : ['auto', 'auto']}
              tickFormatter={(v: number) => (percent ? `${Math.round(v * 100)}%` : Number(v.toPrecision(3)).toString())}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            {bestEpoch != null && (
              <ReferenceLine
                x={bestEpoch}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="2 3"
                label={{ value: 'best', position: 'insideTopRight', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
            )}
            <Tooltip
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
                color: 'hsl(var(--popover-foreground))',
              }}
              labelFormatter={(e) => `Epoch ${e}`}
              formatter={(value: number, name: string) => [fmt(value, percent), keyLabel(name)]}
            />
            {keys.map((k, i) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={`var(${SERIES_VARS[i]})`}
                strokeWidth={2}
                strokeDasharray={dashed(k) ? '5 4' : undefined}
                dot={rows.length <= 1 ? { r: 4 } : false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export default function LiveCurves({
  epochs,
  totalEpochs,
  bestEpoch,
}: {
  epochs: EpochMetric[];
  totalEpochs: number;
  bestEpoch?: number | null;
}) {
  const rows = useMemo<Row[]>(
    () => epochs.map((e) => ({ epoch: e.epoch, ...e.metrics }) as Row),
    [epochs],
  );
  const lossKeys = useMemo(() => pickKeys(rows, LOSS_PREFERRED, (k) => /loss/i.test(k)), [rows]);
  const scoreKeys = useMemo(
    () => pickKeys(rows, SCORE_PREFERRED, (k) => /map|precision|recall|f1|accuracy/i.test(k) && !/loss/i.test(k)),
    [rows],
  );
  if (!rows.length || (!lossKeys.length && !scoreKeys.length)) return null;

  return (
    <div className="live-curves grid gap-4 xl:grid-cols-2">
      <style>{`
        .live-curves { --lc-1: #6d28d9; --lc-2: #0f766e; --lc-3: #b45309; --lc-4: #64748b; }
        .dark .live-curves { --lc-1: #a78bfa; --lc-2: #2dd4bf; --lc-3: #fbbf24; --lc-4: #cbd5e1; }
      `}</style>
      {lossKeys.length > 0 && (
        <Curve title="Loss" rows={rows} keys={lossKeys} totalEpochs={totalEpochs} bestEpoch={bestEpoch} percent={false} dashed={(k) => k.startsWith('val')} />
      )}
      {scoreKeys.length > 0 && (
        <Curve title="Scores" rows={rows} keys={scoreKeys} totalEpochs={totalEpochs} bestEpoch={bestEpoch} percent dashed={() => false} />
      )}
    </div>
  );
}
