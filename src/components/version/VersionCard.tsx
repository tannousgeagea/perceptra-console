import { useState } from "react";
import { Card } from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import { Edit2, Eye,Trash2, MoreVertical, CheckCircle2, Clock, AlertCircle, Loader2, Settings, Download } from "lucide-react";
import { DatasetVersion } from "@/types/version";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";

interface VersionCardProps {
  version: DatasetVersion;
  onViewDetails: (version: DatasetVersion) => void;
  onEdit: (version: DatasetVersion) => void;
  onDelete: (version: DatasetVersion) => void;
  isDeleting: boolean;
  onDownload: (version: DatasetVersion) => void;
  onExport: (version: DatasetVersion) => void;
}

export function VersionCard({ version, onViewDetails, onEdit, onDelete, isDeleting, onDownload, onExport }: VersionCardProps) {

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const getStatusIcon = () => {
    switch (version.export_status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (version.export_status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {version.version_name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant()} className="shadow-sm">
              {version.export_status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(version)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>

                {version.is_ready ? (
                  <DropdownMenuItem onClick={() => onDownload(version)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onExport(version)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(version)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>


        {version.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{version.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-lg bg-accent/50 border border-border/50">
            <div className="text-xs text-muted-foreground mb-1.5">Format</div>
            <Badge variant="outline" className="font-mono">{version.export_format.toUpperCase()}</Badge>
          </div>
          <div className="p-3 rounded-lg bg-accent/50 border border-border/50">
            <div className="text-xs text-muted-foreground mb-1.5">File Size</div>
            <div className="text-sm font-medium">{formatFileSize(version.file_size)}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20 hover:bg-success/15 transition-colors">
            <div className="text-xs text-muted-foreground mb-1.5">Train</div>
            <div className="text-lg font-bold text-success">{version.train_count}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
            <div className="text-xs font-medium text-primary mb-1.5">Val</div>
            <div className="text-xl font-bold text-primary">{version.val_count}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20 hover:bg-warning/15 transition-colors">
            <div className="text-xs font-medium text-warning mb-1.5">Test</div>
            <div className="text-xl font-bold text-warning">{version.test_count}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <span className="text-xs font-medium text-muted-foreground">
            {version.total_images} images • {version.total_annotations} annotations
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
          </span>
        </div>
      </Card>

      <DeleteConfirmDialog
        title="Delete Version"
        description={
          <>
            Are you sure you want to delete <b>{version.version_name}</b>? 
            This action cannot be undone. Type the version name below to confirm:
          </>
        }
        confirmText={version.version_name}
        onConfirm={() => onDelete(version)}
        isLoading={isDeleting}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
