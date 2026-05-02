import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart4,
  Clock,
  Code,
  Layers,
  Plus,
  RefreshCw,
  Settings,
  Tag,
  Trophy,
  Activity,
  AlertTriangle,
  Calendar,
  User,
  GitBranch,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import ModelVersionsList from "@/components/models/ModelVersionList";
import ModelVisualResults from "@/components/models/ModelVisualResults";
import ModelMetricsView from "@/components/models/ModelMetricView";
import ModelDeploymentView from "@/components/models/ModelDeploymentView";
import ModelEvaluationsView from "@/components/models/ModelEvaluationsView";
import RetrainingPolicyView from "@/components/models/RetrainingPolicyView";
import ModelTrainingSessions from "@/components/models/ModelTrainingSessions";
import { useModelDetail } from "@/hooks/useModels";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";

// ── helpers ───────────────────────────────────────────────────────────────────

const TASK_CONFIG: Record<string, { label: string; color: string }> = {
  "classification": {
    label: "Classification",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  "object-detection": {
    label: "Object Detection",
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  "segmentation": {
    label: "Segmentation",
    color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  },
  "llm": {
    label: "Language Model",
    color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  },
  "vlm": {
    label: "Vision-Language",
    color: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center gap-2 text-gray-400 mb-2">
      {icon}
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
    {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const ModelDetail: React.FC = () => {
  const { projectId, modelId } = useParams<{ projectId: string; modelId: string }>();
  const { data: model, isLoading, error } = useModelDetail(modelId!);

  // Pre-fetch sessions so the Versions tab can show session links immediately
  const { data: sessionsData } = useTrainingSessions({
    projectId,
    modelUuid: modelId,
    limit: 50,
    enabled: !!modelId && !!projectId,
  });
  const sessions = sessionsData?.results ?? [];

  // Count active sessions for the tab badge
  const activeSessions = sessions.filter((s) =>
    ["pending", "queued", "initializing", "running"].includes(s.status)
  ).length;

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 mx-auto">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-lg mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/60 p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Model</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-6">
            {(error as Error)?.message ?? "We couldn't load the model details."}
          </p>
          <Button asChild variant="outline">
            <Link to={`/projects/${projectId}/models`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Models
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const productionVersion = model.production_version;
  const latestVersion = model.latest_version ?? model.versions[model.versions.length - 1];
  const taskCfg = TASK_CONFIG[model.task] ?? { label: model.task, color: "bg-gray-100 text-gray-800" };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 mx-auto">

      {/* Back link */}
      <Link
        to={`/projects/${projectId}/models`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to models
      </Link>

      {/* Hero header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-white">{model.name}</h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${taskCfg.color}`}
                >
                  {taskCfg.label}
                </span>
                {model.framework && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                    <Cpu className="h-3 w-3" />
                    {model.framework.toUpperCase()}
                  </span>
                )}
              </div>
              {model.description && (
                <p className="text-blue-100 text-sm max-w-xl">{model.description}</p>
              )}
              {model.tags && model.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {model.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/15 text-white text-xs"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button
              asChild
              className="flex-shrink-0 bg-white text-indigo-700 hover:bg-blue-50 border-0 shadow-sm font-semibold"
            >
              <Link to={`/projects/${projectId}/models/${modelId}/train`}>
                <Plus className="h-4 w-4 mr-2" />
                Train New Version
              </Link>
            </Button>
          </div>
        </div>

        {/* Meta row */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-6 gap-y-1">
          {model.created_by && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <User className="h-3.5 w-3.5" />
              {model.created_by}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            Created {formatDate(model.created_at)}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Updated {formatDate(model.updated_at)}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Layers className="h-4 w-4" />}
          label="Versions"
          value={model.versions.length}
          sub={latestVersion ? `Latest: ${latestVersion.version_name ?? `v${latestVersion.version_number}`}` : undefined}
        />
        <StatCard
          icon={<Tag className="h-4 w-4" />}
          label="Production"
          value={productionVersion
            ? (productionVersion.version_name ?? `v${productionVersion.version_number}`)
            : "—"}
          sub={productionVersion ? "Active deployment" : "No production version"}
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Sessions"
          value={
            <span className="flex items-center gap-2">
              {sessionsData?.total ?? "—"}
              {activeSessions > 0 && (
                <span className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-normal">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse inline-block" />
                  {activeSessions} running
                </span>
              )}
            </span>
          }
          sub="Training sessions total"
        />
        <StatCard
          icon={<GitBranch className="h-4 w-4" />}
          label="Framework"
          value={model.framework ? model.framework.toUpperCase() : "—"}
          sub={model.task}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="training" className="w-full">
        <TabsList className="flex flex-wrap gap-1 h-auto w-full">
          <TabsTrigger value="training" className="flex items-center gap-1.5 relative">
            <Activity className="h-4 w-4" />
            Training
            {activeSessions > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white font-bold">
                {activeSessions}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-1.5">
            <Layers className="h-4 w-4" /> Versions
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-1.5">
            <Code className="h-4 w-4" /> Metrics
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-1.5">
            <BarChart4 className="h-4 w-4" /> Results
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center gap-1.5">
            <Settings className="h-4 w-4" /> Deployment
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4" /> Evaluations
          </TabsTrigger>
          <TabsTrigger value="retraining" className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" /> Retraining
          </TabsTrigger>
        </TabsList>

        {/* Training Sessions tab — first and default */}
        <TabsContent value="training" className="mt-6">
          <ModelTrainingSessions
            modelId={modelId!}
            projectId={projectId!}
            modelName={model.name}
          />
        </TabsContent>

        {/* Versions */}
        <TabsContent value="versions" className="mt-6">
          <ModelVersionsList
            model={model}
            projectId={projectId!}
            sessions={sessions}
          />
        </TabsContent>

        {/* Metrics */}
        <TabsContent value="metrics" className="mt-6">
          <ModelMetricsView model={model} />
        </TabsContent>

        {/* Results */}
        <TabsContent value="visual" className="mt-6">
          <ModelVisualResults model={model} />
        </TabsContent>

        {/* Deployment */}
        <TabsContent value="deployment" className="mt-6">
          <ModelDeploymentView model={model} />
        </TabsContent>

        {/* Evaluations */}
        <TabsContent value="evaluations" className="mt-6">
          <ModelEvaluationsView model={model} />
        </TabsContent>

        {/* Retraining */}
        <TabsContent value="retraining" className="mt-6">
          <RetrainingPolicyView model={model} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelDetail;
