import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/ui/table";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import { Download, Eye, MoreVertical, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { DatasetVersion } from "@/types/version";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface VersionTableProps {
  versions: DatasetVersion[];
  onViewDetails: (version: DatasetVersion) => void;
  onEdit: (version: DatasetVersion) => void;
  onDelete: (version: DatasetVersion) => void;
  onDownload: (version: DatasetVersion) => void;
}

export function VersionTable({ versions, onViewDetails, onEdit, onDelete, onDownload }: VersionTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Format</TableHead>
            <TableHead className="text-center">Train</TableHead>
            <TableHead className="text-center">Val</TableHead>
            <TableHead className="text-center">Test</TableHead>
            <TableHead className="text-right">Total Images</TableHead>
            <TableHead className="text-right">Annotations</TableHead>
            <TableHead className="text-right">File Size</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((version) => (
            <TableRow key={version.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <div>
                  <div className="font-medium">{version.version_name}</div>
                  {version.description && (
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {version.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(version.export_status)}
                  <span className="capitalize text-sm">{version.export_status}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{version.export_format.toUpperCase()}</Badge>
              </TableCell>
              <TableCell className="text-center font-medium">{version.train_count}</TableCell>
              <TableCell className="text-center font-medium">{version.val_count}</TableCell>
              <TableCell className="text-center font-medium">{version.test_count}</TableCell>
              <TableCell className="text-right">{version.total_images}</TableCell>
              <TableCell className="text-right">{version.total_annotations}</TableCell>
              <TableCell className="text-right">{formatFileSize(version.file_size)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(version)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {version.is_ready && (
                      <DropdownMenuItem onClick={() => onDownload(version)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(version)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(version)} className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}