import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ExternalLink,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Plus,
  AlertTriangle,
  Activity,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import { TrainingSession, Status } from "@/types/training_session";

interface ModelTrainingSessionsProps {
  modelId: string;
  projectId: string;
  modelName: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: React.ReactNode; bar: string; text: string }
> = {
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bar: "bg-green-500",
    text: "text-green-700 dark:text-green-400",
  },
  running: {
    label: "Running",
    icon: <Activity className="h-3.5 w-3.5 animate-pulse" />,
    bar: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-400",
  },
  initializing: {
    label: "Initializing",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    bar: "bg-violet-500",
    text: "text-violet-700 dark:text-violet-400",
  },
  queued: {
    label: "Queued",
    icon: <Clock className="h-3.5 w-3.5" />,
    bar: "bg-amber-400",
    text: "text-amber-700 dark:text-amber-400",
  },
  pending: {
    label: "Pending",
    icon: <Clock className="h-3.5 w-3.5" />,
    bar: "bg-gray-400",
    text: "text-gray-500 dark:text-gray-400",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="h-3.5 w-3.5" />,
    bar: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-3.5 w-3.5" />,
    bar: "bg-gray-400",
    text: "text-gray-500 dark:text-gray-400",
  },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPrimaryMetric(
  metrics?: Record<string, number>
): { key: string; value: number } | null {
  if (!metrics) return null;
  const priority = ["mAP50", "mAP", "accuracy", "f1Score", "precision", "recall"];
  for (const key of priority) {
    if (metrics[key] !== undefined) return { key, value: metrics[key] };
  }
  const entries = Object.entries(metrics).filter(([, v]) => typeof v === "number");
  return entries.length > 0 ? { key: entries[0][0], value: entries[0][1] } : null;
}

function formatMetric(key: string, val: number): string {
  if (key.toLowerCase().includes("loss")) return val.toFixed(4);
  return val <= 1 ? `${(val * 100).toFixed(1)}%` : val.toFixed(2);
}

// ── Session row ───────────────────────────────────────────────────────────────

const SessionRow: React.FC<{
  session: TrainingSession;
  projectId: string;
}> = ({ session, projectId }) => {
  const cfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.pending;
  const metric = getPrimaryMetric(session.bestMetrics ?? session.currentMetrics);

  return (
    <Link
      to={`/projects/${projectId}/sessions/${session.id}`}
      className="group flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
    >
      {/* Version badge */}
      <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold font-mono min-w-[52px] justify-center">
        <Layers className="h-3 w-3" />
        {session.modelVersionName}
      </span>

      {/* Status */}
      <span className={`flex-shrink-0 flex items-center gap-1 text-xs font-medium w-24 ${cfg.text}`}>
        {cfg.icon}
        {cfg.label}
      </span>

      {/* Progress bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${cfg.bar}`}
              style={{ width: `${Math.min(100, session.progress)}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400 w-8 text-right flex-shrink-0">
            {session.progress.toFixed(0)}%
          </span>
        </div>
        {session.currentEpoch > 0 && session.totalEpochs > 0 && (
          <p className="text-[10px] text-gray-400">
            Epoch {session.currentEpoch}/{session.totalEpochs}
          </p>
        )}
      </div>

      {/* Metric */}
      {metric && (
        <span className="flex-shrink-0 text-xs font-semibold text-gray-700 dark:text-gray-300 w-20 text-right">
          {metric.key}: {formatMetric(metric.key, metric.value)}
        </span>
      )}

      {/* Error indicator */}
      {session.status === "failed" && session.errorMessage && (
        <div
          className="flex-shrink-0 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 max-w-[140px] truncate"
          title={session.errorMessage}
        >
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{session.errorMessage}</span>
        </div>
      )}

      {/* Date */}
      <span className="flex-shrink-0 text-xs text-gray-400 hidden md:block w-28 text-right">
        {formatDateTime(session.createdAt)}
      </span>

      {/* Arrow */}
      <ChevronRight className="flex-shrink-0 h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
    </Link>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const ModelTrainingSessions: React.FC<ModelTrainingSessionsProps> = ({
  modelId,
  projectId,
  modelName,
}) => {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useTrainingSessions({
    projectId,
    modelUuid: modelId,
    limit: 20,
    enabled: !!modelId && !!projectId,
  });

  const sessions = data?.results ?? [];
  const total = data?.total ?? 0;

  const activeCount = sessions.filter((s) =>
    ["pending", "queued", "initializing", "running"].includes(s.status)
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Training History
          </h3>
          {!isLoading && total > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {total} session{total !== 1 ? "s" : ""}
              {activeCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                  {activeCount} active
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {total > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              asChild
            >
              <Link to={`/projects/${projectId}/sessions`}>
                <ExternalLink className="h-3.5 w-3.5" />
                View All
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() =>
              navigate(`/projects/${projectId}/models/${modelId}/train`)
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Train New Version
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Loading sessions…
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <AlertTriangle className="h-8 w-8 text-amber-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(error as Error).message}
            </p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <PlayCircle className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              No training sessions yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 max-w-xs">
              Train your first version of <span className="font-medium">{modelName}</span> to start
              building your model's history.
            </p>
            <Button
              size="sm"
              onClick={() =>
                navigate(`/projects/${projectId}/models/${modelId}/train`)
              }
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Train New Version
            </Button>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-400 w-[52px] flex-shrink-0">
                Version
              </span>
              <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-400 w-24 flex-shrink-0">
                Status
              </span>
              <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-400 flex-1">
                Progress
              </span>
              <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-400 w-20 text-right flex-shrink-0">
                Best Metric
              </span>
              <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-400 w-28 text-right flex-shrink-0 hidden md:block">
                Started
              </span>
              <span className="w-4 flex-shrink-0" />
            </div>

            {sessions.map((session) => (
              <SessionRow key={session.id} session={session} projectId={projectId} />
            ))}

            {total > sessions.length && (
              <div className="px-4 py-3 text-center border-t border-gray-100 dark:border-gray-800">
                <Link
                  to={`/projects/${projectId}/sessions`}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  View all {total} sessions
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModelTrainingSessions;
