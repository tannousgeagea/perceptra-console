// /fleet: every edge device of the organization, the rollouts moving models
// onto them, and the sites they're grouped by. Members look; admins add,
// change and revoke devices (deploying is done from a model, by project admins).
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, MapPin, Pencil, Plus, Router, Search, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { AddDeviceDialog } from '@/components/fleet/AddDeviceDialog';
import { ConfirmAction } from '@/components/fleet/ConfirmAction';
import { DeviceStatusMark, RolloutBar, RolloutStatusMark } from '@/components/fleet/FleetBits';
import { SiteDialog } from '@/components/fleet/SiteDialog';
import {
  DEVICE_STATUS_LABEL,
  ago,
  canaryMinutesLeft,
  deviceModelSentence,
  metricValue,
  plural,
  progressSentence,
  versionLabel,
} from '@/components/fleet/format';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { useDeleteSite, useDevices, useRollouts, useSites } from '@/hooks/useFleet';
import { cn } from '@/lib/utils';
import type { Device, DeviceStatus, Rollout, Site } from '@/types/fleet';

const ALL = 'all';
const STATUS_ORDER: DeviceStatus[] = ['online', 'stale', 'offline', 'pending', 'revoked'];
// The list shows devices that need a look first.
const SORT_RANK: Record<DeviceStatus, number> = { offline: 0, stale: 1, pending: 2, online: 3, revoked: 4 };

function summary(devices: Device[], sites: Site[], rollouts: Rollout[]): string {
  const live = devices.filter((d) => d.status !== 'revoked');
  if (live.length === 0) return 'Edge devices that run your models, and the rollouts that update them.';
  const at = sites.length ? ` at ${plural(sites.length, 'site')}` : '';
  const counts = STATUS_ORDER.filter((s) => s !== 'revoked')
    .map((s) => ({ s, n: live.filter((d) => d.status === s).length }))
    .filter((c) => c.n > 0)
    .map((c) => `${c.n} ${DEVICE_STATUS_LABEL[c.s].toLowerCase()}`);
  const moving = rollouts.length ? ` ${plural(rollouts.length, 'rollout')} in progress.` : '';
  return `${plural(live.length, 'device')}${at}: ${counts.join(', ')}.${moving}`;
}

/** The health number that says most: the app's frame rate, else CPU. */
function keyHealth(d: Device): string | null {
  if (typeof d.health.fps === 'number') return metricValue(d.health.fps, 1, 'fps');
  if (typeof d.health.cpu_percent === 'number') return `CPU ${metricValue(d.health.cpu_percent, 0, '%')}`;
  return null;
}

function seen(d: Device): string {
  if (d.status === 'revoked') return 'Key revoked';
  if (d.status === 'pending') {
    if (!d.enrollment_pending || !d.enrollment_expires_at) return 'No valid code';
    return new Date(d.enrollment_expires_at).getTime() < Date.now() ? 'Code expired' : 'Code not used yet';
  }
  return `Seen ${ago(d.last_seen_at)}`;
}

