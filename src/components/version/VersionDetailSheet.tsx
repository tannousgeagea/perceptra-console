
import {
  CustomSheet,
  CustomSheetContent,
  CustomSheetDescription,
  CustomSheetHeader,
  CustomSheetTitle,
} from "@/components/common/CustomSheet";

import { Button } from "@/components/ui/ui/button";
import { Badge } from "@/components/ui/ui/badge";
import { Progress } from "@/components/ui/ui/progress";
import { Download, FileText, Calendar, User, Package } from "lucide-react";
import { DatasetVersion } from "@/types/version";
import { useVersionStatistics } from "./useDatasetVersions";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface VersionDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: DatasetVersion | null;
  onDownload: (version: DatasetVersion) => void;
}

export function VersionDetailSheet({ open, onOpenChange, version, onDownload }: VersionDetailSheetProps) {
  const { data: stats, isLoading } = useVersionStatistics(version?.id || '');

  if (!version) return null;

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusColor = () => {
    switch (version.export_status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <CustomSheet open={open} onOpenChange={onOpenChange}>
      <CustomSheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <CustomSheetHeader>
          <CustomSheetTitle className="flex items-center justify-between">
            <span>{version.version_name}</span>
            <Badge variant="outline">{version.export_format.toUpperCase()}</Badge>
          </CustomSheetTitle>
          <CustomSheetDescription>
            Version {version.version_number} • Created {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
          </CustomSheetDescription>
        </CustomSheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div>
            <h3 className="text-sm font-medium mb-3">Status</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className={`capitalize font-medium ${getStatusColor()}`}>
                {version.export_status}
              </span>
              {version.is_ready && (
                <Button onClick={() => onDownload(version)} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          {version.description && (
            <div>
              <h3 className="text-sm font-medium mb-3">Description</h3>
              <p className="text-sm text-muted-foreground p-4 border rounded-lg">
                {version.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div>
            <h3 className="text-sm font-medium mb-3">Metadata</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created by:</span>
                <span className="font-medium">{version.created_by || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{new Date(version.created_at).toLocaleString()}</span>
              </div>
              {version.exported_at && (
                <div className="flex items-center gap-3 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Exported:</span>
                  <span className="font-medium">{new Date(version.exported_at).toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">File size:</span>
                <span className="font-medium">{formatFileSize(version.file_size)}</span>
              </div>
            </div>
          </div>

          {/* Split Distribution */}
          <div>
            <h3 className="text-sm font-medium mb-3">Split Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Train</span>
                  <span className="font-medium">{version.train_count} images</span>
                </div>
                <Progress value={(version.train_count / version.total_images) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Validation</span>
                  <span className="font-medium">{version.val_count} images</span>
                </div>
                <Progress value={(version.val_count / version.total_images) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Test</span>
                  <span className="font-medium">{version.test_count} images</span>
                </div>
                <Progress value={(version.test_count / version.total_images) * 100} className="h-2" />
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-sm font-medium mb-3">Statistics</h3>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Total Images</div>
                  <div className="text-xl font-bold">{stats?.total_images || 0}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Total Annotations</div>
                  <div className="text-xl font-bold">{stats?.total_annotations || 0}</div>
                </div>
                <div className="p-3 border rounded-lg col-span-2">
                  <div className="text-xs text-muted-foreground mb-1">Avg Annotations/Image</div>
                  <div className="text-xl font-bold">{stats?.average_annotations_per_image.toFixed(1) || 0}</div>
                </div>
              </div>
            )}
          </div>

          {/* Class Distribution */}
          {stats?.class_distribution && (
            <div>
              <h3 className="text-sm font-medium mb-3">Class Distribution</h3>
              <div className="space-y-2">
                {Object.entries(stats.class_distribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([className, count]) => (
                    <div key={className} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{className}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CustomSheetContent>
    </CustomSheet>
  );
}