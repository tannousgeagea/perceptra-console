// "Deploy to devices": pick a version, pick devices (any mix of: those already
// running the model, sites, labels, single devices), pick how carefully.
// The count of devices reached updates as you choose, using the server's rule:
// enrolled, unrevoked devices matching any of the choices.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/ui/button';
import { Checkbox } from '@/components/ui/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/ui/dialog';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { useCreateRollout, useDevices, useRollouts, useSites } from '@/hooks/useFleet';
import { cn } from '@/lib/utils';
import type { ModelDetail, ModelVersion } from '@/types/models';
import { DeviceStatusMark } from './FleetBits';
import { plural, versionLabel } from './format';

const versionName = (v: ModelVersion) => v.version_name || `v${v.version_number}`;
const hasFile = (v: ModelVersion) => !!(v.artifacts?.onnx || v.artifacts?.checkpoint);
// The theme's large radius turns a 16px "rounded-sm" box into a circle; checkboxes must look unlike the radios below.
const SQUARE = 'rounded-[4px]';

function toggle(list: string[], value: string, on: boolean) {
  return on ? [...new Set([...list, value])] : list.filter((x) => x !== value);
}

function CheckList({ items, chosen, onChange, empty }: {
  items: { value: string; label: React.ReactNode; hint?: React.ReactNode }[];
  chosen: string[];
  onChange: (next: string[]) => void;
  empty: string;
}) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground">{empty}</p>;
  return (
    <ul className="max-h-44 space-y-0.5 overflow-y-auto rounded-md border p-1">
      {items.map((it) => (
        <li key={it.value}>
          <label className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-sm hover:bg-muted/60">
            <Checkbox className={SQUARE} checked={chosen.includes(it.value)} onCheckedChange={(c) => onChange(toggle(chosen, it.value, c === true))} />
            <span className="min-w-0 flex-1 truncate">{it.label}</span>
            {it.hint && <span className="shrink-0 text-xs text-muted-foreground">{it.hint}</span>}
          </label>
        </li>
      ))}
    </ul>
  );
}

