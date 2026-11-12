import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons on the right; they wrap below the title on narrow screens. */
  actions?: ReactNode;
  /** Anything under the title row (counts, stats). */
  children?: ReactNode;
  className?: string;
}

/**
 * The title row every page shares: same type size, no per-page icon or back
 * arrow (project pages already have "Back to Projects").
 */
export function PageHeader({ title, description, actions, children, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
