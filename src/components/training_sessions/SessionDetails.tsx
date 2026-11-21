import React, { useState, useMemo } from 'react';
import { TrainingSession, EpochMetric } from '@/types/training_session';
import LiveCurves from './LiveCurves';
import { fmtMetric, keyLabel } from '@/components/lineage/format';
import { AlertTriangle, BarChart2, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface SessionDetailProps {
  session: TrainingSession | undefined;
}

// Shared with the version and compare pages: scores as %, a learning rate stays a number.
const formatMetricKey = keyLabel;
const formatMetricValue = (key: string, value: number) => fmtMetric(key, value);

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

// ── Epoch table: newest first, the best one marked ───────────────────────────

/** Columns: the headline metrics present in the run, at most five. */
const COLUMN_ORDER = ['mAP50', 'mAP50-95', 'precision', 'recall', 'val_loss', 'train_loss'];

const EpochTable: React.FC<{ epochs: EpochMetric[]; bestEpoch?: number | null }> = ({ epochs, bestEpoch }) => {
  const [showAll, setShowAll] = useState(false);
  const columns = useMemo(() => {
    const present = new Set(epochs.flatMap((e) => Object.keys(e.metrics)));
    const chosen = COLUMN_ORDER.filter((k) => present.has(k));
    return (chosen.length ? chosen : [...present].sort()).slice(0, 5);
  }, [epochs]);
  const newestFirst = useMemo(() => [...epochs].reverse(), [epochs]);
  const visible = showAll ? newestFirst : newestFirst.slice(0, 15);

  return (
    <section aria-labelledby="epochs-heading" className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="epochs-heading" className="text-lg font-semibold">
          Epochs <span className="ml-1 text-sm font-normal text-muted-foreground">{epochs.length}</span>
        </h2>
        {newestFirst.length > visible.length && (
          <button onClick={() => setShowAll(true)} className="text-sm font-medium text-[var(--mtx-primary)] hover:underline dark:text-violet-400">
            Show all {epochs.length}
          </button>
        )}
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">Epoch</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Finished</th>
              {columns.map((k) => (
                <th key={k} scope="col" className="px-4 py-2.5 text-right font-medium">{formatMetricKey(k)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {visible.map((e) => {
              const best = e.epoch === bestEpoch || (bestEpoch == null && e.is_best);
              return (
                <tr key={e.epoch} className={best ? 'bg-violet-50 dark:bg-violet-950/30' : undefined}>
                  <th scope="row" className="whitespace-nowrap px-4 py-2 text-left font-medium tabular-nums">
                    {e.epoch}
                    {best && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--mtx-primary)] dark:text-violet-400">
                        <Star className="h-3 w-3" fill="currentColor" aria-hidden />best
                      </span>
                    )}
                  </th>
                  <td className="whitespace-nowrap px-4 py-2 text-muted-foreground tabular-nums">
                    {new Date(e.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  {columns.map((k) => (
                    <td key={k} className="px-4 py-2 text-right tabular-nums">
                      {e.metrics[k] != null ? formatMetricValue(k, e.metrics[k]) : '—'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const SessionDetail: React.FC<SessionDetailProps> = ({ session }) => {
  if (!session) return null;

  const epochs = session.epochMetrics ?? [];
  const hasCurrentMetrics = session.currentMetrics && Object.keys(session.currentMetrics).length > 0;

  return (
    <div className="space-y-8">
      {session.status === 'failed' && session.errorMessage && (
        <ErrorAlert message={session.errorMessage} traceback={session.errorTraceback} />
      )}

      {epochs.length > 0 ? (
        <>
          <LiveCurves epochs={epochs} totalEpochs={session.totalEpochs} bestEpoch={session.bestEpoch?.epoch} />
          <EpochTable epochs={epochs} bestEpoch={session.bestEpoch?.epoch} />
        </>
      ) : hasCurrentMetrics ? (
        // Older runs and some providers only kept the latest numbers.
        <section aria-labelledby="latest-heading" className="space-y-3">
          <h2 id="latest-heading" className="text-lg font-semibold">Latest metrics</h2>
          <p className="text-sm text-muted-foreground">This run didn't record each epoch, so there are no curves.</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border p-4 sm:grid-cols-4">
            {Object.entries(session.currentMetrics!).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{formatMetricKey(k)}</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums">{formatMetricValue(k, v)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : (
        <NoMetrics status={session.status} />
      )}
    </div>
  );
};

export default SessionDetail;
