import { Button } from '@/components/ui/ui/button';
import { Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JobImageCounts, JobImageTab } from '@/types/image';
import { JOB_TABS } from './jobTabs';

interface JobAnnotationTabsProps {
  activeStatus: JobImageTab;
  onStatusChange: (status: JobImageTab) => void;
  /** Undefined while the first counts request is in flight. */
  counts?: JobImageCounts;
  imageSize: 'sm' | 'md' | 'lg';
  onImageSizeChange: (size: 'sm' | 'md' | 'lg') => void;
}


const SIZES = [
  { id: 'sm' as const, label: 'S' },
  { id: 'md' as const, label: 'M' },
  { id: 'lg' as const, label: 'L' },
];

export function JobAnnotationTabs({
  activeStatus,
  onStatusChange,
  counts,
  imageSize,
  onImageSizeChange,
}: JobAnnotationTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b">
      {/* Full width on phones and swipeable, with no scrollbar box (and no vertical
          scrollbar from the tabs' -1px underline offset). */}
      <div
        role="tablist"
        className="flex w-full min-w-0 items-center gap-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden"
      >
        {JOB_TABS.map((tab) => {
          const isActive = activeStatus === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              title={tab.hint}
              onClick={() => onStatusChange(tab.id)}
              className={cn(
                'relative -mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                <span
                  className={cn(
                    'inline-flex h-6 min-w-[2rem] items-center justify-center rounded-full px-2 text-xs font-bold tabular-nums text-white transition-opacity',
                    !isActive && 'opacity-80'
                  )}
                  style={{ backgroundColor: tab.color }}
                >
                  {counts ? counts[tab.id].toLocaleString() : '–'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pb-2">
        {!!counts?.marked_null && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400"
            title="Images flagged as empty (no objects). They are listed under Reviewed or Completed."
          >
            <Ban className="h-3 w-3" />
            {counts.marked_null.toLocaleString()} flagged empty
          </span>
        )}
        <div className="flex items-center gap-1">
          {SIZES.map((size) => (
            <Button
              key={size.id}
              variant={imageSize === size.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onImageSizeChange(size.id)}
              className="h-8 w-8 p-0"
            >
              {size.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
