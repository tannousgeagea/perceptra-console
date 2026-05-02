import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Cpu,
  User,
  Layers,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Timer,
} from 'lucide-react';
import { TrainingSession } from '@/types/training_session';
import Badge from './ui/Badge';

interface SessionHeaderProps {
  session: TrainingSession;
  projectId: string;
}

function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatPill: React.FC<StatPillProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
    <span className="text-gray-400">{icon}</span>
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">{label}</p>
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{value}</p>
    </div>
  </div>
);

const SessionHeader: React.FC<SessionHeaderProps> = ({ session, projectId }) => {
  const isActive = ['pending', 'queued', 'initializing', 'running'].includes(session.status);

  return (
    <div className="space-y-4">
      {/* Back + status */}
      <div className="flex items-center justify-between">
        <Link
          to={`/projects/${projectId}/sessions`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sessions
        </Link>
        <Badge status={session.status} />
      </div>

      {/* Title block */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{session.modelName}</h1>
              <p className="text-blue-100 text-sm mt-0.5">{session.projectName}</p>
            </div>
            {session.modelVersionName && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                <Layers className="h-3 w-3" />
                {session.modelVersionName}
              </span>
            )}
          </div>
        </div>

        {/* Progress section */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Training Progress
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {session.progress.toFixed(1)}%
              {session.currentEpoch > 0 && session.totalEpochs > 0 && (
                <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal text-xs">
                  (Epoch {session.currentEpoch} / {session.totalEpochs})
                </span>
              )}
            </span>
          </div>
          <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                session.status === 'completed' ? 'bg-green-500' :
                session.status === 'failed' ? 'bg-red-500' :
                isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                'bg-gray-400'
              }`}
              style={{ width: `${Math.min(100, session.progress)}%` }}
            />
            {isActive && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"
                style={{ backgroundSize: '200% 100%' }}
              />
            )}
          </div>
          {session.estimatedTimeRemaining && isActive && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
              <Timer className="h-3 w-3" />
              ETA: {session.estimatedTimeRemaining}
            </p>
          )}
        </div>

        {/* Stats pills */}
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <StatPill
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Created"
              value={formatDateTime(session.createdAt)}
            />
            {session.startedAt && (
              <StatPill
                icon={<PlayCircle className="h-3.5 w-3.5" />}
                label="Started"
                value={formatDateTime(session.startedAt)}
              />
            )}
            {session.completedAt && (
              <StatPill
                icon={session.status === 'failed' ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                label={session.status === 'failed' ? 'Failed at' : 'Completed'}
                value={formatDateTime(session.completedAt)}
              />
            )}
            {session.duration && (
              <StatPill
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Duration"
                value={session.duration}
              />
            )}
            {session.computeResource && (
              <StatPill
                icon={<Cpu className="h-3.5 w-3.5" />}
                label="Compute"
                value={session.computeResource}
              />
            )}
            {session.triggeredBy && (
              <StatPill
                icon={<User className="h-3.5 w-3.5" />}
                label="Triggered by"
                value={session.triggeredBy}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHeader;
