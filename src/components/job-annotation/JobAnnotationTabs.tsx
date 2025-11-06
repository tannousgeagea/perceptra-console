import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { cn } from '@/lib/utils';

interface JobAnnotationTabsProps {
  activeStatus: 'unannotated' | 'annotated' | 'reviewed';
  onStatusChange: (status: 'unannotated' | 'annotated' | 'reviewed') => void;
  unannotatedCount: number;
  annotatedCount: number;
  reviewedCount: number;
  imageSize: 'sm' | 'md' | 'lg';
  onImageSizeChange: (size: 'sm' | 'md' | 'lg') => void;
}

export function JobAnnotationTabs({
  activeStatus,
  onStatusChange,
  unannotatedCount,
  annotatedCount,
  reviewedCount,
  imageSize,
  onImageSizeChange,
}: JobAnnotationTabsProps) {
  const tabs = [
    { id: 'unannotated' as const, label: 'Unannotated', count: unannotatedCount, color: 'hsl(var(--chart-1))' },
    { id: 'annotated' as const, label: 'Annotated', count: annotatedCount, color: 'hsl(var(--chart-2))' },
    { id: 'reviewed' as const, label: 'Reviewed', count: reviewedCount, color: 'hsl(var(--chart-3))' },
  ];

  const sizes = [
    { id: 'sm' as const, label: 'S' },
    { id: 'md' as const, label: 'M' },
    { id: 'lg' as const, label: 'L' },
  ];

  return (
    <div className="flex items-center justify-between border-b">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onStatusChange(tab.id)}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-colors',
              'border-b-2 -mb-px',
              activeStatus === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              {tab.label}
              <Badge
                className="rounded-full h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
                style={{
                  backgroundColor: tab.color,
                  color: 'white',
                }}
              >
                {tab.count}
              </Badge>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 pb-2">
        {sizes.map((size) => (
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
  );
}
