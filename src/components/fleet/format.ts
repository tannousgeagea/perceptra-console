// Words and numbers for the fleet screens. Pure functions.
import { baseURL } from '@/components/api/base';
import type {
  DeviceModel,
  DeviceStatus,
  FleetVersionRef,
  ReportedStatus,
  Rollout,
  RolloutProgress,
  RolloutStatus,
  TargetState,
} from '@/types/fleet';

export const DEVICE_STATUS_LABEL: Record<DeviceStatus, string> = {
  online: 'Online',
  stale: 'Missed heartbeats',
  offline: 'Offline',
  pending: 'Waiting to enroll',
  revoked: 'Revoked',
};

export const DEVICE_STATUS_HINT: Record<DeviceStatus, string> = {
  online: 'Checked in within its last three heartbeats',
  stale: 'No heartbeat for a few minutes',
  offline: 'No heartbeat for over 10 minutes',
  pending: 'Added, but the agent has not used its code yet',
  revoked: 'Its key no longer works; models it had keep running',
};

export const REPORTED_LABEL: Record<ReportedStatus, string> = {
  pending: 'Not installed yet',
  downloading: 'Downloading',
  running: 'Running',
  failed: 'Failed',
  rolled_back: 'Went back',
};

export const ROLLOUT_LABEL: Record<RolloutStatus, string> = {
  preparing: 'Preparing files',
  canary: 'Canary',
  rolling: 'Rolling out',
  paused: 'Paused',
  completed: 'Completed',
  superseded: 'Replaced by a newer rollout',
  failed: 'Failed',
};

export const TARGET_LABEL: Record<TargetState, string> = {
  waiting: 'Waiting',
  assigned: 'Updating',
  updated: 'Updated',
  failed: 'Failed',
  skipped: 'Skipped',
};

/** "line-2, jetson ,line-2" → ["line-2", "jetson"]. */
export const parseLabels = (text: string) =>
  [...new Set(text.split(',').map((l) => l.trim()).filter(Boolean))];

/** The address devices use to reach the platform (the API, not this page, when they differ). */
export const platformUrl = () =>
  (/^https?:\/\//.test(baseURL) ? baseURL.replace(/\/$/, '') : window.location.origin);

export const versionLabel =(v: FleetVersionRef | null | undefined) =>
  v ? v.version_name || `v${v.version_number}` : '—';

export const plural = (count: number, word: string, many = `${word}s`) =>
  `${count.toLocaleString()} ${count === 1 ? word : many}`;

/** "3 of 5 updated, 1 failed". */
export function progressSentence(p: RolloutProgress): string {
  const parts = [`${p.updated} of ${p.total} updated`];
  if (p.failed) parts.push(`${p.failed} failed`);
  if (p.offline) parts.push(`${p.offline} offline`);
  return parts.join(', ');
}

/** What a device-model pair is doing, in a few words. */
export function deviceModelSentence(dm: DeviceModel): string {
  const running = versionLabel(dm.reported);
  if (dm.in_sync && dm.reported_status === 'rolled_back') return `${running} running, went back after a newer version failed`;
  if (dm.in_sync) return dm.reported ? `${running} running` : 'Nothing installed';
  if (dm.reported_status === 'downloading') return `${running === '—' ? 'Installing' : `${running}, getting`} ${versionLabel(dm.desired)}`;
  if (dm.reported_status === 'failed') return `${versionLabel(dm.desired)} failed`;
  return dm.reported ? `${running}, should run ${versionLabel(dm.desired)}` : `Should run ${versionLabel(dm.desired)}`;
}

/** The canary's countdown: minutes left before the rest of the fleet follows, or null. */
export function canaryMinutesLeft(r: Rollout, now = Date.now()): number | null {
  if (r.status !== 'canary' || !r.canary_healthy_since) return null;
  const done = new Date(r.canary_healthy_since).getTime() + r.canary_minutes * 60_000;
  return Math.max(0, Math.ceil((done - now) / 60_000));
}

export function ago(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 36) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export const dateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

/** The health numbers people look for, in the order they look for them. */
export const HEALTH_METRICS: { key: string; label: string; unit: string; digits: number; max?: number }[] = [
  { key: 'fps', label: 'Frames per second', unit: 'fps', digits: 1 },
  { key: 'latency_ms', label: 'Latency', unit: 'ms', digits: 0 },
  { key: 'errors', label: 'Errors', unit: '', digits: 0 },
  { key: 'cpu_percent', label: 'CPU', unit: '%', digits: 0, max: 100 },
  { key: 'gpu_percent', label: 'GPU', unit: '%', digits: 0, max: 100 },
  { key: 'memory_percent', label: 'Memory', unit: '%', digits: 0, max: 100 },
  { key: 'temperature_c', label: 'Temperature', unit: '°C', digits: 0 },
  { key: 'disk_free_gb', label: 'Free disk', unit: 'GB', digits: 1 },
];

export function metricValue(value: unknown, digits: number, unit: string): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const text = value.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  return unit === '%' ? `${text}%` : unit ? `${text} ${unit}` : text;
}
