import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { JobAnnotationHeader } from '@/components/job-annotation/JobAnnotationHeader';
import { JobAnnotationTabs } from '@/components/job-annotation/JobAnnotationTabs';
import { JobImageGrid } from '@/components/job-annotation/JobImageGrid';
import { BulkOperationBar } from '@/components/ui/ui/bulk-operation-bar';
import { useBulkOperations } from '@/hooks/useBulkOperation';
import { SelectAllMatchingBanner } from '@/components/ui/ui/select-all-matching-banner';
import { useSelectAllMatching } from '@/hooks/useSelectAllMatching';
import { DatasetBuilder } from '@/components/dataset-builder/DatasetBuilder';
import { useJobImages } from '@/hooks/useJobImages';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/ui/alert';
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { PaginationControls } from '@/components/ui/ui/pagination-control';
import { useToast } from '@/hooks/use-toast';

export default function JobAnnotation() {
  const { projectId, jobId } = useParams<{ projectId: string, jobId: string }>();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialStatus = query.get("status") as 'unannotated' | 'annotated' | 'reviewed' || 'unannotated';

  const initialPage = parseInt(query.get("page") || "1");
  const initialLimit = parseInt(query.get("limit") || "20");

  const [activeStatus, setActiveStatus] = useState<'unannotated' | 'annotated' | 'reviewed'>(initialStatus);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const { toast } = useToast();

  const [imageSize, setImageSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [datasetBuilderOpen, setDatasetBuilderOpen] = useState(false);
  const navigate = useNavigate();
    
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    params.set("page", String(currentPage));
    params.set("limit", String(itemsPerPage));
    params.set("status", activeStatus);

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  }, [currentPage, itemsPerPage, activeStatus]);

  if (!projectId || !jobId) {
    return <p className="text-red-600 p-6">Invalid route: Missing project or job ID.</p>;
  }

  const { data, isLoading, isError: error, refetch } = useJobImages(projectId, jobId, {
    skip: (currentPage - 1) * itemsPerPage,
    limit: itemsPerPage,
    status: activeStatus,
  });
  

  const { operation, runBulkReview, runBulkDeleteProject, runBulkTag, cancelOperation, clearOperation } = useBulkOperations(projectId)
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleBuildDataset = useCallback(() => {
    setDatasetBuilderOpen(true);
  }, []);

  const handleImageClick = (index: number, image_id: string): void => {
    const params = new URLSearchParams(location.search);
    params.set("index", `${index + 1}`);
    params.set("jobId", jobId)

    navigate({
      pathname: `/projects/${projectId}/images/${image_id}`,
      search: params.toString(),
    });
  };

  const handleBack = (): void => {
    navigate(
      `/projects/${projectId}/annotate`
    )
  }

  // Filter images based on active tab and search
  const filteredImages = data?.images.filter(img => {
    const matchesSearch = searchText.trim() === '' || 
      img.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  }) || [];

  const pageIds = filteredImages.map(img => img.project_image_id);
  const selection = useSelectAllMatching({
    pageIds,
    totalMatching: data?.total ?? 0,
    allMatchingIds: data?.project_image_ids,
    resetKey: `${searchText}|${activeStatus}|${itemsPerPage}`,
  });

  const selectionMode = selection.selectedCount > 0;
  
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
    const selectedImageUUIDs = filteredImages
      .filter((img) => selection.selectedIds.has(String(img.project_image_id)))
      .map((img) => img.id);
    try {
      await runBulkTag(selectedImageUUIDs, tags);
      toast({ title: 'Tagging Complete', description: `Tags applied to ${selectedImageUUIDs.length} images.` });
      selection.clear();
      refetch();
    } catch {
      toast({ title: 'Tagging Failed', variant: 'destructive' });
    }
  }, [selection, runBulkTag, toast, refetch]);

  // Get the count for the current active status
  const getCurrentStatusCount = () => {
    if (activeStatus === 'unannotated') return data?.unannotated || 0;
    if (activeStatus === 'annotated') return data?.annotated || 0;
    if (activeStatus === 'reviewed') return data?.reviewed || 0;
    return 0;
  };

  const totat_records = data?.total ?? 0;
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto p-6 space-y-6">
        <JobAnnotationHeader
          jobName={`${data?.job.name}`}
          createdAt={data?.job.created_at ? new Date(data?.job.created_at).toLocaleString() : "N/A"}
          onRefresh={handleRefresh}
          searchText={searchText}
          onSearchChange={setSearchText}
          onBack={handleBack}
          onBuildDataset={handleBuildDataset}
        />

        <BulkOperationBar
          selectedCount={selection.selectedCount}
          totalCount={filteredImages.length}
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

        <JobAnnotationTabs
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          unannotatedCount={data?.unannotated || 0}
          annotatedCount={data?.annotated || 0}
          reviewedCount={data?.reviewed || 0}
          imageSize={imageSize}
          onImageSizeChange={setImageSize}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load job images. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No {activeStatus} images found
            </p>
          </div>
        ) : (
          <>
            <JobImageGrid
              images={filteredImages}
              imageSize={imageSize}
              selectedIds={selection.selectedIds}
              selectionMode={selectionMode}
              onToggleSelect={selection.toggle}
              onImageClick={(index: number, image_id: string) => handleImageClick(index, image_id)}
            />

            <div className="fixed w-full bottom-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg py-4 -mx-6 px-6">
              <PaginationControls
                currentPage={currentPage}
                totalItems={getCurrentStatusCount()}
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
          </>
        )}

        <DatasetBuilder
          projectId={projectId}
          open={datasetBuilderOpen}
          images={data?.images.filter(img => img.status === 'reviewed') || []}
          project_image_ids={data?.project_image_ids}
          total_images={totat_records}
          onOpenChange={setDatasetBuilderOpen}
        />
      </div>
    </div>
  );
}
