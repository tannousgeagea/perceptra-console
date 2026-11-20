// Icon and colour per pipeline state: the project overview's rail and the
// organization home's mini rails use the same ones.
import { AlertTriangle, CheckCircle2, Circle, CircleDot, Hourglass, type LucideIcon } from 'lucide-react';
import type { StageState } from './pipeline';

export const STATE_STYLE: Record<StageState, { icon: LucideIcon; tone: string }> = {
  done: { icon: CheckCircle2, tone: 'text-emerald-600 dark:text-emerald-400' },
  running: { icon: CircleDot, tone: 'text-[var(--mtx-primary)] dark:text-violet-400' },
  waiting: { icon: Hourglass, tone: 'text-amber-600 dark:text-amber-400' },
  attention: { icon: AlertTriangle, tone: 'text-rose-600 dark:text-rose-400' },
  idle: { icon: Circle, tone: 'text-muted-foreground' },
};
