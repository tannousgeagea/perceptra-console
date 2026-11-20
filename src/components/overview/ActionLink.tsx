import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import type { StageAction } from './pipeline';

export type Can = (permission: NonNullable<StageAction['needs']>) => boolean;

/** The action, or a plain link to look when the person may not do it. */
export function ActionLink({ action, can, primary }: { action: StageAction; can: Can; primary?: boolean }) {
  const allowed = !action.needs || can(action.needs);
  const label = allowed ? action.label : action.viewLabel ?? action.label;
  const to = allowed ? action.to : action.viewTo ?? action.to;
  if (allowed && primary) {
    return (
      <Button asChild size="sm" variant="outline" className="h-8">
        <Link to={to}>{label}</Link>
      </Button>
    );
  }
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-sm text-sm font-medium text-[var(--mtx-primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-violet-400"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}
