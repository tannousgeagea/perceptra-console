import React, { useState } from "react";
import {
  useRetrainingPolicies,
  useCreateRetrainingPolicy,
  useUpdateRetrainingPolicy,
  useDeleteRetrainingPolicy,
  useTriggerRetrainingPolicy,
} from "@/hooks/useModelDeploy";
import { ModelDetail, RetrainingPolicy, RetrainingPolicyCreate } from "@/types/models";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Switch } from "@/components/ui/ui/switch";
import { Skeleton } from "@/components/ui/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/ui/dialog";
import { Plus, Play, Trash2, RefreshCw, Clock } from "lucide-react";

const TRIGGER_LABELS: Record<string, string> = {
  annotation_count: "New annotations",
  correction_rate: "Correction rate",
  time_elapsed: "Time elapsed",
  combined: "Combined",
};

function formatDateTime(dt: string | null) {
  if (!dt) return "Never";
  return new Date(dt).toLocaleString();
}

const PolicyCard: React.FC<{
  policy: RetrainingPolicy;
  modelId: string;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onTrigger: (id: string) => void;
  busy: boolean;
}> = ({ policy, modelId, onDelete, onToggle, onTrigger, busy }) => (
  <Card className="border">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-mono">{policy.policy_id.slice(0, 8)}</CardTitle>
          <CardDescription className="text-xs mt-1">
            Trigger: <span className="font-medium">{TRIGGER_LABELS[policy.trigger_type] ?? policy.trigger_type}</span>
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={policy.is_active}
            onCheckedChange={(v) => onToggle(policy.policy_id, v)}
            aria-label="Active"
          />
          <Badge
            variant="outline"
            className={`text-xs border-0 ${
              policy.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {policy.is_active ? "Active" : "Paused"}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0 space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {policy.trigger_type !== "time_elapsed" && (
          <div>
            <span className="text-muted-foreground">Min new annotations</span>
            <p className="font-medium">{policy.min_new_annotations}</p>
          </div>
        )}
        {policy.min_correction_rate !== null && (
          <div>
            <span className="text-muted-foreground">Correction rate ≥</span>
            <p className="font-medium">{((policy.min_correction_rate ?? 0) * 100).toFixed(0)}%</p>
          </div>
        )}
        {policy.max_days_since_training !== null && (
          <div>
            <span className="text-muted-foreground">Max days w/o training</span>
            <p className="font-medium">{policy.max_days_since_training}d</p>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Cooldown</span>
          <p className="font-medium">{policy.min_hours_between_runs}h</p>
        </div>
        <div>
          <span className="text-muted-foreground">Lookback window</span>
          <p className="font-medium">{policy.lookback_days} days</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Last triggered: {formatDateTime(policy.last_triggered_at)}
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onTrigger(policy.policy_id)}
          disabled={busy || !policy.is_active}
        >
          <Play className="h-3.5 w-3.5 mr-1" />
          Trigger now
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(policy.policy_id)}
          disabled={busy}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const CreatePolicyDialog: React.FC<{ modelId: string }> = ({ modelId }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RetrainingPolicyCreate>({
    trigger_type: "annotation_count",
    min_new_annotations: 100,
    lookback_days: 30,
    min_hours_between_runs: 24,
    auto_create_dataset_version: true,
    auto_submit_training: true,
  });

  const createPolicy = useCreateRetrainingPolicy(modelId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPolicy.mutate(form, { onSuccess: () => setOpen(false) });
  };

  const set = (key: keyof RetrainingPolicyCreate, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Retraining Policy</DialogTitle>
          <DialogDescription>
            Define when to automatically kick off a new training run.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Trigger type</Label>
            <Select
              value={form.trigger_type}
              onValueChange={(v) => set("trigger_type", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annotation_count">New annotation count</SelectItem>
                <SelectItem value="correction_rate">Prediction correction rate</SelectItem>
                <SelectItem value="time_elapsed">Time since last training</SelectItem>
                <SelectItem value="combined">Combined conditions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(form.trigger_type === "annotation_count" || form.trigger_type === "combined") && (
            <div className="space-y-1.5">
              <Label>Min new annotations</Label>
              <Input
                type="number"
                min={1}
                value={form.min_new_annotations}
                onChange={(e) => set("min_new_annotations", Number(e.target.value))}
              />
            </div>
          )}

          {(form.trigger_type === "time_elapsed" || form.trigger_type === "combined") && (
            <div className="space-y-1.5">
              <Label>Max days since last training</Label>
              <Input
                type="number"
                min={1}
                value={form.max_days_since_training ?? ""}
                onChange={(e) =>
                  set("max_days_since_training", e.target.value ? Number(e.target.value) : null)
                }
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Lookback (days)</Label>
              <Input
                type="number"
                min={1}
                value={form.lookback_days}
                onChange={(e) => set("lookback_days", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min cooldown (hours)</Label>
              <Input
                type="number"
                min={1}
                value={form.min_hours_between_runs}
                onChange={(e) => set("min_hours_between_runs", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-version">Auto-create dataset version</Label>
            <Switch
              id="auto-version"
              checked={form.auto_create_dataset_version}
              onCheckedChange={(v) => set("auto_create_dataset_version", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-train">Auto-submit training</Label>
            <Switch
              id="auto-train"
              checked={form.auto_submit_training}
              onCheckedChange={(v) => set("auto_submit_training", v)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPolicy.isPending}>
              {createPolicy.isPending ? "Creating…" : "Create Policy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const RetrainingPolicyView: React.FC<{ model: ModelDetail }> = ({ model }) => {
  const { data, isLoading } = useRetrainingPolicies(model.id);
  const updatePolicy = useUpdateRetrainingPolicy(model.id);
  const deletePolicy = useDeleteRetrainingPolicy(model.id);
  const triggerPolicy = useTriggerRetrainingPolicy(model.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  const policies = data?.results ?? [];
  const busy = updatePolicy.isPending || deletePolicy.isPending || triggerPolicy.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Policies are evaluated every hour by the Beat scheduler.
          </p>
        </div>
        <CreatePolicyDialog modelId={model.id} />
      </div>

      {policies.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <RefreshCw className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No retraining policies defined.</p>
          <p className="text-xs mt-1">
            Add a policy to automatically trigger retraining when annotation thresholds are met.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((p) => (
            <PolicyCard
              key={p.policy_id}
              policy={p}
              modelId={model.id}
              onDelete={(id) => deletePolicy.mutate(id)}
              onToggle={(id, active) => updatePolicy.mutate({ policyId: id, data: { is_active: active } })}
              onTrigger={(id) => triggerPolicy.mutate(id)}
              busy={busy}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RetrainingPolicyView;
