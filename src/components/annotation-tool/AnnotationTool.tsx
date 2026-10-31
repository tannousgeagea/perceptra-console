import { useMemo, useRef, useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { AnnotationProvider } from '@/contexts/AnnotationProvider';
import ToolBar from './components/ToolBar';
import Canvas, { CanvasHandle }  from './components/Canvas';
import LabelPanel from './LabelPanel';
import AnnotationControls from './components/AnnotationControl';
import ActionSidebar from './components/ActionSidebar';
import { useProjectImageDetails } from '@/hooks/useProjectImage';
import { useJobImages } from "@/hooks/useJobImages";
import QueryState from '../common/QueryState';
import { useClasses } from '@/hooks/useClasses';

import { AnnotationInfo } from './AnnotationInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import { useSAMSession } from '@/hooks/useSAMSession';
import { safeReturnTo } from '@/hooks/useOpenInAnnotator';
import { useImagePreload } from '@/hooks/useImagePreload';
import { useMarkImageAsNull } from '@/hooks/useProjectImageUpdate';
import { CopyableId } from '@/components/ui/ui/copyable-id';
import { Badge } from '@/components/ui/ui/badge';
import { Button } from '@/components/ui/ui/button';
import { Ban, Loader, RotateCcw } from 'lucide-react';

const AnnotationTool = () => {
  const { projectId, imageId } = useParams<{ projectId: string; imageId: string }>();
  const { data: classes } = useClasses(projectId);
  const { data: image, isLoading, isError, refetch } = useProjectImageDetails(
    projectId!,
    imageId!
  );
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const samSession = useSAMSession(projectId!, image?.id || "");
  const { mutate: markNull, isPending: isRestoring } = useMarkImageAsNull(projectId!);

  // CRITICAL: Stable ref to Canvas (never recreated)
  const canvasRef = useRef<CanvasHandle>(null);

  // Track active SAM tool
  const [activeSAMTool, setActiveSAMTool] = useState<'points' | 'box' | 'text' | 'similar' | 'propagate' | 'auto' | null>(null);

  // query parametersconst canvasRef = useRef<CanvasHandle>(null);
  const jobId = searchParams.get("jobId") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = parseInt(searchParams.get("limit") || "20");
  const indexParam = parseInt(searchParams.get("index") || "0", 10);
  // Where this image was opened from (e.g. the Dataset page, with its filters
  // and page) — the back arrow returns there; the job grid stays one click away.
  const returnTo = safeReturnTo(searchParams.get("returnTo"), projectId!);
  const params = new URLSearchParams(location.search);
  params.delete("index");
  params.delete("returnTo");

  const jobUrl = jobId ? `/projects/${projectId}/annotate/job/${jobId}?${params.toString()}` : null;
  const datasetUrl = returnTo ?? `/projects/${projectId}/dataset`;
  const backUrl = returnTo ?? jobUrl ?? datasetUrl;
  const backLabel = returnTo
    ? (returnTo.includes("/dataset") ? "Back to dataset" : "Back")
    : jobUrl ? "Back to job" : "Back to dataset";

  // fetch job images for context
  const { data: jobImages } = useJobImages(projectId!, jobId, {
    status: status || undefined,
    skip: (page - 1) * itemsPerPage,
    limit: itemsPerPage,
    includeCounts: false, // only the image order is needed here
  });

  const imageIds = useMemo(
    () => jobImages?.images?.map((img) => img.image_id) || [],
    [jobImages]
  );

  const imageIdInteger = useMemo(
    () => jobImages?.images?.map((img) => img.project_image_id) || [],
    [jobImages]
  );

  // current index (fallback to param)
  const currentIndex = useMemo(() => {
    const idx = imageIds.indexOf(imageId!);
    return idx !== -1 ? idx : indexParam;
  }, [imageIds, imageId, indexParam]);

  // Restoring an empty image brings its annotations back under the same image
  // id, which the canvas' load-on-id-change effect would not pick up.
  const nullFlagRef = useRef<{ id?: string; isNull?: boolean }>({});
  useEffect(() => {
    if (!image) return;
    const prev = nullFlagRef.current;
    if (prev.id === image.id && prev.isNull && !image.marked_as_null) {
      canvasRef.current?.loadImage(image);
    }
    nullFlagRef.current = { id: image.id, isNull: image.marked_as_null };
  }, [image]);

  const handleRestoreNull = () => {
    if (!image) return;
    markNull({ projectImageId: Number(image.id), payload: { is_null: false } });
  };

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
  const previousImageId = hasPreviousImage ? imageIdInteger[currentIndex - 1] : undefined;

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
          subtitle={jobId
            ? `${jobImages?.job?.name ? `Job: ${jobImages.job.name} · ` : ""}${status || "all"} · page ${page}`
            : "Not in an annotation job"}
          backTo={backUrl}
          backLabel={backLabel}
          titleAddon={
            <>
              {image.marked_as_null && (
                <Badge className="gap-1 bg-amber-500/90 text-white hover:bg-amber-500/90">
                  <Ban className="h-3 w-3" />
                  Empty
                </Badge>
              )}
              <CopyableId value={image.image.image_id} label="Image ID" iconOnly />
            </>
          }
          links={[
            ...(jobUrl && backUrl !== jobUrl ? [{ label: "Open job", to: jobUrl }] : []),
            ...(backUrl !== datasetUrl ? [{ label: "Dataset", to: datasetUrl }] : []),
          ]}
        />
        <div className="flex h-full bg-card">
          <div className="w-56 border-r border-border flex flex-col h-full min-h-0">
            <ToolBar />
            <div className="flex-1 min-h-0">
              <LabelPanel
                classes={classes || []}
              />
            </div>
          </div>

          <div className='relative flex flex-1'>
            {image.marked_as_null && (
              <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-amber-500/40 bg-slate-950/90 px-4 py-2 text-sm text-amber-200 shadow-lg backdrop-blur">
                <Ban className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  Flagged as <strong>empty</strong> — no objects of interest
                  {image.metadata?.null_status?.marked_by && (
                    <span className="text-amber-200/70"> · by {image.metadata.null_status.marked_by}</span>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 border-amber-500/40 bg-transparent text-amber-100 hover:bg-amber-500/20"
                  disabled={isRestoring}
                  onClick={handleRestoreNull}
                >
                  {isRestoring ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                  Restore
                </Button>
              </div>
            )}
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
                    classes={classes || []}
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
