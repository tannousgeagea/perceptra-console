import { useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { JobAnnotationHeader } from '@/components/job-annotation/JobAnnotationHeader';
import { JobAnnotationTabs } from '@/components/job-annotation/JobAnnotationTabs';
import { JobImageGrid } from '@/components/job-annotation/JobImageGrid';
import { BulkOperationBar } from '@/components/ui/ui/bulk-operation-bar';
import { useBulkOperations } from '@/hooks/useBulkOperation';
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

  const [activeStatus, setActiveStatus] = useState<'unannotated' | 'annotated' | 'reviewed'>(initialStatus);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const [imageSize, setImageSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [datasetBuilderOpen, setDatasetBuilderOpen] = useState(false);
  const navigate = useNavigate();
  
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
    navigate(
      `/projects/${projectId}/images/${image_id}?jobId=${jobId}&status=${activeStatus}&index=${index + 1}`);
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

  const selectionMode = selectedIds.size > 0;
  
  const handleToggleSelect = useCallback((imageId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(imageId)) next.delete(imageId);
      else next.add(imageId);
      return next;
    });
  }, []);

  const handleBulkReview = useCallback(async () => {
    const ids = Array.from(selectedIds);
    try {
      await runBulkReview(ids);
      toast({ title: 'Review Complete', description: `${ids.length} images reviewed.` });
      setSelectedIds(new Set());
      refetch();
    } catch {
      toast({ title: 'Review Failed', variant: 'destructive' });
    }
  }, [selectedIds, runBulkReview, toast, refetch]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    try {
      await runBulkDeleteProject(ids);
      toast({ title: 'Deletion Complete', description: `${ids.length} images deleted.` });
      setSelectedIds(new Set());
      refetch();
    } catch {
      toast({ title: 'Deletion Failed', variant: 'destructive' });
    }
  }, [selectedIds, runBulkDeleteProject, toast, refetch]);

  const handleBulkTag = useCallback(async (tags: string[]) => {
    const selectedImageUUIDs = filteredImages
      .filter((img) => selectedIds.has(String(img.id)))
      .map((img) => img.image_id);
    try {
      await runBulkTag(selectedImageUUIDs, tags);
      toast({ title: 'Tagging Complete', description: `Tags applied to ${selectedImageUUIDs.length} images.` });
      setSelectedIds(new Set());
      refetch();
    } catch {
      toast({ title: 'Tagging Failed', variant: 'destructive' });
    }
  }, [selectedIds, runBulkTag, toast, refetch]);

  // Get the count for the current active status
  const getCurrentStatusCount = () => {
    if (activeStatus === 'unannotated') return data?.unannotated || 0;
    if (activeStatus === 'annotated') return data?.annotated || 0;
    if (activeStatus === 'reviewed') return data?.reviewed || 0;
    return 0;
  };

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
          selectedCount={selectedIds.size}
          totalCount={filteredImages.length}
          onSelectAll={() => setSelectedIds(new Set(filteredImages.map(img => img.id)))}
          onClearSelection={() => setSelectedIds(new Set())}
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
              confirmTitle: `Delete ${selectedIds.size} images?`,
              confirmDescription: 'This action cannot be undone. The selected images and all their annotations will be permanently removed.',
              onClick: handleBulkDelete,
            },
          ]}
          bulkOperation={operation}
          onCancelOperation={cancelOperation}
          onOperationComplete={clearOperation}
          onBulkTag={handleBulkTag}
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
              selectedIds={selectedIds}
              selectionMode={selectionMode}
              onToggleSelect={handleToggleSelect}
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
              />
            </div>
          </>
        )}

        <DatasetBuilder
          projectId={projectId}
          open={datasetBuilderOpen}
          images={data?.images.filter(img => img.status === 'reviewed') || []}
          onOpenChange={setDatasetBuilderOpen}
        />
      </div>
    </div>
  );
}
