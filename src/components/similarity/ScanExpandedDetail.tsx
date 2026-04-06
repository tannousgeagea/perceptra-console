import { format } from 'date-fns';
import type { ScanSummary } from '@/types/similarity';
import { HASH_ALGORITHMS } from '@/types/similarity';
import { Button } from '@/components/ui/ui/button';
import { Copy, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/ui/collapsible';

interface ScanExpandedDetailProps {
  scan: ScanSummary;
}

function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return '—';
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function formatTs(ts: string | null): string {
  if (!ts) return '—';
  return format(new Date(ts), 'MMM d, yyyy HH:mm:ss');
}

export function ScanExpandedDetail({ scan }: ScanExpandedDetailProps) {
  const algoInfo = HASH_ALGORITHMS.find((a) => a.value === scan.algorithm);

  const copyId = () => {
    navigator.clipboard.writeText(scan.scan_id);
    toast.success('Scan ID copied');
  };

  const fields = [
    { label: 'Scan ID', value: (
      <span className="inline-flex items-center gap-1 font-mono text-xs">
        {scan.scan_id}
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={copyId}>
          <Copy className="h-3 w-3" />
        </Button>
      </span>
    )},
    { label: 'Status', value: `${scan.status} — ${formatTs(scan.status === 'completed' ? scan.completed_at : scan.status === 'failed' ? scan.completed_at : scan.started_at)}` },
    { label: 'Algorithm', value: `${scan.algorithm}${algoInfo ? ` — ${algoInfo.description}` : ''}` },
    { label: 'Similarity threshold', value: `${(scan.similarity_threshold * 100).toFixed(0)}% → Hamming distance ${scan.hamming_threshold} / 64` },
    { label: 'Scope', value: scan.scope === 'datalake' ? 'Datalake' : `Project ${scan.project_id ?? ''}` },
    { label: 'Images processed', value: `${scan.hashed_images.toLocaleString()} of ${scan.total_images.toLocaleString()}` },
    { label: 'Clusters found', value: scan.clusters_found.toLocaleString() },
    { label: 'Initiated by', value: scan.initiated_by ? `@${scan.initiated_by}` : 'Unknown' },
    { label: 'Created at', value: formatTs(scan.created_at) },
    { label: 'Started at', value: formatTs(scan.started_at) },
    { label: 'Completed at', value: formatTs(scan.completed_at) },
    { label: 'Duration', value: formatDuration(scan.started_at, scan.completed_at) },
  ];

  return (
    <div className="border-t border-border bg-muted/30 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        {fields.map((f) => (
          <div key={f.label} className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">{f.label}</span>
            <span className="text-right font-medium">{f.value}</span>
          </div>
        ))}
      </div>

      {scan.status === 'failed' && scan.error_log && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium text-destructive">
            <ChevronDown className="h-4 w-4" />
            Error details
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 max-h-[200px] overflow-auto rounded border border-destructive/30 bg-destructive/5 p-3 font-mono text-xs text-destructive">
              {scan.error_log}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
