// /projects/:projectId/rollouts/:rolloutId: one rollout, device by device.
// Project admins can pause, resume and roll back; everyone in the project can watch.
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pause, Play, Undo2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { ConfirmAction } from '@/components/fleet/ConfirmAction';
import { DeviceStatusMark, RolloutBar, RolloutStatusMark } from '@/components/fleet/FleetBits';
import {
  TARGET_LABEL,
  ago,
  canaryMinutesLeft,
  dateTime,
  listNames,
  replacedVersions,
  rollbackGroups,
  plural,
  progressSentence,
  versionLabel,
} from '@/components/fleet/format';
import { useProjectPermissions } from '@/hooks/usePermissions';
import { isActiveRollout, useRollout, useRolloutAction, useSites } from '@/hooks/useFleet';
import { cn } from '@/lib/utils';
import type { Rollout, RolloutTarget } from '@/types/fleet';

function plan(r: Rollout): string {
  const tolerance = r.max_failures === 0
    ? 'It pauses at the first failure.'
    : `It allows ${plural(r.max_failures, 'failed device')}, then pauses.`;
  if (r.strategy === 'canary') {
    return `${plural(r.canary_count, 'canary device')} first; the rest follow once ${r.canary_count === 1 ? 'it has' : 'they have'} run it for ${r.canary_minutes} min without a failure. ${tolerance}`;
  }
  return `Every chosen device at once. ${tolerance}`;
}

/** Which devices the rollout was sent to, in words. */
function useTargeting(r: Rollout | undefined): string {
  const { data: sites = [] } = useSites();
  if (!r) return '';
  if (r.is_rollback) return 'Sent to the devices the rolled-back rollout reached.';
  const s = r.selector;
  const parts: string[] = [];
  if (s.running_model) parts.push(`every device with ${r.model_name}`);
  if (s.site_ids?.length) {
    const names = s.site_ids.map((id) => sites.find((x) => x.site_id === id)?.name).filter(Boolean);
    parts.push(names.length === s.site_ids.length ? `devices at ${names.join(', ')}` : plural(s.site_ids.length, 'site'));
  }
  if (s.labels?.length) parts.push(`devices labelled ${s.labels.join(', ')}`);
  if (s.device_ids?.length) parts.push(plural(s.device_ids.length, 'chosen device'));
  return parts.length ? `Sent to ${parts.join(', plus ')}.` : '';
}

const TARGET_GRID = 'md:grid-cols-[minmax(0,1.2fr)_10rem_8rem_9rem_minmax(0,1.4fr)]';

function TargetRow({ t, canary }: { t: RolloutTarget; canary: boolean }) {
  return (
    <li className={cn('grid gap-1 px-4 py-3 text-sm md:items-start md:gap-6', TARGET_GRID)}>
      <div className="min-w-0">
        <Link to={`/fleet/devices/${t.device_id}`} className="truncate font-medium hover:underline">{t.device_name}</Link>
        <p className="truncate text-xs text-muted-foreground">
          {[t.site, canary && t.phase === 'canary' ? 'canary' : null].filter(Boolean).join(', ')}
        </p>
      </div>
      <DeviceStatusMark status={t.device_status} />
      <span className="tabular-nums" title={t.from_version ? undefined : 'Nothing of this model ran on the device before'}>
        {t.from_version || t.assigned_at ? `${t.from_version ? versionLabel(t.from_version) : 'none'} → ${versionLabel(t.version)}` : `→ ${versionLabel(t.version)}`}
      </span>
      <span className={cn(
        t.state === 'failed' && 'font-medium text-rose-600 dark:text-rose-400',
        t.state === 'updated' && 'text-emerald-700 dark:text-emerald-400',
      )}>
        {TARGET_LABEL[t.state]}
      </span>
      <p className="min-w-0 break-words text-muted-foreground">
        {t.error ?? (t.finished_at ? dateTime(t.finished_at) : t.assigned_at ? `Asked ${ago(t.assigned_at)}` : '')}
      </p>
    </li>
  );
}

