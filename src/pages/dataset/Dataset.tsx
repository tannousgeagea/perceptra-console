
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectImages } from '@/hooks/useProjectImages';
import { ProjectDatasetHeader } from '@/components/dataset/ProjectDatasetHeader';
import { ProjectDatasetFilters } from '@/components/dataset/ProjectDatasetFilters';
import { ProjectImageGrid } from '@/components/dataset/ProjectImageGrid';
import { ProjectImageTable } from '@/components/dataset/ProjectImageTable';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/ui/alert';
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { useSearchParser } from '@/hooks/useSearchParser';
import { buildImageQuery } from '@/hooks/useImages';
import { PaginationControls } from '@/components/ui/ui/pagination-control';
import { BulkOperationBar } from '@/components/ui/ui/bulk-operation-bar';
import { SelectAllMatchingBanner } from '@/components/ui/ui/select-all-matching-banner';
import { useSelectAllMatching } from '@/hooks/useSelectAllMatching';
import { useBulkOperations } from '@/hooks/useBulkOperation';
import { useToast } from '@/hooks/use-toast';
import { ScanConfigDrawer } from '@/components/similarity/ScanConfigDrawer';
import { ScanResultsPanel } from '@/components/similarity/ScanResultsPanel';
import { useSimilarityScan } from '@/hooks/useSimilarityScan';
import { useSimilarityStore } from '@/stores/similarityStore';

export default function ProjectDataset() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { toast } = useToast();

  const { operation, runBulkReview, runBulkDeleteProject, runBulkTag, cancelOperation, clearOperation } = useBulkOperations(projectId);

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

  const parsedQuery = useSearchParser(searchText);
  const _query = buildImageQuery(parsedQuery)

  const { data, isLoading, error, refetch } = useProjectImages(projectId!, {
    q: _query,
    skip: (currentPage - 1) * itemsPerPage,
    limit: itemsPerPage,
  });

  const pageIds = data?.images.map((img) => img.project_image_id) ?? [];
  const selection = useSelectAllMatching({
    pageIds,
    totalMatching: data?.total ?? 0,
    allMatchingIds: data?.image_ids,
    resetKey: `${searchText}|${itemsPerPage}`,
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleBulkReview = useCallback(async () => {
    const ids = Array.from(selection.selectedIds);
    try {
      await runBulkReview(ids);
      toast({ title: 'Review Complete', description: `${ids.length} images reviewed.` });
      selection.clear();
      refetch();
    } catch {
      toast({ title: 'Review Failed', variant: 'destructive' });
    }
  }, [selection, runBulkReview, toast, refetch]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selection.selectedIds);
    try {
      await runBulkDeleteProject(ids);
      toast({ title: 'Deletion Complete', description: `${ids.length} images deleted.` });
      selection.clear();
      refetch();
    } catch {
      toast({ title: 'Deletion Failed', variant: 'destructive' });
    }
  }, [selection, runBulkDeleteProject, toast, refetch]);

  const handleBulkTag = useCallback(async (tags: string[]) => {
    const selectedImageUUIDs = data?.images
      .filter((img) => selection.selectedIds.has(String(img.project_image_id)))
      .map((img) => img.id);

    if (!selectedImageUUIDs) return null;
    
    try {
      await runBulkTag(selectedImageUUIDs, tags);
      toast({ title: 'Tagging Complete', description: `Tags applied to ${selectedImageUUIDs.length} images.` });
      selection.clear();
      refetch();
    } catch {
      toast({ title: 'Tagging Failed', variant: 'destructive' });
    }
  }, [selection, runBulkTag, toast, refetch]);


  console.log(selection.selectedIds)
  return (
    <div className="min-h-screen w-full p-6 space-y-6 bg-background">
      <div className='space-y-6'>
        <ProjectDatasetHeader
          projectId={projectId!}
          total={data?.total || 0}
          annotated={data?.annotated || 0}
          unannotated={data?.unannotated || 0}
          reviewed={data?.reviewed || 0}
          selectedCount={selection.selectedCount}
          onRefresh={handleRefresh}
          onUpload={() => navigate(`/projects/${projectId}/upload`)}
          onFindDuplicates={handleFindDuplicates}
        />

        <ProjectDatasetFilters
          searchText={searchText}
          onSearchChange={setSearchText}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showAnnotations={showAnnotations}
          onShowAnnotationsChange={setShowAnnotations}
        />

        <BulkOperationBar
          selectedCount={selection.selectedCount}
          totalCount={data?.images.length || 0}
          onSelectAll={selection.togglePage}
          onClearSelection={selection.clear}
          actions={[
            {
              id: 'review',
              label: 'Review',
              icon: <CheckCircle2 className="w-4 h-4" />,
              variant: 'secondary',
              onClick: handleBulkReview,
            },
            {
              id: 'delete',
              label: 'Delete',
              icon: <Trash2 className="w-4 h-4" />,
              variant: 'destructive',
              requiresConfirm: true,
              confirmTitle: `Delete ${selection.selectedCount} images?`,
              confirmDescription: 'This action cannot be undone. The selected images and all their annotations will be permanently removed.',
              onClick: handleBulkDelete,
            },
          ]}
          bulkOperation={operation}
          onCancelOperation={cancelOperation}
          onOperationComplete={clearOperation}
          onBulkTag={handleBulkTag}
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load project images. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : data?.images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No images found</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <ProjectImageGrid
                images={data?.images || []}
                selectedIds={selection.selectedIds}
                onSelect={selection.toggle}
                showAnnotations={showAnnotations}
              />
            ) : (
              <ProjectImageTable
                images={data?.images || []}
                selectedIds={selection.selectedIds}
                onSelect={selection.toggle}
                onSelectAll={(checked) => {
                  if (checked) selection.togglePage();
                  else selection.clear();
                }}
              />
            )}
            <div className="fixed w-full bottom-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg py-4 -mx-6 px-6">
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
                className='pr-[32rem]'
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
    </div>
  );
}
