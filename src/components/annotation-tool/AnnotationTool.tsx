import { useMemo, useRef, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { AnnotationProvider } from '@/contexts/AnnotationProvider';
import ToolBar from './components/ToolBar';
import Canvas, { CanvasHandle }  from './components/Canvas';
import LabelPanel from './LabelPanel';
import AnnotationControls from './components/AnnotationControl';
import ActionSidebar from './components/ActionSidebar';
import { fetchProjectImageDetails, useProjectImageDetails } from '@/hooks/useProjectImage';
import { jobImagesQuery, useJobImageCounts, useJobImages } from "@/hooks/useJobImages";
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { AnnotationCommandsProvider } from '@/contexts/AnnotationCommandsContext';
import { annotationsToBoxes } from './boxes';
import SessionBar from './components/SessionBar';
import { AnnotatorPresence, RemoteChangeNotice } from './components/LiveCollaboration';
import { RejectionNotice } from './components/ReviewFeedback';
import QueryState from '../common/QueryState';
import { useClasses } from '@/hooks/useClasses';
import { useAuth } from '@/contexts/AuthContext';
import { useResumeStore } from '@/stores/resumeStore';

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
  const { data: image, isLoading, isError, refetch, isPlaceholderData: isSwitchingImage } = useProjectImageDetails(
    projectId!,
    imageId!,
    { keepPrevious: true }
  );
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const orgId = currentOrganization?.id;
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
  const listParams = (forPage: number) => ({
    status: status || undefined,
    skip: (forPage - 1) * itemsPerPage,
    limit: itemsPerPage,
    includeCounts: false, // only the image order is needed here
  });
  const { data: jobImages } = useJobImages(projectId!, jobId, listParams(page), { frozen: true });
  const { data: jobCounts } = useJobImageCounts(projectId!, jobId);

  // Images leave these lists as they are worked on (annotate → leaves
  // "unannotated", approve → leaves "annotated", resubmit → leaves "rejected"),
  // so "page 2" on the server is not what follows page 1 here. Past the end of
  // the loaded list, these work like a queue: refetch from the top and skip
  // what was already seen.
  const isQueue = status === 'unannotated' || status === 'annotated' || status === 'rejected';
  const seenRef = useRef(new Set<string>());

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

  useEffect(() => {
    imageIds.forEach((id) => seenRef.current.add(id));
  }, [imageIds]);

  // The image open before this one, for "copy from previous" outside the list order.
  const lastVisitedRef = useRef<{ current?: string; previous?: string }>({});
  useEffect(() => {
    if (!imageId || lastVisitedRef.current.current === imageId) return;
    lastVisitedRef.current = { previous: lastVisitedRef.current.current, current: imageId };
  }, [imageId]);

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

  // Remember where this session is, for "Continue where you left off".
  const { user } = useAuth();
  const recordSession = useResumeStore((s) => s.record);
  const jobName = jobImages?.job?.name;
  useEffect(() => {
    if (!image || isSwitchingImage || !user?.id || !orgId || !projectId || !imageId) return;
    recordSession({
      userId: String(user.id),
      orgId,
      projectId,
      jobId: jobId || undefined,
      jobName,
      imageId,
      imageName: image.image.name,
      status,
      page,
      limit: itemsPerPage,
      index: currentIndex,
    });
  }, [image, isSwitchingImage, user?.id, orgId, projectId, imageId, jobId, jobName, status, page, itemsPerPage, currentIndex, recordSession]);

  const handleRestoreNull = () => {
    if (!image) return;
    markNull({ projectImageId: Number(image.id), payload: { is_null: false } });
  };

  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | undefined>();
  const [hoveredSuggestionId, setHoveredSuggestionId] = useState<string | null>(null);

  // PRELOAD: Adjacent images for instant navigation
  // PRELOAD: the next few images (details + decoded files) for instant navigation
  useImagePreload({
    projectId: projectId!,
    imageIds,
    currentIndex,
    ahead: 3,
    behind: 1,
  });

  const listTotal = jobImages?.total ?? imageIds.length;
  const pageOffset = (page - 1) * itemsPerPage;
  const atListEnd = currentIndex >= imageIds.length - 1;
  const hasMoreAfterList = !!jobId && (isQueue
    ? listTotal > imageIds.length
    : pageOffset + imageIds.length < listTotal);
  const hasNext = !atListEnd || hasMoreAfterList;
  const hasPrevious = currentIndex > 0 || (!isQueue && page > 1);

  // Near the end of a page, warm the next one so crossing pages is instant too.
  useEffect(() => {
    if (!jobId || isQueue || !hasMoreAfterList || currentIndex < imageIds.length - 3) return;
    void queryClient.prefetchQuery({ ...jobImagesQuery(orgId, projectId!, jobId, listParams(page + 1)), staleTime: Infinity });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- listParams is derived from these
  }, [jobId, isQueue, hasMoreAfterList, currentIndex, imageIds.length, page, orgId, projectId, status, itemsPerPage, queryClient]);

  const updateUrl = (newIndex: number, newImageId: string, newPage = page) => {
    const params = new URLSearchParams(window.location.search);

    params.set("jobId", jobId ?? "");
    params.set("status", status ?? "");
    params.set("page", newPage.toString());
    params.set("index", newIndex.toString());

    const newUrl = `/projects/${projectId}/images/${newImageId}?${params.toString()}`;
    navigate(newUrl, { replace: false });
  };

  const [isTurningPage, setIsTurningPage] = useState(false);

  /** Move past either end of the loaded list (next/previous page, or the queue's next batch). */
  const turnPage = async (direction: 1 | -1) => {
    if (isTurningPage) return;
    setIsTurningPage(true);
    try {
      if (isQueue) {
        // Fresh from the top; whatever has not been seen yet comes next.
        const fresh = await queryClient.fetchQuery({ ...jobImagesQuery(orgId, projectId!, jobId, listParams(1)), staleTime: 0 });
        const freshIds = fresh.images.map((img) => img.image_id);
        const nextIndex = freshIds.findIndex((id) => !seenRef.current.has(id));
        if (nextIndex === -1) {
          toast.success('You reached the end of this list 🎉');
          return;
        }
        updateUrl(nextIndex, freshIds[nextIndex], 1);
      } else {
        const targetPage = page + direction;
        const data = await queryClient.fetchQuery({ ...jobImagesQuery(orgId, projectId!, jobId, listParams(targetPage)), staleTime: Infinity });
        const ids = data.images.map((img) => img.image_id);
        if (!ids.length) return;
        const index = direction === 1 ? 0 : ids.length - 1;
        updateUrl(index, ids[index], targetPage);
      }
    } catch {
      toast.error("Couldn't load the next images");
    } finally {
      setIsTurningPage(false);
    }
  };

  const handleNext = () => {
    // Auto-save current annotation if editing
    canvasRef.current?.saveCurrentAnnotation();
    if (currentIndex < imageIds.length - 1) {
      updateUrl(currentIndex + 1, imageIds[currentIndex + 1]);
    } else if (hasMoreAfterList) {
      void turnPage(1);
    }
  };

  const handlePrevious = () => {
    // Auto-save current annotation if editing
    canvasRef.current?.saveCurrentAnnotation();
    if (currentIndex > 0) {
      updateUrl(currentIndex - 1, imageIds[currentIndex - 1]);
    } else if (hasPrevious) {
      void turnPage(-1);
    }
  };

  /** Annotations of the image before this one (in list order, else the last one visited). */
  const loadPreviousBoxes = async () => {
    const previousUid = imageIds[currentIndex - 1] ?? lastVisitedRef.current.previous;
    if (!previousUid || !orgId) return null;
    const details = await queryClient.fetchQuery({
      queryKey: ['projectImageDetails', orgId, projectId, previousUid],
      queryFn: () => fetchProjectImageDetails(orgId, projectId!, previousUid),
      staleTime: 0, // it may just have been edited
    });
    return details.marked_as_null ? [] : annotationsToBoxes(details);
  };

  /** Someone else changed this image: load the server's version onto the canvas. */
  const reloadFromServer = async () => {
    const result = await refetch();
    if (result.data) canvasRef.current?.loadImage(result.data);
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
      <AnnotationCommandsProvider projectId={projectId!} image={image}>
      <div className='dark flex h-screen w-full flex-col overflow-hidden bg-background text-foreground'>
        <AnnotationControls
          title={image.image.name}
          current={jobId ? pageOffset + currentIndex + 1 : currentIndex + 1}
          total={jobId ? listTotal : imageIds.length}
          hasNext={hasNext && !isTurningPage}
          hasPrevious={hasPrevious && !isTurningPage}
          actions={
            <div className="flex items-center gap-3">
              <AnnotatorPresence imageUid={imageId} jobId={jobId || undefined} />
              <SessionBar
                counts={jobId ? jobCounts : undefined}
                scope={jobId || projectId || null}
                loadPreviousBoxes={loadPreviousBoxes}
              />
            </div>
          }
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
        {/* Body fills only the space under the header, so nothing sits below the fold. */}
        <div className="flex min-h-0 flex-1 bg-card">
          <div className="w-56 border-r border-border flex flex-col h-full min-h-0">
            <ToolBar />
            <div className="flex-1 min-h-0">
              <LabelPanel
                classes={classes || []}
              />
            </div>
          </div>

          <div className='relative flex flex-1'>
            {(isSwitchingImage || isTurningPage) && (
              // Next image still loading: block edits so nothing lands on the image being left.
              <div className="absolute inset-0 z-30 flex items-start justify-center bg-background/20 pt-16" aria-busy="true">
                <div className="flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow">
                  <Loader className="h-3.5 w-3.5 animate-spin" />
                  Loading image…
                </div>
              </div>
            )}
            {/* Top-centre banner stack. */}
            <div className="pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 flex-col items-center gap-2 [&>*]:pointer-events-auto">
            <RemoteChangeNotice projectImageId={Number(image.id)} onReload={reloadFromServer} />
            <RejectionNotice
              image={image}
              projectId={projectId!}
              onResubmitted={() => (hasNext ? handleNext() : void refetch())}
            />
            {image.marked_as_null && (
              <div className="flex items-center gap-3 rounded-lg border border-amber-500/40 bg-slate-950/90 px-4 py-2 text-sm text-amber-200 shadow-lg backdrop-blur">
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
            </div>
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
      </AnnotationCommandsProvider>
    </AnnotationProvider>
  );
};

export default AnnotationTool;
