import { cn } from '@/lib/utils';

interface SimilarityBadgeProps {
  score: number;
  isRepresentative?: boolean;
  isUnique?: boolean;
  className?: string;
}

export function SimilarityBadge({ score, isRepresentative, isUnique, className }: SimilarityBadgeProps) {
  if (isUnique) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground',
          className
        )}
        aria-label="Unique image"
      >
        Unique
      </span>
    );
  }

  if (isRepresentative) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-success/15 text-success',
          className
        )}
        aria-label="Representative image"
      >
        REP
      </span>
    );
  }

  const pct = Math.round(score * 100);
  const isVeryHigh = pct >= 95;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums',
        isVeryHigh
          ? 'bg-destructive/15 text-destructive'
          : 'bg-warning/15 text-warning',
        className
      )}
      aria-label={`${pct}% similarity`}
    >
      {pct}%
    </span>
  );
}
