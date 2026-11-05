import { useState, useCallback, useEffect, useRef } from 'react';
import { useOthersPresence, useRealtimeEvent } from '@/contexts/RealtimeContext';
import { PresenceStack } from '@/components/realtime/PresenceStack';
import { CLIENT_ID } from '@/services/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { JobAnnotationHeader } from '@/components/job-annotation/JobAnnotationHeader';
import { JobAnnotationTabs } from '@/components/job-annotation/JobAnnotationTabs';
import { JobImageGrid } from '@/components/job-annotation/JobImageGrid';
import { BulkOperationBar } from '@/components/ui/ui/bulk-operation-bar';
import { useBulkOperations } from '@/hooks/useBulkOperation';
import { SelectAllMatchingBanner } from '@/components/ui/ui/select-all-matching-banner';
import { useSelectAllMatching } from '@/hooks/useSelectAllMatching';
import { DatasetBuilder } from '@/components/dataset-builder/DatasetBuilder';
import { useJobImages, useJobImageCounts, invalidateJobImages, ALL_JOBS_ID } from '@/hooks/useJobImages';
import { useBulkMarkImagesAsNull } from '@/hooks/useProjectImageBulkOperation';
import { JOB_TABS } from '@/components/job-annotation/jobTabs';
import type { JobImageTab } from '@/types/image';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/ui/alert';
import { AlertCircle, Ban, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import { PaginationControls } from '@/components/ui/ui/pagination-control';
import { useToast } from '@/hooks/use-toast';

export default function JobAnnotation() {
  const { projectId = '', jobId = '' } = useParams<{ projectId: string, jobId: string }>();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const statusParam = query.get("status");
  const initialStatus: JobImageTab =
    JOB_TABS.find((t) => t.id === statusParam)?.id ?? 'unannotated';

  const initialPage = parseInt(query.get("page") || "1");
  const initialLimit = parseInt(query.get("limit") || "20");

  const [activeStatus, setActiveStatus] = useState<JobImageTab>(initialStatus);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const { toast } = useToast();

  const [imageSize, setImageSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [datasetBuilderOpen, setDatasetBuilderOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // A new tab starts on its first page — page 3 of one tab is meaningless in another.
  const handleStatusChange = useCallback((status: JobImageTab) => {
    setActiveStatus(status);
    setCurrentPage(1);
  }, []);

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

  const { data, isLoading, isFetching, isPlaceholderData, isError: error, refetch: refetchImages } = useJobImages(projectId, jobId, {
    skip: (currentPage - 1) * itemsPerPage,
    limit: itemsPerPage,
    status: activeStatus,
    includeCounts: false, // tab counts come from useJobImageCounts
  });
  // Keyed by job only: tab switches and paging never refetch the counts.
  const { data: counts } = useJobImageCounts(projectId, jobId);

  // After a mutation: refresh this grid and the counts together.
  const refetch = useCallback(() => {
    invalidateJobImages(queryClient);
    refetchImages();
  }, [queryClient, refetchImages]);

  // Live: other people's changes refresh this page (batched; own changes already do).
  const liveRefetchRef = useRef<ReturnType<typeof setTimeout>>();
  useRealtimeEvent((event) => {
    if (event.origin === CLIENT_ID || liveRefetchRef.current) return;
    const resource = (event.data as { resource?: string } | null)?.resource;
    const relevant =
      event.type === 'annotation.changed' ||
      event.type === 'image.changed' ||
      (event.type === 'project.changed' && resource !== 'classes');
    if (!relevant) return;
    liveRefetchRef.current = setTimeout(() => {
      liveRefetchRef.current = undefined;
      refetchImages();
    }, 1500);
  });
  useEffect(() => () => clearTimeout(liveRefetchRef.current), []);

  const workingHere = useOthersPresence().filter((p) => p.job_id === jobId);

  const { operation, runBulkReview, runBulkDeleteProject, runBulkTag, cancelOperation, clearOperation } = useBulkOperations(projectId)
  const { mutateAsync: bulkMarkNull } = useBulkMarkImagesAsNull(projectId);
  const handleRefresh = refetch;

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

  const handleBulkNull = useCallback(async (isNull: boolean) => {
    const ids = Array.from(selection.selectedIds).map(Number);
    try {
      await bulkMarkNull({ image_ids: ids, is_null: isNull });
      selection.clear();
      refetch();
    } catch {
      // the mutation hook already toasts the error
    }
  }, [selection, bulkMarkNull, refetch]);

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


  // After all hooks, so hook order never depends on the route.
  if (!projectId || !jobId) {
    return <p className="text-red-600 p-6">Invalid route: Missing project or job ID.</p>;
  }

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
          subtitle={jobId === ALL_JOBS_ID ? "Images from every job in this project" : undefined}
          jobActions={jobId !== ALL_JOBS_ID}
        />

        {workingHere.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <PresenceStack people={workingHere} context={{ jobId }} max={6} />
            <span>
              {workingHere.length === 1 ? `${workingHere[0].name} is` : `${workingHere.length} people are`} working on this job now
            </span>
          </div>
        )}

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
              id: 'mark-null',
              label: 'Mark empty',
              icon: <Ban className="w-4 h-4" />,
              variant: 'secondary',
              requiresConfirm: true,
              confirmTitle: `Mark ${selection.selectedCount} images as empty?`,
              confirmDescription: 'Their annotations are removed and they become negative samples. You can restore them later, which brings the annotations back.',
              onClick: () => handleBulkNull(true),
            },
            {
              id: 'restore-null',
              label: 'Restore',
              icon: <RotateCcw className="w-4 h-4" />,
              variant: 'secondary',
              onClick: () => handleBulkNull(false),
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
          onStatusChange={handleStatusChange}
          counts={counts}
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
              No {JOB_TABS.find((t) => t.id === activeStatus)?.label.toLowerCase()} images found
            </p>
          </div>
        ) : (
          <>
            <div className={isPlaceholderData && isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <JobImageGrid
              images={filteredImages}
              imageSize={imageSize}
              selectedIds={selection.selectedIds}
              selectionMode={selectionMode}
              onToggleSelect={selection.toggle}
              onImageClick={(index: number, image_id: string) => handleImageClick(index, image_id)}
              showJob={jobId === ALL_JOBS_ID}
            />
            </div>

            <div className="fixed w-full bottom-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg py-4 -mx-6 px-6">
              <PaginationControls
                currentPage={currentPage}
                totalItems={data?.total ?? 0}
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
