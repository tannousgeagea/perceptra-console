import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/ui/tooltip';
import { Loader2 } from 'lucide-react';
import type { ScanSummary } from '@/types/similarity';
import { HASH_ALGORITHMS } from '@/types/similarity';
import { ScanStatusBadge } from './ScanStatusBadge';
import { ScanProgressBar } from './ScanProgressBar';
import { ScanExpandedDetail } from './ScanExpandedDetail';
import { ScanRowKebabMenu } from './ScanRowKebabMenu';
import { ScanCancelDialog } from './ScanCancelDialog';
import { useScan, useCancelScan } from '@/hooks/useSimilarity';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ALGO_COLORS: Record<string, string> = {
  ahash: 'bg-primary/10 text-primary border-primary/20',
  phash: 'bg-[hsl(172_66%_40%)]/10 text-[hsl(172_66%_40%)] border-[hsl(172_66%_40%)]/20',
  dhash: 'bg-warning/10 text-warning border-warning/20',
  whash: 'bg-[hsl(270_60%_55%)]/10 text-[hsl(270_60%_55%)] border-[hsl(270_60%_55%)]/20',
};

function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return '';
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

interface ScanRowProps {
  scan: ScanSummary;
  autoExpand?: boolean;
}

export function ScanRow({ scan: initialScan, autoExpand = false }: ScanRowProps) {
  const [expanded, setExpanded] = useState(autoExpand);
  const [cancelOpen, setCancelOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isLive = initialScan.status === 'running' || initialScan.status === 'pending';
  const { data: liveScan } = useScan(initialScan.scan_id, { poll: isLive });
  const cancelMutation = useCancelScan();

  // Only toast if the scan was actively live when this component mounted.
  // This prevents showing toast for every completed scan visible on page load.
  const wasLiveRef = useRef(isLive);

  useEffect(() => {
    if (!wasLiveRef.current) return;
    const s = liveScan?.status;
    if (!s || s === 'running' || s === 'pending') return;
    if (s === 'completed') {
      toast.success(`Scan finished — ${liveScan.clusters_found} clusters found`);
    } else if (s === 'failed') {
      toast.error('Scan failed — see error log');
    }
    queryClient.invalidateQueries({ queryKey: ['similarity'] });
  }, [liveScan?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const scan = (isLive && liveScan) ? liveScan : initialScan;

  const algoInfo = HASH_ALGORITHMS.find((a) => a.value === scan.algorithm);
  const shortId = scan.scan_id.slice(0, 8);
  const threshold = `${(scan.similarity_threshold * 100).toFixed(0)}%`;

  const handleCancel = () => {
    cancelMutation.mutate(scan.scan_id);
    setCancelOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent
          className="p-4 cursor-pointer"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('[role="menuitem"]')) return;
            setExpanded((p) => !p);
          }}
        >
          {/* Row 1: Status + ID + chips */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <ScanStatusBadge status={scan.status} />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono text-sm font-medium text-foreground">
                    Scan #{shortId}…
                  </span>
                </TooltipTrigger>
                <TooltipContent>{scan.scan_id}</TooltipContent>
              </Tooltip>
              <Badge variant="outline" className="text-xs">
                {scan.scope === 'datalake' ? 'Datalake' : 'Project'}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className={cn('font-mono text-xs', ALGO_COLORS[scan.algorithm])}>
                    {scan.algorithm}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{algoInfo?.description}</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              {isLive && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              <ScanRowKebabMenu
                scan={scan}
                onToggleExpand={() => setExpanded((p) => !p)}
                onCancelRequest={() => setCancelOpen(true)}
              />
            </div>
          </div>

          {/* Row 2: Stats */}
          <div className="mt-2 text-sm text-muted-foreground">
            <span>{scan.total_images.toLocaleString()} images scanned</span>
            <span className="mx-1.5">·</span>
            <span>{scan.clusters_found.toLocaleString()} clusters found</span>
            {scan.status === 'completed' && (
              <>
                <span className="mx-1.5">·</span>
                <span>
                  {scan.clusters_found > 0
                    ? `${(scan.hashed_images - scan.clusters_found).toLocaleString()} duplicates`
                    : '0 duplicates'}
                </span>
              </>
            )}
          </div>

          {/* Row 3: Progress bar (running/pending only) */}
          {(scan.status === 'running' || scan.status === 'pending') && (
            <div className="mt-3">
              <ScanProgressBar
                status={scan.status}
                progress={scan.progress}
                hashedImages={scan.hashed_images}
                totalImages={scan.total_images}
                etaSeconds={scan.eta_seconds}
              />
            </div>
          )}

          {/* Row 4: Metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              Initiated by{' '}
              <span className="font-medium text-foreground">
                @{scan.initiated_by ?? 'Unknown'}
              </span>
              {' · '}
              {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
            </span>
            {scan.started_at && (
              <span>Started: {format(new Date(scan.started_at), 'MMM d HH:mm')}</span>
            )}
            {scan.completed_at && (
              <span>
                Completed: {format(new Date(scan.completed_at), 'MMM d HH:mm')}
                {' · '}Duration: {formatDuration(scan.started_at, scan.completed_at)}
              </span>
            )}
            <span>Threshold: {threshold}</span>
          </div>

          {/* Row 5: Actions */}
          <div className="mt-3 flex items-center justify-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    size="sm"
                    disabled={scan.status !== 'completed'}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/similarity/scans/${scan.scan_id}/results`);
                    }}
                  >
                    View Results
                  </Button>
                </span>
              </TooltipTrigger>
              {scan.status !== 'completed' && (
                <TooltipContent>Results available after scan completes</TooltipContent>
              )}
            </Tooltip>
          </div>
        </CardContent>

        {/* Expanded detail */}
        {expanded && <ScanExpandedDetail scan={scan} />}
      </Card>

      <ScanCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancel}
        isLoading={cancelMutation.isPending}
      />
    </>
  );
}
