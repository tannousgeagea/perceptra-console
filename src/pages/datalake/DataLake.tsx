
import React, { useState, useCallback } from "react";
import { useImages, buildImageQuery } from "@/hooks/useImages";
import { ImageGrid } from "@/components/datalake/ImageGrid";
import { ImageTable } from "@/components/datalake/ImageTable";
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ViewMode, ImagesParams } from "@/types/image";
import { useAddImagesToProject } from '@/hooks/useAddImagesToProject';
import { useSearchParser } from '@/hooks/useSearchParser';
import { DataLakeHeader } from '@/components/datalake/DataLakeHeader';
import { DataLakeFilters } from '@/components/datalake/DataLakeFilters';
import { useBulkOperations } from '@/hooks/useBulkOperation';
import { useUserProjects } from '@/hooks/useUserProjects';
import { PaginationControls } from "@/components/ui/ui/pagination-control";
import { BulkOperationBar } from '@/components/ui/ui/bulk-operation-bar';
import { SelectAllMatchingBanner } from '@/components/ui/ui/select-all-matching-banner';
import { useSelectAllMatching } from '@/hooks/useSelectAllMatching';
import { Button } from '@/components/ui/ui/button';
import { FolderPlus, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';

import { ScanConfigDrawer } from '@/components/similarity/ScanConfigDrawer';
import { ScanResultsPanel } from '@/components/similarity/ScanResultsPanel';
import { useSimilarityScan } from '@/hooks/useSimilarityScan';
import { useSimilarityStore } from '@/stores/similarityStore';

const DataLake: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const { toast } = useToast();

  const { operation, runBulkDeleteImages, runBulkTag, cancelOperation, clearOperation } = useBulkOperations();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const { mutate: addImagesToProject } = useAddImagesToProject();

  const parsedQuery = useSearchParser(searchText);
  const _query = buildImageQuery(parsedQuery)

  // Build API params from parsed query
  const apiParams: ImagesParams = {
    limit: itemsPerPage,
    skip: (currentPage - 1) * itemsPerPage,
    q: _query,
    search: parsedQuery.text,
    tag: parsedQuery.tags.join(','),
  };

  const { data, isLoading, error } = useImages(apiParams);
  const { data: projects, isLoading: isLoadingProjects, error: errorProjects } = useUserProjects();

  const pageIds = data?.images.map((img) => img.id) ?? [];
  const selection = useSelectAllMatching({
    pageIds,
    totalMatching: data?.total ?? 0,
    allMatchingIds: data?.image_ids,
    resetKey: `${searchText}|${itemsPerPage}`,
  });

  // Similarity scan
  const scan = useSimilarityScan();
  const [scanDrawerOpen, setScanDrawerOpen] = useState(false);
  const handleFindDuplicates = useCallback(() => {
    setScanDrawerOpen(true);
  }, []);
  const handleStartScan = useCallback(() => {
    scan.startScan(scan.scanConfig);
  }, [scan]);
  const handleRerunScan = useCallback(() => {
    scan.setResultsOpen(false);
    scan.resetScan();
    setScanDrawerOpen(true);
  }, [scan]);

  const handleBulkDelete = useCallback(async () => {
    const selectedImageUUIDs = Array.from(selection.selectedIds)

    if (!selectedImageUUIDs) return null;
    const ids = Array.from(selectedImageUUIDs)
    try {
      await runBulkDeleteImages(ids);
      toast({ title: 'Deletion Complete', description: `${ids.length} images deleted.` });
      selection.clear();
    } catch {
      toast({ title: 'Deletion Failed', variant: 'destructive' });
    }
  }, [selection, runBulkDeleteImages, toast]);

  const handleBulkTag = useCallback(async (tags: string[]) => {
    const selectedImageUUIDs = Array.from(selection.selectedIds)

    if (!selectedImageUUIDs) return null;
    try {
      await runBulkTag(selectedImageUUIDs, tags);
      toast({ title: 'Tagging Complete', description: `Tags applied to ${selectedImageUUIDs.length} images.` });
      selection.clear()
    } catch {
      toast({ title: 'Tagging Failed', variant: 'destructive' });
    }
  }, [selection, runBulkTag, toast]);


  const handleAddToProject = () => {
    if (selection.selectedCount === 0 || !selectedProject) {
      toast({
        title: 'Selection required',
        description: 'Please select images and a project first.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    addImagesToProject(
      {
        project_id: selectedProject,
        image_ids: Array.from(selection.selectedIds),
      },
      {
        onSuccess: () => {
          // Clear selections after successful addition
          selection.clear()
          setSelectedProject('');
        },
      }
    );
  };


  console.log(selection.selectedIds)
  console.log(selection.selectedCount)

  if (error || errorProjects) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">Error loading images</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 w-full">
      <DataLakeHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalImages={data?.total || 0}
        onFindDuplicates={handleFindDuplicates}
      />

      <DataLakeFilters searchText={searchText} onSearchChange={setSearchText} />

      <BulkOperationBar
        selectedCount={selection.selectedCount}
        totalCount={data?.images.length || 0}
        onSelectAll={selection.togglePage}
        onClearSelection={selection.clear}
        actions={[
          {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'destructive',
            requiresConfirm: true,
            confirmTitle: `Delete ${selection.selectedCount} images?`,
            confirmDescription: 'This action cannot be undone. The selected images will be permanently removed from the data lake.',
            onClick: handleBulkDelete,
          },
        ]}
        bulkOperation={operation}
        onCancelOperation={cancelOperation}
        onOperationComplete={clearOperation}
        onBulkTag={handleBulkTag}
        extraContent={
          <div className="flex items-center gap-2">
            <Select onValueChange={handleAddToProject}>
              <SelectTrigger className="w-[180px] bg-primary-foreground text-foreground h-9 text-sm">
                <FolderPlus className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Add to project..." />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.project_id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => toast({ title: 'Download started', description: `Downloading ${selection.selectedCount} images...` })}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        }
      />

      <SelectAllMatchingBanner
        showSelectAllMatchingPrompt={selection.showSelectAllMatchingPrompt}
        allMatchingSelected={selection.allMatchingSelected}
        selectedCount={selection.selectedCount}
        pageSize={pageIds.length}
        totalMatching={data?.total ?? 0}
        onSelectAllMatching={selection.selectAllMatching}
        onClear={selection.clear}
      />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !data?.images.length ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">No images found</p>
            <p className="text-sm text-muted-foreground">
              {searchText ? 'Try adjusting your search filters' : 'Upload images to get started'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <ImageGrid images={data.images} selectedIds={selection.selectedIds} onSelect={selection.toggle} />
          ) : (
            <ImageTable
              images={data.images}
              selectedIds={selection.selectedIds}
              onSelect={selection.toggle}
              onSelectAll={(checked) => (checked ? selection.togglePage() : selection.clear())}
            />)}

          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg py-4 -mx-6 px-6">
            <PaginationControls
              currentPage={currentPage}
              totalItems={data?.total || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onItemsPerPageChange={(perPage) => {
                setItemsPerPage(perPage);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Similarity Scan Drawer */}
          <ScanConfigDrawer
            open={scanDrawerOpen}
            onOpenChange={setScanDrawerOpen}
            config={scan.scanConfig}
            onConfigChange={(cfg) => useSimilarityStore.getState().setScanConfig(cfg)}
            activeScan={scan.activeScan}
            onStartScan={handleStartScan}
            onCancelScan={scan.cancelScan}
          />
          {/* Scan Results Panel */}
          {scan.activeScan?.status === 'completed' && (
            <ScanResultsPanel
              open={scan.resultsOpen}
              onClose={() => scan.setResultsOpen(false)}
              scan={scan.activeScan}
              clusters={scan.scanResults}
              totalClusters={scan.scanTotalClusters}
              totalDuplicates={scan.scanTotalDuplicates}
              selectedClusterIds={scan.selectedClusterIds}
              reviewedClusterIds={scan.reviewedClusterIds}
              filter={scan.scanFilters.filter}
              sort={scan.scanFilters.sort}
              onFilterChange={scan.setScanFilter}
              onSortChange={scan.setScanSort}
              onToggleCluster={scan.toggleClusterSelection}
              onSelectAll={scan.selectAllClusters}
              onClearSelection={scan.clearClusterSelection}
              onArchiveDuplicates={scan.archiveDuplicates}
              onDeleteDuplicates={scan.deleteDuplicates}
              onMarkReviewed={scan.markReviewed}
              onSetRepresentative={scan.setRepresentative}
              onBulkAction={scan.bulkAction}
              onRerunScan={handleRerunScan}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DataLake;