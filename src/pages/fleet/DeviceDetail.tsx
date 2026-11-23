// /fleet/devices/:deviceId: one edge device. What it should run against what
// it runs, its health over time, its cameras, the rollouts that reached it.
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Ban, Camera as CameraIcon, KeyRound, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/ui/dialog';
import { Input } from '@/components/ui/ui/input';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ui/toggle-group';
import { ConfirmAction } from '@/components/fleet/ConfirmAction';
import { EditDeviceDialog } from '@/components/fleet/EditDeviceDialog';
import { EnrollmentCode } from '@/components/fleet/EnrollmentCode';
import { DeviceStatusMark } from '@/components/fleet/FleetBits';
import { HealthCharts } from '@/components/fleet/HealthCharts';
import {
  DEVICE_STATUS_HINT,
  REPORTED_LABEL,
  ROLLOUT_LABEL,
  TARGET_LABEL,
  ago,
  dateTime,
  versionLabel,
} from '@/components/fleet/format';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import {
  useAddCamera,
  useDeleteCamera,
  useDeleteDevice,
  useDevice,
  useDeviceHealth,
  useNewEnrollmentCode,
  useRevokeDevice,
} from '@/hooks/useFleet';
import { cn } from '@/lib/utils';
import type { DeviceDetail as Device, DeviceModel, Enrollment } from '@/types/fleet';

const RANGES = [
  { hours: 6, label: '6 h' },
  { hours: 24, label: '24 h' },
  { hours: 168, label: '7 days' },
];

function ModelsSection({ device }: { device: Device }) {
  return (
    <section aria-labelledby="device-models" className="space-y-3">
      <h2 id="device-models" className="text-lg font-semibold">Models</h2>
      {device.models.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
          No model is deployed to this device yet. Deploy one from a model's Deployment tab.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          <li className="hidden gap-6 px-4 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(0,1fr)_8rem_8rem_minmax(0,1.2fr)]" aria-hidden>
            <span>Model</span><span>Should run</span><span>Runs</span><span>State</span>
          </li>
          {device.models.map((m) => <ModelRow key={m.model_id} m={m} />)}
        </ul>
      )}
    </section>
  );
}

