import { useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { JobAnnotationHeader } from '@/components/job-annotation/JobAnnotationHeader';
import { JobAnnotationTabs } from '@/components/job-annotation/JobAnnotationTabs';
import { JobImageGrid } from '@/components/job-annotation/JobImageGrid';
import { DatasetBuilder } from '@/components/dataset-builder/DatasetBuilder';
import { useJobImages } from '@/hooks/useJobImages';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PaginationControls } from '@/components/ui/ui/pagination-control';
import { da } from 'zod/v4/locales';

export default function JobAnnotation() {
  const { projectId, jobId } = useParams<{ projectId: string, jobId: string }>();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialStatus = query.get("status") as 'unannotated' | 'annotated' | 'reviewed' || 'unannotated';


  const [activeStatus, setActiveStatus] = useState<'unannotated' | 'annotated' | 'reviewed'>(initialStatus);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [imageSize, setImageSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [datasetBuilderOpen, setDatasetBuilderOpen] = useState(false);
  const navigate = useNavigate();
  
  if (!projectId || !jobId) {
    return <p className="text-red-600 p-6">Invalid route: Missing project or job ID.</p>;
  }

  const { data, isLoading, isError: error, refetch } = useJobImages(projectId, jobId, {
    skip: (currentPage - 1) * itemsPerPage,
    limit: itemsPerPage,
  });
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleBuildDataset = useCallback(() => {
    setDatasetBuilderOpen(true);
  }, []);

  const handleImageClick = (index: number, image_id:string): void => {
    navigate(
      `/projects/${projectId}/images/${image_id}?jobId=${jobId}&status=${activeStatus}&index=${index}`);
  };

  // Filter images based on active tab and search
  const filteredImages = data?.images.filter(img => {
    const matchesStatus = img.status === activeStatus;
    const matchesSearch = searchText.trim() === '' || 
      img.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];


  console.log(filteredImages)
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto p-6 space-y-6">
        <JobAnnotationHeader
          jobName={`${data?.job.name}`}
          createdAt={data?.job.created_at ? new Date(data?.job.created_at).toLocaleString() : "N/A"}
          onRefresh={handleRefresh}
          searchText={searchText}
          onSearchChange={setSearchText}
          onBuildDataset={handleBuildDataset}
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
              onImageClick={(index: number, image_id:string) => handleImageClick(index, image_id)}
            />

            <div className="fixed bottom-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg py-4 -mx-6 px-6">
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
