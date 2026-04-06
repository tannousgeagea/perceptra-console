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
import { useNavigate } from 'react-router-dom';

interface ScanRowKebabMenuProps {
  scan: ScanSummary;
  onToggleExpand: () => void;
  onCancelRequest: () => void;
}

export function ScanRowKebabMenu({ scan, onToggleExpand, onCancelRequest }: ScanRowKebabMenuProps) {
  const { user } = useAuth();
  if (!user) return null;
  const navigate = useNavigate();
  const canCancel = (scan.status === 'pending' || scan.status === 'running') &&
    (user.role === 'admin' || user.role === 'owner');

  const copyId = () => {
    navigator.clipboard.writeText(scan.scan_id);
    toast.success('Scan ID copied');
  };

  const rerun = () => {
    const params = new URLSearchParams({
      algorithm: scan.algorithm,
      threshold: String(scan.similarity_threshold),
      scope: scan.scope,
    });
    if (scan.project_id) params.set('project_id', scan.project_id);
    navigate(`/similarity?${params.toString()}`);
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
        {(user.role !== 'viewer') && (
          <DropdownMenuItem onClick={rerun}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Re-run with same settings
          </DropdownMenuItem>
        )}
        {canCancel && (
          <DropdownMenuItem onClick={onCancelRequest} className="text-destructive focus:text-destructive">
            <Ban className="mr-2 h-4 w-4" />
            Cancel Scan
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
