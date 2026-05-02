import React, { useState, useMemo } from 'react';
import { TrainingSession, EpochMetric } from '@/types/training_session';
import MetricsVisualization from './MetricsVisualization';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Clock,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import { Link, useParams } from 'react-router-dom';

interface SessionDetailProps {
  session: TrainingSession | undefined;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatMetricKey(key: string): string {
  const names: Record<string, string> = {
    mAP50: 'mAP@50',
    mAP50_95: 'mAP@50:95',
    mAP: 'mAP',
    precision: 'Precision',
    recall: 'Recall',
    f1Score: 'F1 Score',
    accuracy: 'Accuracy',
    loss: 'Loss',
    val_loss: 'Val Loss',
    train_loss: 'Train Loss',
    box_loss: 'Box Loss',
    cls_loss: 'Cls Loss',
    dfl_loss: 'DFL Loss',
  };
  return names[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMetricValue(key: string, value: number): string {
  if (key.toLowerCase().includes('loss')) return value.toFixed(4);
  if (value <= 1.0) return `${(value * 100).toFixed(2)}%`;
  return value.toFixed(4);
}

function isLossMetric(key: string) {
  return key.toLowerCase().includes('loss');
}

// ── sub-components ────────────────────────────────────────────────────────────

interface MetricCardGridProps {
  metrics: Record<string, number>;
  bestMetrics?: Record<string, number>;
  label: string;
}

const MetricCardGrid: React.FC<MetricCardGridProps> = ({ metrics, bestMetrics, label }) => {
  const entries = Object.entries(metrics).filter(([, v]) => typeof v === 'number');
  if (entries.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold mb-3">
        {label}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {entries.map(([key, value]) => {
          const best = bestMetrics?.[key];
          const isLoss = isLossMetric(key);
          const isBest = best !== undefined && (isLoss ? value <= best : value >= best);
          const improved = best !== undefined && (isLoss ? value < best : value > best);

          return (
            <div
              key={key}
              className={`relative rounded-xl border p-3 ${
                isBest
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
              }`}
            >
              {isBest && (
                <Star className="absolute top-2 right-2 h-3 w-3 text-indigo-500" fill="currentColor" />
              )}
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                {formatMetricKey(key)}
              </p>
              <p
                className={`text-lg font-bold ${
                  isBest ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {formatMetricValue(key, value)}
              </p>
              {best !== undefined && best !== value && (
                <div
                  className={`flex items-center gap-0.5 mt-1 text-[10px] font-medium ${
                    improved
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {improved ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  Best: {formatMetricValue(key, best)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface EpochRowProps {
  ep: EpochMetric;
  index: number;
}

const EpochRow: React.FC<EpochRowProps> = ({ ep, index }) => {
  const [open, setOpen] = useState(false);
  const metricEntries = Object.entries(ep.metrics).filter(([, v]) => typeof v === 'number');
  const timestamp = new Date(ep.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        ep.is_best
          ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10'
          : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
      }`}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
              ep.is_best
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {ep.epoch}
          </span>
          {ep.is_best && (
            <span className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              <Star className="h-3 w-3" fill="currentColor" />
              Best
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            {timestamp}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Show 2 quick metrics inline */}
          {metricEntries.slice(0, 2).map(([k, v]) => (
            <span key={k} className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">{formatMetricKey(k)}</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {formatMetricValue(k, v)}
              </span>
            </span>
          ))}
          {open ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
          {metricEntries.map(([k, v]) => (
            <div key={k} className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">{formatMetricKey(k)}</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {formatMetricValue(k, v)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Error Alert ───────────────────────────────────────────────────────────────

interface ErrorAlertProps {
  message: string;
  traceback?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, traceback }) => {
  const [showTrace, setShowTrace] = useState(false);

  return (
    <div className="rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
              Training Failed
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
            {traceback && (
              <button
                onClick={() => setShowTrace((s) => !s)}
                className="mt-2 inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                {showTrace ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showTrace ? 'Hide traceback' : 'Show traceback'}
              </button>
            )}
          </div>
        </div>
        {showTrace && traceback && (
          <div className="mt-3 bg-red-900/10 dark:bg-black/30 rounded-lg p-3 overflow-x-auto">
            <pre className="text-xs text-red-800 dark:text-red-300 font-mono whitespace-pre-wrap break-all">
              {traceback}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Empty metrics state ───────────────────────────────────────────────────────

const NoMetrics: React.FC<{ status: string }> = ({ status }) => {
  const messages: Record<string, string> = {
    pending: 'Training is queued and has not started yet.',
    queued: 'Waiting for a compute resource to become available.',
    initializing: 'Compute environment is initializing — metrics will appear once training begins.',
    running: 'Epoch metrics will appear here once the first epoch completes.',
    cancelled: 'Training was cancelled before any metrics were recorded.',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BarChart2 className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        {messages[status] ?? 'No metrics recorded for this session.'}
      </p>
    </div>
  );
};

// ── Epoch list ────────────────────────────────────────────────────────────────

interface EpochListProps {
  epochMetrics: EpochMetric[];
}

const EpochList: React.FC<EpochListProps> = ({ epochMetrics }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? epochMetrics : epochMetrics.slice(-20);
  const hidden = epochMetrics.length - visible.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Training Loop — {epochMetrics.length} Epochs
        </h4>
        {hidden > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Show all (showing last 20)
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {visible.map((ep, i) => (
          <EpochRow key={ep.epoch} ep={ep} index={i} />
        ))}
      </div>
    </div>
  );
};

// ── Chart data adapter ────────────────────────────────────────────────────────

function toChartData(epochMetrics: EpochMetric[]) {
  return epochMetrics.map((ep) => ({
    epoch: ep.epoch,
    timestamp: ep.timestamp,
    is_best: ep.is_best,
    ...ep.metrics,
  }));
}

// ── Main component ────────────────────────────────────────────────────────────

const SessionDetail: React.FC<SessionDetailProps> = ({ session }) => {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Session with ID {sessionId} not found.</p>
        <Link to="/" className="mt-3 inline-flex items-center text-blue-600 hover:underline text-sm">
          <span className="mr-1">←</span> Back to sessions
        </Link>
      </div>
    );
  }

  const chartData = useMemo(
    () => toChartData(session.epochMetrics ?? []),
    [session.epochMetrics]
  );

  const hasEpochMetrics = (session.epochMetrics?.length ?? 0) > 0;
  const hasCurrentMetrics =
    session.currentMetrics && Object.keys(session.currentMetrics).length > 0;
  const hasBestMetrics =
    session.bestMetrics && Object.keys(session.bestMetrics).length > 0;
  const hasAnyMetrics = hasEpochMetrics || hasCurrentMetrics || hasBestMetrics;

  return (
    <div className="space-y-6">
      {/* Error alert */}
      {session.status === 'failed' && session.errorMessage && (
        <ErrorAlert message={session.errorMessage} traceback={session.errorTraceback} />
      )}

      {/* No metrics placeholder */}
      {!hasAnyMetrics && <NoMetrics status={session.status} />}

      {/* Best metrics */}
      {hasBestMetrics && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <MetricCardGrid
            metrics={session.bestMetrics!}
            label="Best Metrics Achieved"
          />
        </div>
      )}

      {/* Current metrics (if different from best) */}
      {hasCurrentMetrics && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <MetricCardGrid
            metrics={session.currentMetrics!}
            bestMetrics={session.bestMetrics}
            label="Current Epoch Metrics"
          />
        </div>
      )}

      {/* Training curve chart */}
      {hasEpochMetrics && (
        <MetricsVisualization data={chartData} />
      )}

      {/* Epoch-by-epoch log */}
      {hasEpochMetrics && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <EpochList epochMetrics={session.epochMetrics!} />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {session.status === 'failed' && (
          <Button
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Training
          </Button>
        )}
        {session.status === 'completed' && (
          <Button variant="default" className="gap-2">
            <Download className="h-4 w-4" />
            Download Model
          </Button>
        )}
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>
    </div>
  );
};

export default SessionDetail;