function ModelRow({ m }: { m: DeviceModel }) {
  const failed = m.reported_status === 'failed' || m.reported_status === 'rolled_back';
  return (
    <li className="grid gap-1 px-4 py-3 text-sm md:grid-cols-[minmax(0,1fr)_8rem_8rem_minmax(0,1.2fr)] md:items-start md:gap-6">
      <Link to={`/projects/${m.project_id}/models/${m.model_id}?tab=deployment`} className="truncate font-medium hover:underline">
        {m.model_name}
      </Link>
      <span><span className="text-muted-foreground md:hidden">Should run </span>{versionLabel(m.desired)}</span>
      <span><span className="text-muted-foreground md:hidden">Runs </span>{versionLabel(m.reported)}</span>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5">
          {!m.in_sync && <AlertTriangle className={cn('h-3.5 w-3.5 shrink-0', failed ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400')} aria-hidden />}
          <span>
            {m.in_sync && m.reported_status !== 'rolled_back' ? (m.reported ? 'In step' : 'Nothing asked') : REPORTED_LABEL[m.reported_status]}
            {m.reported_at && <span className="text-xs text-muted-foreground">, {ago(m.reported_at)}</span>}
          </span>
        </p>
        {m.reported_error && <p className="mt-0.5 break-words text-xs text-muted-foreground">{m.reported_error}</p>}
      </div>
    </li>
  );
}

function CamerasSection({ device, isAdmin }: { device: Device; isAdmin: boolean }) {
  const add = useAddCamera(device.device_id);
  const remove = useDeleteCamera();
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    add.mutate({ name: name.trim(), position: position.trim() }, { onSuccess: () => { setName(''); setPosition(''); } });
  };
  return (
    <section aria-labelledby="device-cameras" className="space-y-3">
      <h2 id="device-cameras" className="text-lg font-semibold">Cameras</h2>
      {device.cameras.length === 0 ? (
        <p className="text-sm text-muted-foreground">No cameras listed. Listing them helps tell apart where field images come from.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {device.cameras.map((c) => (
            <li key={c.camera_id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <CameraIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{c.name}</span>
                {c.position && <span className="text-muted-foreground">, {c.position}</span>}
              </span>
              {isAdmin && (
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Remove ${c.name}`}
                        disabled={remove.isPending} onClick={() => remove.mutate(c.camera_id)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {isAdmin && (
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Camera name" aria-label="Camera name" maxLength={120} className="sm:w-48" />
          <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Where it points (optional)" aria-label="Where it points" maxLength={120} className="sm:flex-1" />
          <Button type="submit" variant="outline" disabled={!name.trim() || add.isPending}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />Add camera
          </Button>
        </form>
      )}
    </section>
  );
}

function RolloutsSection({ device }: { device: Device }) {
  if (device.rollouts.length === 0) return null;
  return (
    <section aria-labelledby="device-rollouts" className="space-y-3">
      <h2 id="device-rollouts" className="text-lg font-semibold">Rollouts</h2>
      <ul className="divide-y rounded-lg border">
        {device.rollouts.map((r) => (
          <li key={r.rollout_id}>
            <Link to={`/projects/${r.project_id}/rollouts/${r.rollout_id}`}
                  className="flex flex-col gap-1 px-4 py-3 text-sm hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4">
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{r.is_rollback ? 'Back to ' : ''}{r.model_name} {versionLabel(r.version)}</span>
                <span className="text-muted-foreground">, {dateTime(r.created_at)}</span>
              </span>
              <span className={cn('shrink-0', r.state === 'failed' && 'text-rose-600 dark:text-rose-400')}>
                {TARGET_LABEL[r.state]} here
              </span>
              <span className="shrink-0 text-muted-foreground">{ROLLOUT_LABEL[r.rollout_status]}</span>
            </Link>
            {r.error && <p className="px-4 pb-3 text-xs text-muted-foreground">{r.error}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function DetailsSection({ device }: { device: Device }) {
  const hw = device.hardware as Record<string, string | number | undefined>;
  const rows: [string, string][] = [
    ['Device ID', device.device_id],
    ['Agent', device.agent_version ? `${device.agent_version} (protocol ${device.protocol ?? '?'})` : '—'],
    ['Accepts', device.accepts.length ? device.accepts.join(', ') : '—'],
    ['Heartbeat', `every ${device.poll_seconds} s`],
    ['Last address', device.last_ip ?? '—'],
    ['System', [hw.os, hw.machine].filter(Boolean).join(', ') || '—'],
    ['Board', hw.board ? String(hw.board) : '—'],
    ['CPUs', hw.cpus != null ? String(hw.cpus) : '—'],
    ['Host name', hw.hostname ? String(hw.hostname) : '—'],
    ['Enrolled', dateTime(device.enrolled_at)],
    ['Added', dateTime(device.created_at)],
  ];
  return (
    <section aria-labelledby="device-details" className="space-y-3">
      <h2 id="device-details" className="text-lg font-semibold">Details</h2>
      <dl className="grid gap-x-6 gap-y-2 rounded-lg border p-4 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="min-w-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function CodeDialog({ enrollment, deviceName, onClose }: { enrollment: Enrollment | null; deviceName: string; onClose: () => void }) {
  return (
    <Dialog open={!!enrollment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New code for {deviceName}</DialogTitle>
          <DialogDescription>Earlier codes no longer work. A key the device already has keeps working until this code is used.</DialogDescription>
        </DialogHeader>
        {enrollment && <EnrollmentCode enrollment={enrollment} deviceName={deviceName} />}
        <DialogFooter><Button onClick={onClose}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DeviceDetail() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { hasAdminPermission: isAdmin } = useCurrentOrganization();
  const { data: device, isLoading, error } = useDevice(deviceId);
  const [hours, setHours] = useState(24);
  const { data: health = [], isLoading: healthLoading } = useDeviceHealth(deviceId, hours);
  const newCode = useNewEnrollmentCode(deviceId ?? '');
  const revoke = useRevokeDevice(deviceId ?? '');
  const remove = useDeleteDevice(deviceId ?? '');
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState<Enrollment | null>(null);

  const back = (
    <Link to="/fleet" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" aria-hidden />Fleet
    </Link>
  );

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1800px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {back}
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (error || !device) {
    return (
      <div className="mx-auto w-full max-w-[1800px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {back}
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Device not found'}.
        </p>
      </div>
    );
  }

  const revoked = device.status === 'revoked';
  const canDelete = !device.enrolled_at || revoked;
  const issueCode = () => newCode.mutate(undefined, { onSuccess: (r) => setCode(r.enrollment) });
  const codeWaiting = device.enrollment_pending && !!device.enrollment_expires_at
    && new Date(device.enrollment_expires_at).getTime() > Date.now();
  const until = dateTime(device.enrollment_expires_at);
  const banner = revoked
    ? `Revoked ${dateTime(device.revoked_at)}. ${codeWaiting
        ? `A one-time code to enroll it again works until ${until}.`
        : `${DEVICE_STATUS_HINT.revoked}.`}`
    : codeWaiting
      ? `A one-time code waits to be used until ${until}. ${device.enrolled_at ? 'The current key keeps working until the code is used.' : 'Start the agent with it.'}`
      : !device.enrolled_at
        ? `The code expired before the agent used it. ${isAdmin ? 'Ask for a new one to set the device up.' : 'An organization admin can make a new one.'}`
        : null;

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-3">
        {back}
        <PageHeader
          title={device.name}
          description={
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <DeviceStatusMark status={device.status} className="text-foreground" />
              {device.last_seen_at && !revoked && <span>seen {ago(device.last_seen_at)}</span>}
              {device.site && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden />{device.site.name}</span>}
              {device.labels.map((l) => <span key={l} className="rounded bg-muted px-1.5 py-0.5 text-xs">{l}</span>)}
            </span>
          }
          actions={isAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />Edit
              </Button>
              <Button variant="outline" size="sm" onClick={issueCode} disabled={newCode.isPending}
                      title="A one-time code to set up this device, or a replacement machine">
                <KeyRound className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                {revoked ? 'Enroll again' : 'New code'}
              </Button>
              {!revoked && device.enrolled_at && (
                <ConfirmAction
                  trigger={<><Ban className="mr-1.5 h-3.5 w-3.5" aria-hidden />Revoke</>}
                  title={`Revoke ${device.name}?`}
                  description={<>
                    <p>Its key stops working at once: the device can't fetch models or report health, and it leaves any rollout in progress.</p>
                    <p>Models already on it keep running. To use it again, enroll it with a new code.</p>
                  </>}
                  confirmLabel="Revoke device"
                  pendingLabel="Revoking…"
                  destructive
                  pending={revoke.isPending}
                  onConfirm={(done) => revoke.mutate(undefined, { onSuccess: done })}
                />
              )}
              {canDelete && (
                <ConfirmAction
                  trigger={<><Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />Delete</>}
                  title={`Delete ${device.name}?`}
                  description={<p>Its health history, cameras and rollout history go too. This can't be undone.</p>}
                  confirmLabel="Delete device"
                  pendingLabel="Deleting…"
                  destructive
                  pending={remove.isPending}
                  onConfirm={(done) => remove.mutate(undefined, { onSuccess: () => { done(); navigate('/fleet'); } })}
                />
              )}
            </>
          )}
        />
      </div>

      {banner && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm">
          <p>{banner}</p>
        </div>
      )}

      <ModelsSection device={device} />

      <section aria-labelledby="device-health" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="device-health" className="text-lg font-semibold">Health</h2>
          <ToggleGroup type="single" size="sm" value={String(hours)} onValueChange={(v) => v && setHours(Number(v))} aria-label="Period">
            {RANGES.map((r) => <ToggleGroupItem key={r.hours} value={String(r.hours)}>{r.label}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        {healthLoading ? <Skeleton className="h-48 w-full" /> : <HealthCharts points={health} hours={hours} />}
        <p className="text-xs text-muted-foreground">
          CPU, memory, temperature and disk come from the agent. Frames per second, latency and errors come from your inference
          service, if it reports them to the agent (<code>POST /v1/health</code> on the device).
        </p>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <CamerasSection device={device} isAdmin={isAdmin} />
        <DetailsSection device={device} />
      </div>

      <RolloutsSection device={device} />

      {isAdmin && <EditDeviceDialog device={device} open={editing} onOpenChange={setEditing} />}
      <CodeDialog enrollment={code} deviceName={device.name} onClose={() => setCode(null)} />
    </div>
  );
}
