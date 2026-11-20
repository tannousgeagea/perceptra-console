// A project's alert thresholds: when a daily metric snapshot raises a warning
// or critical alert. Saved per project; project managers can change them.
import { useEffect, useMemo, useState } from 'react';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { useAlertThresholds } from '@/hooks/useMonitoringLoop';
import { useProjectPermissions } from '@/hooks/usePermissions';
import type { AlertThreshold } from '@/types/evaluation';

const METRIC_LABEL: Record<string, string> = {
  f1_score: 'F1 score',
  precision: 'Precision',
  recall: 'Recall',
  edit_rate: 'Correction rate',
  hallucination_rate: 'False detections',
};

// Inputs are percentages; the API stores rates (0-1).
type Row = { metric: string; warning: string; critical: string };
const pct = (rate: number) => String(Math.round(rate * 1000) / 10);

function rowError(row: Row, t: AlertThreshold): string | null {
  const w = Number(row.warning), c = Number(row.critical);
  if (row.warning === '' || row.critical === '' || Number.isNaN(w) || Number.isNaN(c)) return 'Enter both values';
  if (w < 0 || w > 100 || c < 0 || c > 100) return 'Use 0 to 100%';
  if (t.higher_is_better && c > w) return 'Critical must be at or below warning';
  if (!t.higher_is_better && c < w) return 'Critical must be at or above warning';
  return null;
}

export function AlertThresholdsCard({ projectId }: { projectId?: string }) {
  const { data, isLoading, error, save } = useAlertThresholds(projectId);
  const permissions = useProjectPermissions(projectId);
  const canEdit = !permissions.isLoading && permissions.can('manage');
  const [rows, setRows] = useState<Row[]>([]);

  // Follow the server's values whenever they (re)load or are saved.
  useEffect(() => {
    if (data) {
      setRows(data.thresholds.map((t) => ({ metric: t.metric, warning: pct(t.warning_threshold), critical: pct(t.critical_threshold) })));
    }
  }, [data]);

  const byMetric = useMemo(() => new Map((data?.thresholds ?? []).map((t) => [t.metric, t])), [data]);
  const errors = rows.map((r) => (byMetric.get(r.metric) ? rowError(r, byMetric.get(r.metric)!) : null));
  const dirty = rows.some((r) => {
    const t = byMetric.get(r.metric);
    return t && (Number(r.warning) / 100 !== t.warning_threshold || Number(r.critical) / 100 !== t.critical_threshold);
  });
  const custom = (data?.thresholds ?? []).some(
    (t) => t.warning_threshold !== t.default_warning || t.critical_threshold !== t.default_critical,
  );

  const submit = (values: Record<string, { warning: number; critical: number }>, done: string) =>
    save.mutate(values, {
      onSuccess: () => toast.success(done),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save thresholds'),
    });

  const onSave = () =>
    submit(
      Object.fromEntries(rows.map((r) => [r.metric, { warning: Number(r.warning) / 100, critical: Number(r.critical) / 100 }])),
      'Alert thresholds saved',
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert thresholds</CardTitle>
        <CardDescription>
          Each day the project's metrics are measured; crossing a value raises a warning or critical alert.
          Critical alerts can also start retraining (see the model's Retraining tab).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" /> Loading thresholds…
          </p>
        ) : error ? (
          <p className="text-sm text-destructive">Couldn't load thresholds: {error instanceof Error ? error.message : ''}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Metric</th>
                    <th className="py-2 pr-4 font-medium">Warning</th>
                    <th className="py-2 pr-4 font-medium">Critical</th>
                    <th className="py-2 font-medium">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const t = byMetric.get(row.metric)!;
                    const label = METRIC_LABEL[row.metric] ?? row.metric;
                    const set = (field: 'warning' | 'critical', value: string) =>
                      setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [field]: value } : r)));
                    return (
                      <tr key={row.metric} className="border-b align-top last:border-0">
                        <td className="py-3 pr-4">
                          <div className="font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">
                            Alerts when {t.higher_is_better ? 'below' : 'above'}
                          </div>
                          {errors[i] && <div className="mt-1 text-xs text-destructive">{errors[i]}</div>}
                        </td>
                        {(['warning', 'critical'] as const).map((field) => (
                          <td key={field} className="py-3 pr-4">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                inputMode="decimal"
                                min={0}
                                max={100}
                                step={1}
                                value={row[field]}
                                onChange={(e) => set(field, e.target.value)}
                                disabled={!canEdit || save.isPending}
                                aria-label={`${label} ${field} threshold, percent`}
                                aria-invalid={!!errors[i]}
                                className="h-8 w-20 tabular-nums"
                              />
                              <span className="text-muted-foreground">%</span>
                            </div>
                          </td>
                        ))}
                        <td className="py-3 tabular-nums text-muted-foreground">
                          {pct(t.default_warning)}% / {pct(t.default_critical)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground">
              Notifications for critical alerts: Slack {data?.notify_slack ? 'on' : 'not configured'}, email{' '}
              {data?.notify_email ? 'on' : 'not configured'}. These channels are set for the whole server, not per project.
            </p>

            {canEdit ? (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => submit({}, 'Thresholds reset to defaults')}
                  disabled={!custom || save.isPending}
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset to defaults
                </Button>
                <Button onClick={onSave} disabled={!dirty || errors.some(Boolean) || save.isPending}>
                  {save.isPending ? <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save thresholds
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Project managers can change these thresholds.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
