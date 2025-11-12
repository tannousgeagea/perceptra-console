import { useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { AnnotationProvider } from '@/contexts/AnnotationContext';
import ToolBar from './components/ToolBar';
import Canvas from './components/Canvas';
import LabelPanel from './LabelPanel';
import AnnotationControls from './components/AnnotationControl';
import ActionSidebar from './components/ActionSidebar';
import { useProjectImageDetails } from '@/hooks/useProjectImage';
import { useJobImages } from "@/hooks/useJobImages";
import QueryState from '../common/QueryState';

const AnnotationTool = () => {
  const { projectId, imageId } = useParams<{ projectId: string; imageId: string }>();
  const { data: image, isLoading, isError, refetch } = useProjectImageDetails(
    projectId!,
    imageId!
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // query parameters
  const jobId = searchParams.get("jobId") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const indexParam = parseInt(searchParams.get("index") || "0", 10);

  // fetch job images for context
  const { data: jobImages } = useJobImages(projectId!, jobId, {
    status: status || undefined,
    skip: (page - 1) * 50,
    limit: 50,
  });

  const imageIds = useMemo(
    () => jobImages?.images?.map((img) => img.image_id) || [],
    [jobImages]
  );

  // current index (fallback to param)
  const currentIndex = useMemo(() => {
    const idx = imageIds.indexOf(imageId!);
    return idx !== -1 ? idx : indexParam;
  }, [imageIds, imageId, indexParam]);

  const updateUrl = (newIndex: number, newImageId: string) => {
    const params = new URLSearchParams(window.location.search);

    params.set("jobId", jobId ?? "");
    params.set("status", status ?? "");
    params.set("page", page?.toString() ?? "1");
    params.set("index", newIndex.toString());

    const newUrl = `/projects/${projectId}/images/${newImageId}?${params.toString()}`;
    navigate(newUrl, { replace: false });
    };

  const handleNext = () => {
    if (currentIndex < imageIds.length - 1) {
      const nextImageId = imageIds[currentIndex + 1];
      updateUrl(currentIndex + 1, nextImageId);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevImageId = imageIds[currentIndex - 1];
      updateUrl(currentIndex - 1, prevImageId);
    }
  };

  if (isLoading || isError || !image) {
    return (
      <>
        <QueryState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          loadingMessage="Loading annotation classes..."
          errorMessage="Failed to fetch annotation classes. Please try again."
        />
      </>
    )
  }

  return (
    <AnnotationProvider>
      <div className='dark bg-background text-foreground w-full h-screen overflow-hidden'>
        <AnnotationControls
          title={image.image.name}
          current={currentIndex + 1}
          total={imageIds.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          subtitle={`Filter: ${status || "all"} (Page ${page})`}
          backTo={`/projects/${projectId}/annotate/job/${jobId}?status=${status}`}
        />
        <div className="flex h-full bg-card">
          <div className="w-56 p-4 border-r border-border flex flex-col gap-4">
            <ToolBar />
            <LabelPanel />
          </div>

          <div className='flex flex-1'>
            <Canvas image={image}/>
            <ActionSidebar 
              currentImage={image} 
              projectId={projectId!}
              goToNextImage={handleNext} />
          </div>
        </div>
      </div>
    </AnnotationProvider>
  );
};

export default AnnotationTool;
