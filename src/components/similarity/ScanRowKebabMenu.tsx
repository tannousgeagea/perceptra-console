import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/ui/dropdown-menu';
import { Button } from '@/components/ui/ui/button';
import { MoreHorizontal, Eye, Copy, Ban, RotateCcw } from 'lucide-react';
import type { ScanSummary } from '@/types/similarity';
import { toast } from 'sonner';
import { getCurrentUser } from '@/utils/user'
import { useAuth } from '@/contexts/AuthContext';
import { useScanPermissions } from '@/hooks/useScanPermissions';

interface ScanRowKebabMenuProps {
  scan: ScanSummary;
  onToggleExpand: () => void;
  onCancelRequest: () => void;
  /** Opens the scan settings with this scan's settings filled in. */
  onRerun: (scan: ScanSummary) => void;
}

export function ScanRowKebabMenu({ scan, onToggleExpand, onCancelRequest, onRerun }: ScanRowKebabMenuProps) {
  const { user } = useAuth();
  // Editor where the scan looked: in its project, or in the organization for the datalake.
  const { writeReason } = useScanPermissions(scan.project_id);
  if (!user) return null;
  const canCancel = scan.status === 'pending' || scan.status === 'running';

  const copyId = () => {
    navigator.clipboard.writeText(scan.scan_id);
    toast.success('Scan ID copied');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onToggleExpand}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyId}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Scan ID
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRerun(scan)} disabled={!!writeReason} title={writeReason}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Re-run with same settings
        </DropdownMenuItem>
        {canCancel && (
          <DropdownMenuItem
            onClick={onCancelRequest}
            disabled={!!writeReason}
            title={writeReason}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="mr-2 h-4 w-4" />
            Cancel Scan
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
