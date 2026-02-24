import { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { JobAnnotationHeader } from '@/components/job-annotation/JobAnnotationHeader';
import { JobAnnotationTabs } from '@/components/job-annotation/JobAnnotationTabs';
import { JobImageGrid } from '@/components/job-annotation/JobImageGrid';
import { JobSelectionHeader, BulkOperation } from '@/components/job-annotation/JobSelectionHeader';
import { DatasetBuilder } from '@/components/dataset-builder/DatasetBuilder';
import { useJobImages } from '@/hooks/useJobImages';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/ui/alert';
import { AlertCircle } from 'lucide-react';
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
  const [bulkOperation, setBulkOperation] = useState<BulkOperation | null>(null);
  const cancelRef = useRef(false);
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

  const handleStatusChange = (newStatus: 'unannotated' | 'annotated' | 'reviewed') => {
    setActiveStatus(newStatus);
    setCurrentPage(1); // Reset to first page when switching tabs
  };

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

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredImages.map(img => img.id)));
  }, [filteredImages]);
  
  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);
  
  const handleBulkReview = useCallback(async () => {
    const ids = Array.from(selectedIds);
    cancelRef.current = false;
    setBulkOperation({ type: 'review', total: ids.length, processed: 0, failed: 0, status: 'running' });
    let processed = 0;
    let failed = 0;
    for (const id of ids) {
      if (cancelRef.current) {
        setBulkOperation(prev => prev ? { ...prev, status: 'cancelled' } : null);
        break;
      }
      try {
        console.log(id, 'reviewed')
      } catch {
        failed++;
      }
      processed++;
      setBulkOperation(prev => prev ? { ...prev, processed, failed } : null);
    }
    if (!cancelRef.current) {
      setBulkOperation(prev => prev ? { ...prev, status: 'done' } : null);
      toast({
        title: 'Review Complete',
        description: `${processed - failed} of ${ids.length} images reviewed successfully.`,
      });
      setSelectedIds(new Set());
      setTimeout(() => setBulkOperation(null), 3000);
    }
  }, [selectedIds, toast]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    cancelRef.current = false;
    setBulkOperation({ type: 'delete', total: ids.length, processed: 0, failed: 0, status: 'running' });
    let processed = 0;
    let failed = 0;
    for (const id of ids) {
      if (cancelRef.current) {
        setBulkOperation(prev => prev ? { ...prev, status: 'cancelled' } : null);
        break;
      }
      try {
        console.log(id, 'delete');
      } catch {
        failed++;
      }
      processed++;
      setBulkOperation(prev => prev ? { ...prev, processed, failed } : null);
    }
    if (!cancelRef.current) {
      setBulkOperation(prev => prev ? { ...prev, status: 'done' } : null);
      toast({
        title: 'Deletion Complete',
        description: `${processed - failed} of ${ids.length} images deleted successfully.`,
      });
      setSelectedIds(new Set());
      setTimeout(() => setBulkOperation(null), 3000);
    }
  }, [selectedIds, toast]);

  const handleCancelOperation = useCallback(() => {
    cancelRef.current = true;
  }, []);

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

        <JobSelectionHeader
          selectedCount={selectedIds.size}
          totalCount={filteredImages.length}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBulkReview={handleBulkReview}
          onBulkDelete={handleBulkDelete}
          bulkOperation={bulkOperation}
          onCancelOperation={handleCancelOperation}
        />

        <JobAnnotationTabs
          activeStatus={activeStatus}
          onStatusChange={handleStatusChange}
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
