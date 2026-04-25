import React from "react";
import { useModelEvaluations, usePromoteChallenger } from "@/hooks/useModelDeploy";
import { ModelDetail } from "@/types/models";
import { ModelEvaluation } from "@/types/models";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { ArrowUpRight, Trophy, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    running: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
};

const recommendationLabel = (rec: string | null) => {
  if (!rec) return null;
  if (rec === "promote") return { label: "Promote", cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
  if (rec === "keep_champion") return { label: "Keep champion", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
  return { label: "Inconclusive", cls: "bg-muted text-muted-foreground" };
};

const MetricRow: React.FC<{ label: string; challenger: number; champion: number }> = ({
  label, challenger, champion,
}) => {
  const delta = challenger - champion;
  const improved = delta > 0.005;
  const worse = delta < -0.005;
  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-4 text-sm text-muted-foreground">{label}</td>
      <td className="py-2 pr-4 text-sm font-mono">{(challenger * 100).toFixed(1)}%</td>
      <td className="py-2 pr-4 text-sm font-mono text-muted-foreground">
        {champion > 0 ? `${(champion * 100).toFixed(1)}%` : "—"}
      </td>
      <td className="py-2 text-sm font-mono">
        {improved && <span className="flex items-center gap-1 text-green-600"><TrendingUp className="h-3 w-3" />{(delta * 100).toFixed(1)}%</span>}
        {worse && <span className="flex items-center gap-1 text-red-600"><TrendingDown className="h-3 w-3" />{(delta * 100).toFixed(1)}%</span>}
        {!improved && !worse && <span className="flex items-center gap-1 text-muted-foreground"><Minus className="h-3 w-3" />~0%</span>}
      </td>
    </tr>
  );
};

const EvaluationCard: React.FC<{
  evaluation: ModelEvaluation;
  onPromote: (id: string) => void;
  promoting: boolean;
}> = ({ evaluation, onPromote, promoting }) => {
  const rec = recommendationLabel(evaluation.recommendation);
  const cm = evaluation.challenger_metrics;
  const chm = evaluation.champion_metrics;

  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-mono">
              {evaluation.evaluation_id.slice(0, 8)}
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              {new Date(evaluation.created_at).toLocaleString()}
              {evaluation.completed_at && ` · completed ${new Date(evaluation.completed_at).toLocaleString()}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs border-0 ${statusBadge(evaluation.status)}`}>
              {evaluation.status}
            </Badge>
            {rec && (
              <Badge variant="outline" className={`text-xs border-0 ${rec.cls}`}>
                {rec.label}
              </Badge>
            )}
            {evaluation.auto_promoted && (
              <Badge variant="outline" className="text-xs border-0 bg-primary/10 text-primary">
                <Trophy className="h-3 w-3 mr-1" /> Auto-promoted
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {evaluation.status === "completed" && (
        <CardContent className="pt-0">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-1.5 pr-4 text-left text-xs text-muted-foreground font-medium">Metric</th>
                <th className="py-1.5 pr-4 text-left text-xs text-muted-foreground font-medium">Challenger</th>
                <th className="py-1.5 pr-4 text-left text-xs text-muted-foreground font-medium">Champion</th>
                <th className="py-1.5 text-left text-xs text-muted-foreground font-medium">Delta</th>
              </tr>
            </thead>
            <tbody>
              {cm.f1_score !== undefined && (
                <MetricRow label="F1" challenger={cm.f1_score} champion={chm.f1_score ?? 0} />
              )}
              {cm.precision !== undefined && (
                <MetricRow label="Precision" challenger={cm.precision} champion={chm.precision ?? 0} />
              )}
              {cm.recall !== undefined && (
                <MetricRow label="Recall" challenger={cm.recall} champion={chm.recall ?? 0} />
              )}
            </tbody>
          </table>

          {evaluation.recommendation === "promote" && !evaluation.auto_promoted && (
            <Button
              size="sm"
              className="mt-4"
              onClick={() => onPromote(evaluation.evaluation_id)}
              disabled={promoting}
            >
              <ArrowUpRight className="h-4 w-4 mr-1" />
              {promoting ? "Promoting…" : "Promote to Production"}
            </Button>
          )}
        </CardContent>
      )}

      {evaluation.status === "failed" && (
        <CardContent className="pt-0">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Evaluation failed
          </p>
        </CardContent>
      )}
    </Card>
  );
};

const ModelEvaluationsView: React.FC<{ model: ModelDetail }> = ({ model }) => {
  const { data, isLoading } = useModelEvaluations(model.id);
  const promote = usePromoteChallenger();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => <Skeleton key={i} className="h-36 w-full" />)}
      </div>
    );
  }

  const evaluations = data?.results ?? [];

  if (evaluations.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No evaluations yet.</p>
        <p className="text-xs mt-1">Evaluations run automatically after each training job completes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {evaluations.length} evaluation{evaluations.length !== 1 ? "s" : ""} — most recent first
      </p>
      {evaluations.map((ev) => (
        <EvaluationCard
          key={ev.evaluation_id}
          evaluation={ev}
          onPromote={(id) => promote.mutate(id)}
          promoting={promote.isPending}
        />
      ))}
    </div>
  );
};

export default ModelEvaluationsView;