export default function RolloutDetail() {
  const { projectId, rolloutId } = useParams<{ projectId: string; rolloutId: string }>();
  const navigate = useNavigate();
  const { data: r, isLoading, error } = useRollout(rolloutId);
  const canManage = useProjectPermissions(projectId).can('manage');
  const act = useRolloutAction(rolloutId ?? '');
  const targeting = useTargeting(r);

  const back = (to: string, label: string) => (
    <Link to={to} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" aria-hidden />{label}
    </Link>
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (error || !r) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {back('/fleet', 'Fleet')}
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Rollout not found'}.
        </p>
      </div>
    );
  }

  // A rollback sends devices to different versions: name it after what it undoes.
  const name = r.is_rollback ? `rollback of ${r.model_name} ${versionLabel(r.previous_version)}` : `${r.model_name} ${versionLabel(r.version)}`;
  const left = canaryMinutesLeft(r);
  const targets = r.targets ?? [];
  const groups = rollbackGroups(r);
  const backTotal = groups.reduce((n, g) => n + g.devices.length, 0);
  const canRollBack = backTotal > 0 && r.status !== 'superseded';
  const backLabel = groups.length === 1 ? `Roll back to ${versionLabel(groups[0].version)}` : 'Roll back';
  const replaced = replacedVersions(r);
  const hint = canManage ? undefined : 'Needs the admin role in this project';

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="space-y-3">
        {back(`/projects/${r.project_id}/models/${r.model_id}?tab=deployment`, `${r.model_name} deployment`)}
        <PageHeader
          title={r.is_rollback ? `Rollback of ${r.model_name} ${versionLabel(r.previous_version)}` : `${name} to devices`}
          description={`Started ${dateTime(r.created_at)}${r.created_by ? ` by ${r.created_by}` : ''}${
            r.is_rollback ? ', each device back to the version it ran before' : replaced ? `, replacing ${replaced}` : ''}.`}
          actions={
            <>
              {(r.status === 'canary' || r.status === 'rolling') && (
                <ConfirmAction
                  trigger={<><Pause className="mr-1.5 h-3.5 w-3.5" aria-hidden />Pause</>}
                  disabled={!canManage}
                  triggerTitle={hint}
                  title={`Pause ${name}?`}
                  description={<p>Devices already asked to update still finish; no other device is asked until you resume.</p>}
                  confirmLabel="Pause rollout"
                  pendingLabel="Pausing…"
                  pending={act.isPending}
                  onConfirm={(done) => act.mutate('pause', { onSuccess: done })}
                />
              )}
              {r.status === 'paused' && (
                <ConfirmAction
                  trigger={<><Play className="mr-1.5 h-3.5 w-3.5" aria-hidden />Resume</>}
                  triggerVariant="default"
                  disabled={!canManage}
                  triggerTitle={hint}
                  title={`Resume ${name}?`}
                  description={<>
                    {r.progress.failed > 0 && (
                      <p>
                        {plural(r.progress.failed, 'device')} failed so far. Resuming accepts {r.progress.failed === 1
                          ? 'that failure; the device stays on the version it went back to.'
                          : 'those failures; the devices stay on the versions they went back to.'}
                      </p>
                    )}
                    <p>The rollout carries on where it stopped.</p>
                  </>}
                  confirmLabel="Resume rollout"
                  pendingLabel="Resuming…"
                  pending={act.isPending}
                  onConfirm={(done) => act.mutate('resume', { onSuccess: done })}
                />
              )}
              {canRollBack && (
                <ConfirmAction
                  trigger={<><Undo2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />{backLabel}</>}
                  disabled={!canManage}
                  triggerTitle={hint}
                  title={`Roll back ${r.is_rollback ? 'this rollback' : name}?`}
                  description={<>
                    <p>
                      A new rollout puts {plural(backTotal, 'device')} back on the version {backTotal === 1 ? 'it' : 'each'} ran
                      before, all at once.{isActiveRollout(r) ? ' This rollout stops.' : ''}
                    </p>
                    <ul className="list-disc space-y-0.5 pl-5">
                      {groups.map((g) => (
                        <li key={g.version.version_id}>
                          {listNames(g.devices)} {g.devices.length === 1 ? 'goes' : 'go'} back to {versionLabel(g.version)}
                        </li>
                      ))}
                    </ul>
                    <p>Devices go back from the copy they kept, so it works even with a slow connection.</p>
                  </>}
                  confirmLabel="Roll back"
                  pendingLabel="Starting…"
                  destructive
                  pending={act.isPending}
                  onConfirm={(done) => act.mutate('rollback', {
                    onSuccess: (next) => { done(); navigate(`/projects/${next.project_id}/rollouts/${next.rollout_id}`); },
                  })}
                />
              )}
            </>
          }
        />
      </div>

      <section aria-label="Progress" className="space-y-3 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <RolloutStatusMark status={r.status} className="text-base font-medium" />
          <span className="text-sm tabular-nums text-muted-foreground">{progressSentence(r.progress)}</span>
        </div>
        <RolloutBar progress={r.progress} className="h-2" />
        <div className="space-y-1 text-sm text-muted-foreground">
          {r.status_reason && <p className="text-foreground">{r.status_reason}</p>}
          {left != null && <p>The canary has run it without a failure; the rest follow in {left} min.</p>}
          {r.status === 'canary' && !r.canary_healthy_since && <p>Waiting for the canary to report the new version.</p>}
          {r.status === 'preparing' && <p>Checksumming the model file and building its manifest; devices are asked once that's done.</p>}
          {isActiveRollout(r) && r.progress.offline > 0 && (
            <p>{plural(r.progress.offline, 'device')} {r.progress.offline === 1 ? 'is' : 'are'} offline and will update when {r.progress.offline === 1 ? 'it comes' : 'they come'} back.</p>
          )}
          {r.completed_at && <p>Finished {dateTime(r.completed_at)}.</p>}
          <p>{plan(r)} {targeting}</p>
        </div>
      </section>

      <section aria-labelledby="rollout-devices" className="space-y-3">
        <h2 id="rollout-devices" className="text-lg font-semibold">
          Devices <span className="ml-1 text-sm font-normal text-muted-foreground">{targets.length}</span>
        </h2>
        {targets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No device left in this rollout.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            <li className={cn('hidden gap-6 px-4 py-2 text-xs font-medium text-muted-foreground md:grid', TARGET_GRID)} aria-hidden>
              <span>Device</span><span>Connection</span><span>Change</span><span>Update</span><span>Details</span>
            </li>
            {targets.map((t) => <TargetRow key={t.device_id} t={t} canary={r.strategy === 'canary'} />)}
          </ul>
        )}
      </section>

      {!canManage && (
        <p className="text-xs text-muted-foreground">Pausing, resuming and rolling back need the admin role in this project.</p>
      )}
    </div>
  );
}