function RolloutRow({ r }: { r: Rollout }) {
  const left = canaryMinutesLeft(r);
  return (
    <li>
      <Link
        to={`/projects/${r.project_id}/rollouts/${r.rollout_id}`}
        className="grid gap-2 px-4 py-3 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none md:grid-cols-[minmax(0,1fr)_12rem_minmax(0,1fr)] md:items-center md:gap-6"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {r.is_rollback ? 'Back to ' : ''}{r.model_name} {versionLabel(r.version)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {r.created_by ? `${r.created_by}, ` : ''}{ago(r.created_at)}
          </p>
        </div>
        <RolloutStatusMark status={r.status} />
        <div className="min-w-0 space-y-1.5">
          <RolloutBar progress={r.progress} />
          <p className="truncate text-xs text-muted-foreground">
            {r.status === 'paused' && r.status_reason ? r.status_reason
              : left != null ? `${progressSentence(r.progress)}; the rest follow in ${left} min`
              : progressSentence(r.progress)}
          </p>
        </div>
      </Link>
    </li>
  );
}

function DeviceRow({ d }: { d: Device }) {
  const health = keyHealth(d);
  return (
    <li>
      <Link
        to={`/fleet/devices/${d.device_id}`}
        className={cn(
          'grid gap-2 px-4 py-3 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none',
          'md:grid-cols-[minmax(0,1.2fr)_11rem_minmax(0,1.6fr)_7rem] md:items-center md:gap-6',
          d.status === 'revoked' && 'opacity-60',
        )}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{d.name}</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {d.site && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden />{d.site.name}</span>}
            {d.labels.map((l) => <span key={l} className="rounded bg-muted px-1.5 py-0.5">{l}</span>)}
          </p>
        </div>
        <div>
          <DeviceStatusMark status={d.status} />
          <p className="text-xs text-muted-foreground">{seen(d)}</p>
        </div>
        <ul className="min-w-0 space-y-0.5 text-sm">
          {d.models.length === 0 ? (
            <li className="text-muted-foreground">No models yet</li>
          ) : d.models.map((m) => (
            <li key={m.model_id} className="flex min-w-0 items-center gap-1.5">
              {!m.in_sync && (
                <AlertTriangle
                  className={cn('h-3.5 w-3.5 shrink-0', m.reported_status === 'failed' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400')}
                  aria-label="Not on its version yet"
                />
              )}
              <span className="truncate"><span className="font-medium">{m.model_name}</span> <span className="text-muted-foreground">{deviceModelSentence(m)}</span></span>
            </li>
          ))}
        </ul>
        <p className="text-sm tabular-nums text-muted-foreground md:text-right">{health ?? ''}</p>
      </Link>
    </li>
  );
}

function FleetSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  );
}

export default function Fleet() {
  const { hasAdminPermission: isAdmin } = useCurrentOrganization();
  const [params, setParams] = useSearchParams();
  const { data: devices = [], isLoading, error, refetch } = useDevices();
  const { data: sites = [] } = useSites();
  const { data: rollouts = [] } = useRollouts({ active: true });
  const deleteSite = useDeleteSite();
  const [addDevice, setAddDevice] = useState(false);
  const [siteDialog, setSiteDialog] = useState<{ open: boolean; site: Site | null }>({ open: false, site: null });

  // Filters live in the URL so a link can open, say, the offline devices of one site.
  const query = params.get('q') ?? '';
  const siteFilter = params.get('site') ?? ALL;
  const statusFilter = params.get('status') ?? ALL;
  const setFilter = (key: string, value: string) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value || value === ALL) next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace: true });

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return devices
      .filter((d) => siteFilter === ALL || d.site?.site_id === siteFilter)
      .filter((d) => (statusFilter === ALL ? d.status !== 'revoked' : d.status === statusFilter))
      .filter((d) => !q || d.name.toLowerCase().includes(q) || d.labels.some((l) => l.toLowerCase().includes(q)))
      .sort((a, b) => SORT_RANK[a.status] - SORT_RANK[b.status] || a.name.localeCompare(b.name));
  }, [devices, query, siteFilter, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    devices.forEach((d) => { c[d.status] = (c[d.status] ?? 0) + 1; });
    return c;
  }, [devices]);

  const empty = !isLoading && !error && devices.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Fleet"
        description={summary(devices, sites, rollouts)}
        actions={isAdmin && (
          <>
            <Button variant="outline" onClick={() => setSiteDialog({ open: true, site: null })}>
              <MapPin className="mr-2 h-4 w-4" aria-hidden />Add site
            </Button>
            <Button onClick={() => setAddDevice(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden />Add device
            </Button>
          </>
        )}
      />

      {isLoading ? (
        <FleetSkeleton />
      ) : error ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">Couldn't load the fleet: {error instanceof Error ? error.message : 'unknown error'}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed px-6 py-14 text-center">
          <Router className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
          <h2 className="text-lg font-semibold">No devices yet</h2>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            Put a small agent next to your inference on each edge machine. It fetches the model versions you deploy,
            checks they work, goes back if they don't, and reports health. Your inference code stays yours.
          </p>
          {isAdmin ? (
            <Button className="mt-4" onClick={() => setAddDevice(true)}><Plus className="mr-2 h-4 w-4" aria-hidden />Add your first device</Button>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">An organization admin can add devices.</p>
          )}
        </div>
      ) : (
        <>
          {rollouts.length > 0 && (
            <section aria-labelledby="fleet-rollouts" className="space-y-3">
              <h2 id="fleet-rollouts" className="text-lg font-semibold">Rollouts in progress</h2>
              <ul className="divide-y rounded-lg border">
                {rollouts.map((r) => <RolloutRow key={r.rollout_id} r={r} />)}
              </ul>
            </section>
          )}

          <section aria-labelledby="fleet-devices" className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <h2 id="fleet-devices" className="text-lg font-semibold">
                Devices <span className="ml-1 text-sm font-normal text-muted-foreground">{shown.length}</span>
              </h2>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input value={query} onChange={(e) => setFilter('q', e.target.value)} placeholder="Name or label" aria-label="Find a device" className="pl-9" />
                </div>
                {sites.length > 0 && (
                  <Select value={siteFilter} onValueChange={(v) => setFilter('site', v)}>
                    <SelectTrigger className="sm:w-48" aria-label="Site"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All sites</SelectItem>
                      {sites.map((s) => <SelectItem key={s.site_id} value={s.site_id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                <Select value={statusFilter} onValueChange={(v) => setFilter('status', v)}>
                  <SelectTrigger className="sm:w-52" aria-label="Status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Every status but revoked</SelectItem>
                    {STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>{DEVICE_STATUS_LABEL[s]} ({counts[s] ?? 0})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ul className="divide-y rounded-lg border">
              <li className="hidden gap-6 px-4 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(0,1.2fr)_11rem_minmax(0,1.6fr)_7rem]" aria-hidden>
                <span>Device</span><span>Status</span><span>Models</span><span className="text-right">Health</span>
              </li>
              {shown.map((d) => <DeviceRow key={d.device_id} d={d} />)}
              {shown.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">No device matches these filters.</li>
              )}
            </ul>
          </section>
        </>
      )}

      {!isLoading && !error && (sites.length > 0 || (isAdmin && !empty)) && (
        <section aria-labelledby="fleet-sites" className="space-y-3">
          <h2 id="fleet-sites" className="text-lg font-semibold">Sites</h2>
          {sites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sites yet. Sites group devices by place, so a rollout can target one plant or one line.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {sites.map((s) => (
                <li key={s.site_id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setFilter('site', s.site_id)}
                    className="min-w-0 flex-1 text-left hover:underline focus-visible:underline focus-visible:outline-none"
                    title="Show this site's devices"
                  >
                    <span className="block truncate text-sm font-medium">{s.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {s.devices ? `${plural(s.devices.total - s.devices.revoked, 'device')}, ${s.devices.online} online` : ''}
                      {s.location ? `${s.devices ? ', ' : ''}${s.location}` : ''}
                    </span>
                  </button>
                  {isAdmin && (
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSiteDialog({ open: true, site: s })}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />Edit
                      </Button>
                      <ConfirmAction
                        trigger={<><Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />Delete</>}
                        triggerVariant="ghost"
                        title={`Delete ${s.name}?`}
                        description={<p>Its devices stay and keep running; they just have no site. Rollouts already started are not affected.</p>}
                        confirmLabel="Delete site"
                        pendingLabel="Deleting…"
                        destructive
                        pending={deleteSite.isPending}
                        onConfirm={(done) => deleteSite.mutate(s.site_id, {
                          onSuccess: () => {
                            done();
                            if (siteFilter === s.site_id) setFilter('site', ALL);
                          },
                        })}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <AddDeviceDialog
        open={addDevice}
        onOpenChange={setAddDevice}
        defaultSiteId={siteFilter !== ALL ? siteFilter : undefined}
      />
      <SiteDialog open={siteDialog.open} site={siteDialog.site} onOpenChange={(open) => setSiteDialog((s) => ({ ...s, open }))} />
    </div>
  );
}
