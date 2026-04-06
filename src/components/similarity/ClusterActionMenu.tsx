import { Button } from '@/components/ui/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/ui/dropdown-menu';
import { MoreVertical, Shield, Trash2, CheckCircle, Star, FolderPlus } from 'lucide-react';

interface ClusterActionMenuProps {
  context: 'upload' | 'datalake';
  onKeepRepresentative?: () => void;
  onKeepAll?: () => void;
  onDiscardAll?: () => void;
  onArchiveDuplicates?: () => void;
  onDeleteDuplicates?: () => void;
  onMarkReviewed?: () => void;
  onAddToDataset?: () => void;
}

export function ClusterActionMenu({
  context,
  onKeepRepresentative,
  onKeepAll,
  onDiscardAll,
  onArchiveDuplicates,
  onDeleteDuplicates,
  onMarkReviewed,
  onAddToDataset,
}: ClusterActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Cluster actions">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {context === 'upload' && (
          <>
            <DropdownMenuItem onClick={onKeepRepresentative}>
              <Star className="w-4 h-4 mr-2" />
              Keep only representative
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onKeepAll}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Keep all
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDiscardAll} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Discard all
            </DropdownMenuItem>
          </>
        )}

        {context === 'datalake' && (
          <>
            <DropdownMenuItem onClick={onArchiveDuplicates}>
              <Shield className="w-4 h-4 mr-2" />
              Archive duplicates
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMarkReviewed}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as reviewed
            </DropdownMenuItem>
            {onAddToDataset && (
              <DropdownMenuItem onClick={onAddToDataset}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Add representative to dataset
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDeleteDuplicates} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete duplicates
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
