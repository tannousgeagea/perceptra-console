import React from 'react';
import { TrainingSession } from '@/types/training_session';
import Badge from './ui/Badge';
import { Calendar, Clock, Cpu, AlertTriangle, User, Layers } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';

interface SessionCardProps {
  session: TrainingSession;
  onViewSession: (session: TrainingSession) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMetricValue(key: string, value: number): string {
  if (key.toLowerCase().includes('loss')) return value.toFixed(4);
  if (value <= 1) return `${(value * 100).toFixed(1)}%`;
  return value.toFixed(2);
}

function getPrimaryMetric(metrics?: Record<string, number>): { key: string; value: number } | null {
  if (!metrics) return null;
  const priority = ['mAP50', 'mAP', 'accuracy', 'f1Score', 'precision', 'recall'];
  for (const key of priority) {
    if (metrics[key] !== undefined) return { key, value: metrics[key] };
  }
  const entries = Object.entries(metrics).filter(([, v]) => typeof v === 'number');
  return entries.length > 0 ? { key: entries[0][0], value: entries[0][1] } : null;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onViewSession }) => {
  const isActive = ['pending', 'queued', 'initializing', 'running'].includes(session.status);
  const isFailed = session.status === 'failed';
  const isCompleted = session.status === 'completed';

  const primaryMetric = getPrimaryMetric(session.bestMetrics || session.currentMetrics);
  const loss = (session.bestMetrics || session.currentMetrics)?.['loss']
    ?? (session.bestMetrics || session.currentMetrics)?.['train_loss'];

  return (
    <div
      className={`
        bg-white dark:bg-gray-900 rounded-xl border transition-all duration-200
        hover:shadow-md cursor-pointer overflow-hidden
        ${isFailed ? 'border-red-200 dark:border-red-800/50' : 'border-gray-200 dark:border-gray-700'}
      `}
      onClick={() => onViewSession(session)}
    >
      {/* Top accent bar */}
      <div
        className={`h-1 w-full ${
          isCompleted ? 'bg-green-500' :
          isFailed ? 'bg-red-500' :
          isActive ? 'bg-blue-500' :
          'bg-gray-300 dark:bg-gray-700'
        }`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1 mr-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {session.modelName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {session.projectName}
            </p>
          </div>
          <Badge status={session.status} />
        </div>

        {/* Version — prominent pill, always visible */}
        {session.modelVersionName && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold font-mono">
              <Layers className="h-3 w-3" />
              {session.modelVersionName}
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {session.currentEpoch > 0 && session.totalEpochs > 0
                ? `Epoch ${session.currentEpoch} / ${session.totalEpochs}`
                : 'Progress'}
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {session.progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-green-500' :
                isFailed ? 'bg-red-500' :
                isActive ? 'bg-blue-500' :
                'bg-gray-400'
              }`}
              style={{ width: `${Math.min(100, session.progress)}%` }}
            />
          </div>
        </div>

        {/* Error — displayed immediately when failed, full message visible */}
        {isFailed && (
          <div className="mb-3 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/25 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/40 border-b border-red-200 dark:border-red-700">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
                Training Failed
              </span>
            </div>
            <p className="px-3 py-2 text-xs text-red-700 dark:text-red-400 leading-relaxed">
              {session.errorMessage ?? 'An unexpected error occurred. Open session for details.'}
            </p>
          </div>
        )}

        {/* Metrics row */}
        {(primaryMetric || loss !== undefined) && (
          <div className="flex gap-2 mb-3">
            {primaryMetric && (
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[10px]">
                  {primaryMetric.key}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatMetricValue(primaryMetric.key, primaryMetric.value)}
                </p>
              </div>
            )}
            {loss !== undefined && (
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[10px]">Loss</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {loss.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(session.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {session.duration ?? formatTime(session.createdAt)}
          </span>
          {session.computeResource && (
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              {session.computeResource}
            </span>
          )}
          {session.triggeredBy && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {session.triggeredBy}
            </span>
          )}
        </div>

        <Button
          size="sm"
          className="w-full"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onViewSession(session);
          }}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default SessionCard;
