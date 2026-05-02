import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { Download, Star } from 'lucide-react';

interface ChartPoint {
  epoch: number;
  timestamp?: string;
  is_best?: boolean;
  [key: string]: number | string | boolean | undefined;
}

interface MetricsVisualizationProps {
  data: ChartPoint[];
  metrics?: string[];
}

const METRIC_COLORS: Record<string, string> = {
  loss: '#EF4444',
  val_loss: '#F97316',
  train_loss: '#DC2626',
  box_loss: '#FB923C',
  cls_loss: '#FBBF24',
  dfl_loss: '#F59E0B',
  mAP50: '#10B981',
  mAP50_95: '#059669',
  mAP: '#34D399',
  accuracy: '#3B82F6',
  val_accuracy: '#2563EB',
  precision: '#8B5CF6',
  recall: '#A78BFA',
  f1Score: '#EC4899',
};

const PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

function pickColor(metric: string, index: number): string {
  return METRIC_COLORS[metric] ?? PALETTE[index % PALETTE.length];
}

function formatMetricKey(key: string): string {
  const names: Record<string, string> = {
    mAP50: 'mAP@50', mAP50_95: 'mAP@50:95', mAP: 'mAP',
    precision: 'Precision', recall: 'Recall', f1Score: 'F1',
    accuracy: 'Accuracy', loss: 'Loss', val_loss: 'Val Loss',
    train_loss: 'Train Loss', box_loss: 'Box Loss',
    cls_loss: 'Cls Loss', dfl_loss: 'DFL Loss',
  };
  return names[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Group metrics into loss vs. performance for dual-axis hint
function classifyMetric(key: string): 'loss' | 'perf' {
  if (key.toLowerCase().includes('loss')) return 'loss';
  return 'perf';
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
  data: ChartPoint[];
}> = ({ active, payload, label, data }) => {
  if (!active || !payload?.length) return null;

  const point = data.find((d) => d.epoch === label);
  const timestamp = point?.timestamp
    ? new Date(point.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 min-w-[160px]">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-gray-800">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Epoch {label}</span>
        {point?.is_best && (
          <span className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
            <Star className="h-3 w-3" fill="currentColor" />
            Best
          </span>
        )}
      </div>
      {timestamp && (
        <p className="text-[10px] text-gray-400 mb-2">{timestamp}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formatMetricKey(entry.name)}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
              {classifyMetric(entry.name) === 'loss'
                ? entry.value.toFixed(4)
                : entry.value <= 1
                ? `${(entry.value * 100).toFixed(2)}%`
                : entry.value.toFixed(4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const MetricsVisualization: React.FC<MetricsVisualizationProps> = ({ data, metrics }) => {
  const availableMetrics = useMemo<string[]>(() => {
    if (metrics?.length) return metrics;
    if (!data.length) return [];
    return Object.keys(data[0]).filter(
      (k) => k !== 'epoch' && k !== 'timestamp' && k !== 'is_best' && typeof data[0][k] === 'number'
    );
  }, [data, metrics]);

  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(
    () => new Set(availableMetrics)
  );

  const colorMap = useMemo<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    availableMetrics.forEach((metric, i) => {
      m[metric] = pickColor(metric, i);
    });
    return m;
  }, [availableMetrics]);

  const bestEpoch = useMemo(
    () => data.find((d) => d.is_best),
    [data]
  );

  const toggleMetric = (metric: string) => {
    setVisibleMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(metric)) next.delete(metric);
      else next.add(metric);
      return next;
    });
  };

  const downloadChart = () => {
    const svg = document.querySelector('.recharts-wrapper svg');
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'training_metrics.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (availableMetrics.length === 0) {
    return null;
  }

  const lossMetrics = availableMetrics.filter((m) => classifyMetric(m) === 'loss');
  const perfMetrics = availableMetrics.filter((m) => classifyMetric(m) === 'perf');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Training Curves — {data.length} Epochs
        </h3>
        <button
          onClick={downloadChart}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      {/* Metric filter pills */}
      <div className="px-5 pt-4 pb-2 flex flex-wrap gap-2">
        {/* Loss group */}
        {lossMetrics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {lossMetrics.map((metric) => (
              <button
                key={metric}
                onClick={() => toggleMetric(metric)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={
                  visibleMetrics.has(metric)
                    ? { backgroundColor: `${colorMap[metric]}22`, color: colorMap[metric], borderColor: colorMap[metric], borderWidth: 1, borderStyle: 'solid' }
                    : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                }
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: visibleMetrics.has(metric) ? colorMap[metric] : '#9ca3af' }}
                />
                {formatMetricKey(metric)}
              </button>
            ))}
          </div>
        )}
        {/* Perf group */}
        {perfMetrics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {perfMetrics.map((metric) => (
              <button
                key={metric}
                onClick={() => toggleMetric(metric)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={
                  visibleMetrics.has(metric)
                    ? { backgroundColor: `${colorMap[metric]}22`, color: colorMap[metric], borderColor: colorMap[metric], borderWidth: 1, borderStyle: 'solid' }
                    : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                }
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: visibleMetrics.has(metric) ? colorMap[metric] : '#9ca3af' }}
                />
                {formatMetricKey(metric)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="px-5 pb-5">
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
              <XAxis
                dataKey="epoch"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                label={{ value: 'Epoch', position: 'insideBottom', offset: -12, fontSize: 11, fill: '#9CA3AF' }}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} width={48} />
              <Tooltip
                content={<CustomTooltip data={data} />}
                cursor={{ stroke: 'rgba(156,163,175,0.3)', strokeDasharray: '4 4' }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatMetricKey(value)}
                  </span>
                )}
              />

              {/* Best epoch reference dot */}
              {bestEpoch && visibleMetrics.size > 0 && (
                <ReferenceDot
                  x={bestEpoch.epoch as number}
                  y={0}
                  r={0}
                  label={{
                    value: '★ Best',
                    position: 'top',
                    fontSize: 10,
                    fill: '#6366F1',
                  }}
                />
              )}

              {availableMetrics.map((metric) =>
                visibleMetrics.has(metric) ? (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={colorMap[metric]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    animationDuration={400}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MetricsVisualization;
