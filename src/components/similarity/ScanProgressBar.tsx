import { Progress } from '@/components/ui/ui/progress';

interface ScanProgressBarProps {
  status: 'pending' | 'running';
  progress: number;
  hashedImages: number;
  totalImages: number;
  etaSeconds: number | null;
}

export function ScanProgressBar({ status, progress, hashedImages, totalImages, etaSeconds }: ScanProgressBarProps) {
  if (status === 'pending') {
    return (
      <div className="space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full animate-pulse bg-muted-foreground/20" />
        </div>
        <p className="text-xs text-muted-foreground">Queued — waiting to start</p>
      </div>
    );
  }

  const formatEta = (s: number | null) => {
    if (s == null) return '';
    if (s < 60) return `~${s}s remaining`;
    return `~${Math.floor(s / 60)}m ${s % 60}s remaining`;
  };

  return (
    <div className="space-y-1.5">
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {hashedImages.toLocaleString()} / {totalImages.toLocaleString()} images hashed
        {etaSeconds != null && ` · ${formatEta(etaSeconds)}`}
      </p>
    </div>
  );
}
