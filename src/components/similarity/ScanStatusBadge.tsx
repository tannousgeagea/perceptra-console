import { Badge } from '@/components/ui/ui/badge';
import { Clock, Loader2, CheckCircle2, XCircle, Ban } from 'lucide-react';
import type { ScanHistoryStatus } from '@/types/similarity';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<ScanHistoryStatus, {
  icon: React.ElementType;
  label: string;
  className: string;
}> = {
  pending: {
    icon: Clock,
    label: 'Pending',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  running: {
    icon: Loader2,
    label: 'Running',
    className: 'bg-primary/15 text-primary border-primary/30',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    className: 'bg-success/15 text-success border-success/30',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  cancelled: {
    icon: Ban,
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

interface ScanStatusBadgeProps {
  status: ScanHistoryStatus;
}

export function ScanStatusBadge({ status }: ScanStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1 font-medium', config.className)}>
      <Icon className={cn('h-3 w-3', status === 'running' && 'animate-spin')} />
      {config.label}
    </Badge>
  );
}
