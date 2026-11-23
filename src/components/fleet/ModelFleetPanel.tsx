// On a model's Deployment tab: the edge devices that run it, its rollouts,
// and "Deploy to devices" (project admins).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Router, Send } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { useModelDevices, useRollouts } from '@/hooks/useFleet';
import { cn } from '@/lib/utils';
import type { ModelDetail } from '@/types/models';
import { DeployToDevicesDialog } from './DeployToDevicesDialog';
import { DeviceStatusMark, RolloutBar, RolloutStatusMark } from './FleetBits';
import { ago, canaryMinutesLeft, deviceModelSentence, plural, progressSentence, versionLabel } from './format';

export function ModelFleetPanel({ model, canManage }: { model: ModelDetail; canManage: boolean }) {
  const { data: devices = [], isLoading } = useModelDevices(model.id);
  const { data: rollouts = [] } = useRollouts({ model_id: model.id, limit: 5 });
  const [open, setOpen] = useState(false);

  const live = devices.filter((d) => d.status !== 'revoked');
  const inStep = live.filter((d) => d.models.every((m) => m.in_sync)).length;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>Edge devices</CardTitle>
          <CardDescription>
            {live.length
              ? `${plural(live.length, 'device')} ${live.length === 1 ? 'runs' : 'run'} this model; ${inStep} on the version asked of ${live.length === 1 ? 'it' : 'them'}.`
              : 'Send a version to machines at your sites; each one checks it works and goes back if it doesn\'t.'}
          </CardDescription>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!canManage} title={canManage ? undefined : 'Needs the admin role in this project'} className="shrink-0">
          <Send className="mr-2 h-4 w-4" aria-hidden />Deploy to devices
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {rollouts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Rollouts</h3>
            <ul className="divide-y rounded-md border">
              {rollouts.map((r) => {
                const left = canaryMinutesLeft(r);
                return (
                  <li key={r.rollout_id}>
                    <Link to={`/projects/${r.project_id}/rollouts/${r.rollout_id}`}
                          className="grid gap-2 px-3 py-2.5 hover:bg-muted/50 md:grid-cols-[minmax(0,1fr)_11rem_minmax(0,1fr)] md:items-center md:gap-4">
                      <span className="min-w-0 truncate text-sm">
                        <span className="font-medium">{r.is_rollback ? `Rollback of ${versionLabel(r.previous_version)}` : versionLabel(r.version)}</span>
                        <span className="text-muted-foreground">, {ago(r.created_at)}</span>
                      </span>
                      <RolloutStatusMark status={r.status} />
                      <span className="min-w-0 space-y-1">
                        <RolloutBar progress={r.progress} />
                        <span className="block truncate text-xs text-muted-foreground">
                          {left != null ? `${progressSentence(r.progress)}; the rest in ${left} min` : progressSentence(r.progress)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Devices</h3>
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : live.length === 0 ? (
            <p className="flex items-center gap-2 rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
              <Router className="h-4 w-4 shrink-0" aria-hidden />
              No device runs this model yet.
              <Link to="/fleet" className="font-medium text-[var(--mtx-primary)] hover:underline dark:text-violet-400">Open Fleet</Link>
            </p>
          ) : (
            <ul className="divide-y rounded-md border">
              {live.map((d) => {
                const m = d.models.find((x) => x.model_id === model.id);
                return (
                  <li key={d.device_id}>
                    <Link to={`/fleet/devices/${d.device_id}`}
                          className="grid gap-1 px-3 py-2.5 text-sm hover:bg-muted/50 md:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1.2fr)] md:items-center md:gap-4">
                      <span className="min-w-0 truncate">
                        <span className="font-medium">{d.name}</span>
                        {d.site && <span className="text-muted-foreground">, {d.site.name}</span>}
                      </span>
                      <DeviceStatusMark status={d.status} />
                      {m && (
                        <span className="flex min-w-0 items-center gap-1.5">
                          {!m.in_sync && (
                            <AlertTriangle className={cn('h-3.5 w-3.5 shrink-0', m.reported_status === 'failed' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400')} aria-hidden />
                          )}
                          <span className="truncate">{deviceModelSentence(m)}</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
      <DeployToDevicesDialog model={model} open={open} onOpenChange={setOpen} />
    </Card>
  );
}
