import { useState } from "react";
import { DatasetVersionsHeader } from "@/components/version/DatasetVersionHeader";
import { VersionCard } from "@/components/version/VersionCard";
import { VersionTable } from "@/components/version/VersionTable";
import { CreateVersionDialog } from "@/components/version/CreateVersionDialog";
import { VersionDetailSheet } from "@/components/version/VersionDetailSheet";
import { ExportConfigDialog } from "@/components/version/ExportConfigDialog";
import { useProjectVersions, useDeleteProjectVersion, useDownloadDataset, downloadDataset } from "@/hooks/useDatasetVersions";
import { useExportVersion } from "@/components/version/useDatasetVersions";
import { useExportDataset } from "@/hooks/useDatasetVersions";
import { ExportConfig } from "@/types/version";
import { DatasetVersion } from "@/types/version";
import { Input } from "@/components/ui/ui/input";
import { Button } from "@/components/ui/ui/button";
import { Search, Grid3x3, Table as TableIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { useParams } from "react-router-dom";
import { toast } from 'sonner';

export default function DatasetVersions() {
  const [searchText, setSearchText] = useState("");
  const { projectId } = useParams<{ projectId: string }>();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editVersion, setEditVersion] = useState<DatasetVersion | null>(null);
  const [detailVersion, setDetailVersion] = useState<DatasetVersion | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const { data, isLoading, refetch } = useProjectVersions(projectId!);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportVersion, setExportVersion] = useState<DatasetVersion | null>(null);

  const { mutate: exportDataset } = useExportDataset(projectId!); 
  const { mutateAsync: deleteVersion, isPending: isDeleting } = useDeleteProjectVersion(projectId!)
  const { mutate: downloadDataset } = useDownloadDataset(projectId!);

  const query = searchText.toLowerCase();
  const filtered_data = data?.versions.filter(v => 
      v.version_name.toLowerCase().includes(query) ||
      v.description?.toLowerCase().includes(query) ||
      v.export_format.toLowerCase().includes(query)
    );
  const handleRefresh = () => {
    refetch()
    toast.info("Dataset versions list has been refreshed.");
  };

  const handleEdit = (version: DatasetVersion) => {
    setEditVersion(version);
    setCreateDialogOpen(true);
  };

  const handleDelete = (version: DatasetVersion) => {
    deleteVersion(version.version_id)
    toast.info(`${version.version_name} has been deleted.`);
  };

  const handleExpoortClick = (version: DatasetVersion) => {
    setExportVersion(version);
    setExportDialogOpen(true);
  };  

  const handleExport = async (config: ExportConfig) => {
    if (!exportVersion) return;
    exportDataset({ versionId: exportVersion.version_id, config })
  };

  const handleDownload = (version: DatasetVersion) => {
    downloadDataset(version.version_id)
  };

  const handleViewDetails = (version: DatasetVersion) => {
    setDetailVersion(version);
    setDetailSheetOpen(true);
  };

  const readyCount = data?.versions.filter(v => v.export_status === 'completed').length || 0;
  const processingCount = data?.versions.filter(v => v.export_status === 'processing').length || 0;

  return (
    <div className="min-h-screen w-full bg-background">
      <DatasetVersionsHeader
        projectId={projectId!}
        totalVersions={data?.total || 0}
        readyVersions={readyCount}
        processingVersions={processingCount}
        onRefresh={handleRefresh}
        onCreateVersion={() => {
          setEditVersion(null);
          setCreateDialogOpen(true);
        }}
      />

      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search versions by name, description, or format..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : data?.versions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No dataset versions found.</p>
            <Button onClick={() => setCreateDialogOpen(true)}>Create Your First Version</Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered_data?.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={isDeleting}
                onDownload={handleDownload}
                onExport={handleExpoortClick}
              />
            ))}
          </div>
        ) : (
          <VersionTable
            versions={data?.versions || []}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDownload={handleDownload}
          />
        )}
      </div>

      <CreateVersionDialog
        projectId={projectId!}
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditVersion(null);
        }}
        editVersion={editVersion}
      />

      <VersionDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        version={detailVersion}
        projectId={projectId!}
        onDownload={handleDownload}
      />

      <ExportConfigDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        version={exportVersion}
        onExport={handleExport}
      />

    </div>
  );
}