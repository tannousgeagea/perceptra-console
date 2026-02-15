import { useMemo, useRef, useCallback, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { AnnotationProvider } from '@/contexts/AnnotationProvider';
import ToolBar from './components/ToolBar';
import Canvas, { CanvasHandle }  from './components/Canvas';
import LabelPanel from './LabelPanel';
import AnnotationControls from './components/AnnotationControl';
import ActionSidebar from './components/ActionSidebar';
import { useProjectImageDetails } from '@/hooks/useProjectImage';
import { useJobImages } from "@/hooks/useJobImages";
import QueryState from '../common/QueryState';

import { AnnotationInfo } from './AnnotationInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import { useSAMSession } from '@/hooks/useSAMSession';
import { useImagePreload } from '@/hooks/useImagePreload';

const AnnotationTool = () => {
  const { projectId, imageId } = useParams<{ projectId: string; imageId: string }>();
  const { data: image, isLoading, isError, refetch } = useProjectImageDetails(
    projectId!,
    imageId!
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const samSession = useSAMSession(projectId!, image?.id || "");

  // CRITICAL: Stable ref to Canvas (never recreated)
  const canvasRef = useRef<CanvasHandle>(null);

  // Track active SAM tool
  const [activeSAMTool, setActiveSAMTool] = useState<'points' | 'box' | 'text' | 'similar' | 'propagate' | null>(null);

  // query parametersconst canvasRef = useRef<CanvasHandle>(null);
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

  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | undefined>();
  const [hoveredSuggestionId, setHoveredSuggestionId] = useState<string | null>(null);

  // PRELOAD: Adjacent images for instant navigation
  useImagePreload({
    projectId: projectId!,
    imageIds,
    currentIndex,
    prefetchNext: true,
    prefetchPrev: true,
    prefetchCount: 1, // Preload 1 image in each direction
  });

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
      // Auto-save current annotation if editing
      canvasRef.current?.saveCurrentAnnotation();
      
      const nextImageId = imageIds[currentIndex + 1];
      updateUrl(currentIndex + 1, nextImageId);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Auto-save current annotation if editing
      canvasRef.current?.saveCurrentAnnotation();

      const prevImageId = imageIds[currentIndex - 1];
      updateUrl(currentIndex - 1, prevImageId);
    }
  };

  const hasPreviousImage = currentIndex > 0;
  const previousImageId = hasPreviousImage ? imageIds[currentIndex - 1] : undefined;


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
            <div className="flex-1 overflow-y-auto p-4">
              <LabelPanel />
            </div>
          </div>

          <div className='flex flex-1'>
            <Canvas 
              ref={canvasRef}
              image={image}
              samSession={samSession}
              preserveZoom={true}
              selectedSuggestionId={selectedSuggestionId}
              onSelectSuggestion={setSelectedSuggestionId}
              hoveredSuggestionId={hoveredSuggestionId!}
              onHoverSuggestion={setHoveredSuggestionId}
              activeSAMTool={activeSAMTool}
            />

            <div className="w-80 border-l border-border flex flex-col">
              <Tabs defaultValue="actions" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>
                <TabsContent value="actions" className="flex-1 overflow-hidden m-0">
                  <ActionSidebar 
                    currentImage={image} 
                    projectId={projectId!}
                    goToNextImage={handleNext}
                    samSession={samSession}
                    // suggestions={suggestions}
                    // generateAI={() => generateAI({})}
                    // suggestSimilar={(id) => suggestSimilar(id)}
                    // propagate={() => previousImageId && propagate(previousImageId)}
                    // acceptSuggestion={(id) => acceptSuggestion({ suggestionId: id })}
                    // rejectSuggestion={rejectSuggestion}
                    // handleAcceptAll={handleAcceptAll}
                    // clearSuggestions={clearSuggestions}
                    // isGenerating={isGenerating}
                    hasPreviousImage={hasPreviousImage}
                    previousImageId={previousImageId}
                    onSAMToolChange={setActiveSAMTool}
                    hoveredSuggestionId={hoveredSuggestionId}
                    onHoverSuggestion={setHoveredSuggestionId}

                  />
                </TabsContent>
                <TabsContent value="info" className="flex-1 overflow-hidden m-0">
                  <AnnotationInfo 
                    image={image}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AnnotationProvider>
  );
};

export default AnnotationTool;
