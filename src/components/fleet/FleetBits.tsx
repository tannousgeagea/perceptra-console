// Small pieces every fleet screen shares: status marks and the rollout bar.
// A mark is always an icon plus words, never colour alone.
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDot,
  Clock,
  FlaskConical,
  Hourglass,
  Loader2,
  PauseCircle,
  Repeat,
  Undo2,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeviceStatus, RolloutProgress, RolloutStatus } from '@/types/fleet';
import { DEVICE_STATUS_HINT, DEVICE_STATUS_LABEL, ROLLOUT_LABEL } from './format';

const GOOD = 'text-emerald-600 dark:text-emerald-400';
const WARN = 'text-amber-600 dark:text-amber-400';
const BAD = 'text-rose-600 dark:text-rose-400';
const BUSY = 'text-[var(--mtx-primary)] dark:text-violet-400';
const QUIET = 'text-muted-foreground';

const DEVICE_STYLE: Record<DeviceStatus, { icon: LucideIcon; tone: string }> = {
  online: { icon: CircleDot, tone: GOOD },
  stale: { icon: Clock, tone: WARN },
  offline: { icon: WifiOff, tone: BAD },
  pending: { icon: Hourglass, tone: QUIET },
  revoked: { icon: Ban, tone: QUIET },
};

export function DeviceStatusMark({ status, compact, className }: { status: DeviceStatus; compact?: boolean; className?: string }) {
  const { icon: Icon, tone } = DEVICE_STYLE[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-sm', className)} title={DEVICE_STATUS_HINT[status]}>
      <Icon className={cn('h-3.5 w-3.5 shrink-0', tone)} aria-hidden />
      {compact ? <span className="sr-only">{DEVICE_STATUS_LABEL[status]}</span> : DEVICE_STATUS_LABEL[status]}
    </span>
  );
}

const ROLLOUT_STYLE: Record<RolloutStatus, { icon: LucideIcon; tone: string; spin?: boolean }> = {
  preparing: { icon: Loader2, tone: QUIET, spin: true },
  canary: { icon: FlaskConical, tone: BUSY },
  rolling: { icon: Repeat, tone: BUSY },
  paused: { icon: PauseCircle, tone: WARN },
  completed: { icon: CheckCircle2, tone: GOOD },
  superseded: { icon: Undo2, tone: QUIET },
  failed: { icon: AlertTriangle, tone: BAD },
};

export function RolloutStatusMark({ status, className }: { status: RolloutStatus; className?: string }) {
  const { icon: Icon, tone, spin } = ROLLOUT_STYLE[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-sm', className)}>
      <Icon className={cn('h-3.5 w-3.5 shrink-0', tone, spin && 'animate-spin motion-reduce:animate-none')} aria-hidden />
      {ROLLOUT_LABEL[status]}
    </span>
  );
}

/**
 * One bar for a rollout's devices: updated, failed, updating, waiting, in that
 * order, with a 2px gap between parts. The words beside it carry the numbers.
 */
export function RolloutBar({ progress, className }: { progress: RolloutProgress; className?: string }) {
  const parts = [
    { n: progress.updated, cls: 'bg-emerald-600 dark:bg-emerald-400', name: 'updated' },
    { n: progress.failed, cls: 'bg-rose-600 dark:bg-rose-400', name: 'failed' },
    { n: progress.assigned, cls: 'bg-[var(--mtx-primary)] opacity-60 dark:bg-violet-400', name: 'updating' },
    { n: progress.waiting, cls: 'bg-muted-foreground/25', name: 'waiting' },
  ].filter((p) => p.n > 0);
  const total = parts.reduce((s, p) => s + p.n, 0);
  if (total === 0) return <div className={cn('h-1.5 rounded-full bg-muted', className)} aria-hidden />;
  return (
    <div className={cn('flex h-1.5 gap-0.5', className)} aria-hidden>
      {parts.map((p) => (
        <div key={p.name} className={cn('h-full rounded-full', p.cls)} style={{ flexGrow: p.n, flexBasis: 0 }} title={`${p.n} ${p.name}`} />
      ))}
    </div>
  );
}