export function DeployToDevicesDialog({ model, open, onOpenChange, versionId: initialVersion }: {
  model: ModelDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Preselected version; else production, else the newest trained one. */
  versionId?: string;
}) {
  const navigate = useNavigate();
  const create = useCreateRollout();
  const { data: devices = [] } = useDevices();
  const { data: sites = [] } = useSites();
  const { data: active = [] } = useRollouts({ model_id: model.id, active: true }, open);

  const trained = useMemo(
    () => model.versions.filter((v) => v.status === 'trained').sort((a, b) => b.version_number - a.version_number),
    [model.versions],
  );
  const defaultVersion = initialVersion
    ?? model.versions.find((v) => v.deployment_status === 'production')?.id
    ?? trained[0]?.id ?? '';

  const [versionId, setVersionId] = useState(defaultVersion);
  const [runningModel, setRunningModel] = useState(false);
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [strategy, setStrategy] = useState<'all' | 'canary'>('canary');
  const [canaryCount, setCanaryCount] = useState(1);
  const [canaryMinutes, setCanaryMinutes] = useState(15);
  const [maxFailures, setMaxFailures] = useState(0);

  const eligible = useMemo(() => devices.filter((d) => d.enrolled_at && d.status !== 'revoked'), [devices]);
  const running = useMemo(() => eligible.filter((d) => d.models.some((m) => m.model_id === model.id)), [eligible, model.id]);
  const allLabels = useMemo(() => [...new Set(eligible.flatMap((d) => d.labels))].sort(), [eligible]);

  // Fresh choices each time it opens: start from the devices that already run the model, if any.
  useEffect(() => {
    if (!open) return;
    setVersionId(defaultVersion);
    setRunningModel(running.length > 0);
    setSiteIds([]);
    setLabels([]);
    setDeviceIds([]);
    setStrategy('canary');
    setCanaryCount(1);
    setCanaryMinutes(15);
    setMaxFailures(0);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const reached = useMemo(() => eligible.filter((d) =>
    (runningModel && running.includes(d))
    || (d.site && siteIds.includes(d.site.site_id))
    || d.labels.some((l) => labels.includes(l))
    || deviceIds.includes(d.device_id)), [eligible, running, runningModel, siteIds, labels, deviceIds]);
  const online = reached.filter((d) => d.status === 'online').length;
  const version = trained.find((v) => v.id === versionId);
  const already = version ? reached.filter((d) => d.models.some((m) => m.model_id === model.id && m.reported?.version_id === version.id && m.in_sync)).length : 0;
  const canaryTooBig = strategy === 'canary' && canaryCount >= reached.length && reached.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!version || reached.length === 0) return;
    create.mutate(
      {
        model_id: model.id,
        version_id: version.id,
        running_model: runningModel,
        site_ids: siteIds,
        labels,
        device_ids: deviceIds,
        strategy,
        canary_count: Math.max(1, canaryCount),
        canary_minutes: Math.max(0, canaryMinutes),
        max_failures: Math.max(0, maxFailures),
      },
      {
        onSuccess: (r) => {
          onOpenChange(false);
          navigate(`/projects/${r.project_id}/rollouts/${r.rollout_id}`);
        },
      },
    );
  };

  const number = (value: number, set: (n: number) => void, min: number, max: number, id: string) => (
    <Input id={id} type="number" inputMode="numeric" min={min} max={max} value={value}
           onChange={(e) => set(Math.min(max, Math.max(min, Number(e.target.value) || 0)))} className="h-8 w-20" />
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !create.isPending && onOpenChange(o)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={submit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Deploy {model.name} to devices</DialogTitle>
            <DialogDescription>
              Each device fetches the version, checks it works and reports back. A device where it fails goes back to what it ran before.
            </DialogDescription>
          </DialogHeader>

          {/* 1. Version */}
          <div className="space-y-2">
            <Label htmlFor="deploy-version">Version</Label>
            {trained.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trained version yet.</p>
            ) : (
              <Select value={versionId} onValueChange={setVersionId}>
                <SelectTrigger id="deploy-version"><SelectValue placeholder="Choose a version" /></SelectTrigger>
                <SelectContent>
                  {trained.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {versionName(v)}{v.deployment_status === 'production' ? ' (production)' : v.deployment_status === 'staging' ? ' (staging)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {version && !hasFile(version) && (
              <p className="text-xs text-rose-600 dark:text-rose-400">This version has no model file (ONNX or checkpoint) to send.</p>
            )}
          </div>

          {/* 2. Devices */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Devices</legend>
            {eligible.length === 0 ? (
              <p className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
                No enrolled device yet. Add devices and start their agent from the Fleet page first.
              </p>
            ) : (
              <>
                <label className={cn('flex items-center gap-2.5 text-sm', running.length === 0 && 'opacity-60')}>
                  <Checkbox className={SQUARE} checked={runningModel} disabled={running.length === 0} onCheckedChange={(c) => setRunningModel(c === true)} />
                  Every device that runs {model.name} now ({running.length})
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Sites</p>
                    <CheckList
                      items={sites.map((s) => ({ value: s.site_id, label: s.name, hint: `${eligible.filter((d) => d.site?.site_id === s.site_id).length}` }))}
                      chosen={siteIds} onChange={setSiteIds} empty="No sites."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Labels</p>
                    <CheckList
                      items={allLabels.map((l) => ({ value: l, label: l, hint: `${eligible.filter((d) => d.labels.includes(l)).length}` }))}
                      chosen={labels} onChange={setLabels} empty="No labels on devices."
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Single devices</p>
                  <CheckList
                    items={eligible.map((d) => ({ value: d.device_id, label: d.name, hint: <DeviceStatusMark status={d.status} compact /> }))}
                    chosen={deviceIds} onChange={setDeviceIds} empty="No devices."
                  />
                </div>
                <p className={cn('rounded-md px-3 py-2 text-sm', reached.length ? 'bg-muted/60' : 'bg-muted/30 text-muted-foreground')} aria-live="polite">
                  {reached.length === 0
                    ? 'Choose at least one group or device.'
                    : <>Reaches <strong>{plural(reached.length, 'device')}</strong>, {online} online now
                      {already > 0 && version && <>; {already} already {already === 1 ? 'runs' : 'run'} {versionName(version)}</>}.
                      {reached.length > online && ' Offline devices update when they come back.'}</>}
                </p>
              </>
            )}
          </fieldset>

          {/* 3. How carefully */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">How</legend>
            <RadioGroup value={strategy} onValueChange={(v) => setStrategy(v as 'all' | 'canary')} className="gap-3">
              <label className="flex items-start gap-2.5 text-sm">
                <RadioGroupItem value="canary" className="mt-0.5" />
                <span className="space-y-2">
                  <span className="block">Canary first</span>
                  <span className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    {number(canaryCount, setCanaryCount, 1, 1000, 'canary-count')}
                    <span>{canaryCount === 1 ? 'device runs' : 'devices run'} it for</span>
                    {number(canaryMinutes, setCanaryMinutes, 0, 1440, 'canary-minutes')}
                    <span>min, then the rest follow</span>
                  </span>
                  {canaryTooBig && <span className="block text-xs text-amber-700 dark:text-amber-400">That's every chosen device; the canary step won't hold anything back.</span>}
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-sm">
                <RadioGroupItem value="all" className="mt-0.5" />
                <span>All at once</span>
              </label>
            </RadioGroup>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <label htmlFor="max-failures">Failed devices allowed before it pauses</label>
              {number(maxFailures, setMaxFailures, 0, 10000, 'max-failures')}
              {maxFailures === 0 && <span>(pauses at the first failure)</span>}
            </div>
          </fieldset>

          {active.length > 0 && (
            <p className="rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm">
              {active[0].model_name} {versionLabel(active[0].version)} is still rolling out. Starting this one replaces it:
              no other device gets {versionLabel(active[0].version)}, and devices it already reached keep it unless this rollout reaches them too.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={create.isPending}>Cancel</Button>
            <Button type="submit" disabled={!version || reached.length === 0 || create.isPending}>
              {create.isPending ? 'Starting…' : reached.length ? `Deploy to ${plural(reached.length, 'device')}` : 'Deploy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
