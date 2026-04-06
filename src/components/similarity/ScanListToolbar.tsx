import { Button } from '@/components/ui/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';
import { RefreshCw } from 'lucide-react';
import type { ScanHistoryStatus, HashAlgorithm } from '@/types/similarity';
import { cn } from '@/lib/utils';

const STATUS_TABS: { value: ScanHistoryStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface ScanListToolbarProps {
  activeStatus: ScanHistoryStatus | 'all';
  onStatusChange: (status: ScanHistoryStatus | 'all') => void;
  scope: 'all' | 'datalake' | 'project';
  onScopeChange: (scope: 'all' | 'datalake' | 'project') => void;
  algorithm: HashAlgorithm | 'all';
  onAlgorithmChange: (algo: HashAlgorithm | 'all') => void;
  onRefresh: () => void;
  statusCounts?: Record<string, number>;
}

export function ScanListToolbar({
  activeStatus,
  onStatusChange,
  scope,
  onScopeChange,
  algorithm,
  onAlgorithmChange,
  onRefresh,
  statusCounts,
}: ScanListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === 'all'
            ? statusCounts?.total
            : statusCounts?.[tab.value];
          return (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activeStatus === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {count != null && (
                <span className="ml-1.5 text-xs text-muted-foreground">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right filters */}
      <div className="flex items-center gap-2">
        <Select value={scope} onValueChange={(v) => onScopeChange(v as 'all' | 'datalake' | 'project')}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="All scopes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All scopes</SelectItem>
            <SelectItem value="datalake">Datalake</SelectItem>
            <SelectItem value="project">Project</SelectItem>
          </SelectContent>
        </Select>

        <Select value={algorithm} onValueChange={(v) => onAlgorithmChange(v as HashAlgorithm | 'all')}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="All algorithms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All algorithms</SelectItem>
            <SelectItem value="ahash">ahash</SelectItem>
            <SelectItem value="phash">phash</SelectItem>
            <SelectItem value="dhash">dhash</SelectItem>
            <SelectItem value="whash">whash</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="h-9 w-9" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
