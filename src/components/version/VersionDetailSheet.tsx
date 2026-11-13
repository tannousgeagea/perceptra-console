
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import { Download, FileText, Calendar, User, Package, Images, Settings } from "lucide-react";
import { DatasetVersion } from "@/types/version";
import { useVersionStatistics } from "@/hooks/useDatasetVersions";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { VersionImagesManager } from "./VersionImageManager";
import { isExported, notExportedSummary, versionImagesLabel } from "./exportSummary";

interface VersionDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  version: DatasetVersion | null;
  onDownload: (version: DatasetVersion) => void;
}

export function VersionDetailSheet({ open, onOpenChange, projectId, version, onDownload }: VersionDetailSheetProps) {
  const { data: stats, isLoading } = useVersionStatistics(projectId, version?.version_id);
  // Split bars are shares of the exported images (augmented copies are in no split).
  const splitTotal = version ? version.train_count + version.val_count + version.test_count : 0;
  const splitPct = (n: number) => (splitTotal > 0 ? (n / splitTotal) * 100 : 0);
  const notExported = version ? notExportedSummary(version) : null;

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
      <CustomSheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <CustomSheetHeader>
          <CustomSheetTitle className="flex items-center justify-between">
            <span>{version.version_name}</span>
            <Badge variant="outline">{version.export_format.toUpperCase()}</Badge>
          </CustomSheetTitle>
          <CustomSheetDescription>
            Version {version.version_number} • Created {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
          </CustomSheetDescription>
        </CustomSheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <Images className="h-4 w-4" />
              Images
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Status */}
            <div>
              <h3 className="text-sm font-medium mb-3">Status</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className={`capitalize font-medium ${getStatusColor()}`}>
                  {version.export_status}
                </span>
                {version.is_ready && (
                  <Button onClick={() => onDownload(version)} size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Export & Download
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
              <h3 className="text-sm font-medium mb-3">{isExported(version) ? "Export split" : "Split"}</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Train</span>
                    <span className="font-medium">{version.train_count} images</span>
                  </div>
                  <Progress value={splitPct(version.train_count)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Validation</span>
                    <span className="font-medium">{version.val_count} images</span>
                  </div>
                  <Progress value={splitPct(version.val_count)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Test</span>
                    <span className="font-medium">{version.test_count} images</span>
                  </div>
                  <Progress value={splitPct(version.test_count)} className="h-2" />
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
                    <div className="text-xs text-muted-foreground mb-1">Images in version</div>
                    <div className="text-xl font-bold">{version.images_in_version ?? stats?.total_images ?? 0}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">{isExported(version) ? "Images exported" : "Images"}</div>
                    <div className="text-xl font-bold">{stats?.total_images || 0}</div>
                    {(version.augmented_images ?? 0) > 0 && (
                      <div className="text-xs text-muted-foreground mt-0.5">incl. {version.augmented_images} augmented</div>
                    )}
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">{isExported(version) ? "Annotations exported" : "Annotations"}</div>
                    <div className="text-xl font-bold">{stats?.total_annotations || 0}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Avg annotations per image</div>
                    <div className="text-xl font-bold">{stats?.average_annotations_per_image.toFixed(1) || 0}</div>
                  </div>
                </div>
              )}
              {isExported(version) && notExported && (
                <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm space-y-1">
                  <p className="font-medium">
                    {notExported.total.toLocaleString()} of {versionImagesLabel(version).replace(" in version", "")} {notExported.total === 1 ? "isn't" : "aren't"} exported: only images with ground-truth labels are.
                  </p>
                  {notExported.reasons.map((reason) => (
                    <p key={reason} className="text-muted-foreground">{reason}</p>
                  ))}
                </div>
              )}
              {version.changed_since_export && (
                <p className="mt-3 text-sm text-warning">
                  Images were added or removed since the last export. Export again to update the file; the numbers above describe the last export.
                </p>
              )}
            </div>

            {/* Class Distribution */}
            {stats && Object.keys(stats.class_distribution).length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Class Distribution
                  {(version.augmented_images ?? 0) > 0 && (
                    <span className="font-normal text-muted-foreground"> (before augmentation)</span>
                  )}
                </h3>
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
          </TabsContent>

          <TabsContent value="images" className="mt-6">
            <VersionImagesManager 
              projectId={projectId}
              versionId={version.version_id} 
              versionName={version.version_name}
            />
          </TabsContent>
        </Tabs>
      </CustomSheetContent>
    </CustomSheet>
  );
}