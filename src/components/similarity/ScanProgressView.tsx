import { Progress } from '@/components/ui/ui/progress';
import { Button } from '@/components/ui/ui/button';
import type { ScanJob } from '@/types/similarity';
import { Loader2 } from 'lucide-react';

interface ScanProgressViewProps {
  scan: ScanJob;
  onCancel: () => void;
}

export function ScanProgressView({ scan, onCancel }: ScanProgressViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-6">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />

      <div className="w-full space-y-3 text-center">
        <p className="text-sm font-medium">
          Scanning {scan.total_images.toLocaleString()} images...
        </p>

        <div className="space-y-1.5">
          <Progress value={scan.progress} className="h-2" />
          <p className="text-xs text-muted-foreground tabular-nums">
            {Math.round(scan.progress)}%
          </p>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            Found <span className="font-medium text-foreground">{scan.clusters_found}</span>{' '}
            {scan.clusters_found === 1 ? 'group' : 'groups'} so far
          </p>
          {scan.eta_seconds > 0 && (
            <p>Estimated: ~{scan.eta_seconds}s left</p>
          )}
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onCancel}>
        Cancel scan
      </Button>
    </div>
  );
}
