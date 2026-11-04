import React, { useState, useRef, useEffect, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAnnotationState } from '@/contexts/AnnotationStateContext';
import { useAnnotationGeometry } from '@/contexts/AnnotationGeometryContext';
import { Box } from '@/types/annotation';
import { useDraw } from '@/hooks/useDraw';
import { useCoordinates } from '@/hooks/annotation/useCoordinates';
import { toast } from 'sonner';
import AnnotationEditor from './AnnotationEditor';
import GuideLines from './GuideLines';
import CurrentPolygon from './CurrentPolygon';
import DrawingBox from './DrawingBox';
import AnnotationLayer from './AnnotationLayer';
import SAMSuggestionLayer from '../SAMSuggestionLayer';
import { useZoom } from '@/hooks/useZoom';
import { ProjectImageOut } from '@/types/image';
import { useClasses } from '@/hooks/useClasses';
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import QueryState from '@/components/common/QueryState';
import { useSAMSession } from '@/hooks/useSAMSession';
import { useDirtyStateGuard } from '@/hooks/useDirtyStateGuard';
import { useAnnotationCommands } from '@/contexts/AnnotationCommandsContext';

interface CanvasProps {
  image: ProjectImageOut;
  samSession: ReturnType<typeof useSAMSession>;
  preserveZoom?: boolean; // Control zoom behavior
  selectedSuggestionId?: string;
  onSelectSuggestion?: (suggestionId: string) => void;
  hoveredSuggestionId?: string;
  onHoverSuggestion?: (id: string | null) => void;
  activeSAMTool?: 'points' | 'box' | 'text' | 'similar' | 'propagate' | 'auto' | null;
}
 
export interface CanvasHandle {
  loadImage: (image: ProjectImageOut) => void;
  resetZoom: () => void;
  saveCurrentAnnotation: () => void;
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(({ 
  image, 
  samSession, 
  preserveZoom = true,
  selectedSuggestionId,
  onSelectSuggestion,
  hoveredSuggestionId,
  onHoverSuggestion,
  activeSAMTool = null 
}, ref) => {

  const queryClient = useQueryClient();

  // Split context usage - only subscribe to what you need
  const {
    selectedBox,
    hoveredBoxId,
    selectedPolygon,
    tool,
    setTool,
    currentPolygon,
    setSelectedBox,
    setSelectedPolygon,
  } = useAnnotationState();

  const {
    addBox,
    updateBox,
    getBoxesArray,
    getPolygonsArray,
  } = useAnnotationGeometry();


  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { 
    startDrawing, 
    stopDrawing, 
    currentBox, 
    handleMouseMove: handleDrawMouseMove, 
    handleMouseEnter, 
    handleMouseLeave, 
    mousePosition, 
    showGuideLines, 
    handleCanvasClick, 
    handleContextMenu 
  } = useDraw(samSession);
  
  const { projectId } = useParams<{projectId: string}>()
  const { data: classes, isLoading, isError, refetch } = useClasses(projectId);
  const { getScaledCoordinates } = useCoordinates();
  
  const [annotationStartTime, setAnnotationStartTime] = useState<number | null>(null);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const prevToolRef = useRef<'draw' | 'move' | 'polygon' | null>(null);
  const [hasSyncedInitial, setHasSyncedInitial] = useState(false);
  const [currentImageId, setCurrentImageId] = useState(image.id);
  const { currentOrganization } = useCurrentOrganization();
  
  // CRITICAL: Stable zoom instance (persists across image changes)
  const {
    isDragging,
    scale: zoomScale,
    handleWheel,
    handleMouseDown: handleZoomMouseDown,
    handleMouseMove: handleZoomMouseMove,
    handleMouseUp,
    getTransformStyle,
    resetZoom: resetZoomInternal,
  } = useZoom({
    minScale: 0.25,
    maxScale: 10,
    scaleStep: 0.25,
    initialScale: 1,
  });


  // Native image dimensions, so overlays report sizes in image pixels rather
  // than screen pixels (which would change with zoom).
  const imageSize = useMemo(
    () => (image.image?.width && image.image?.height
      ? { width: image.image.width, height: image.image.height }
      : null),
    [image.image?.width, image.image?.height],
  );

  const commands = useAnnotationCommands();
  const { load: loadAnnotations, commit, remove, setClass } = commands;

  useDirtyStateGuard({
    isDirty: commands.hasUnsavedWork,
    message: 'You have unsaved annotations. Leave without saving?'
  });

  // IMPERATIVE API: Load new image without remounting
  useImperativeHandle(ref, () => ({
    loadImage: (newImage: ProjectImageOut) => {
      setCurrentImageId(newImage.id);

      // Reset zoom if configured
      if (!preserveZoom) {
        resetZoomInternal();
      }

      // Clear selection (but keep tool)
      setSelectedBox(null);
      setSelectedPolygon(null);
      loadAnnotations(newImage);
    },

    resetZoom: () => {
      resetZoomInternal();
    },

    saveCurrentAnnotation: () => {
      if (selectedBox) handleSave();
    },
  }));

  // Auto-load on mount and when the image changes
  useEffect(() => {
    if (image.id !== currentImageId || !hasSyncedInitial) {
      loadAnnotations(image);
      setCurrentImageId(image.id);
      setHasSyncedInitial(true);
      setAnnotationStartTime(null);

      if (!preserveZoom) {
        resetZoomInternal();
      }
    }
  }, [image, currentImageId, hasSyncedInitial, preserveZoom, resetZoomInternal, loadAnnotations]);

  const handleSave = () => {
    if (!selectedBox) return;
    const timeSeconds = annotationStartTime ? (Date.now() - annotationStartTime) / 1000 : null;
    commit(selectedBox, undefined, { timeSeconds });
    setAnnotationStartTime(null);
  };

  const handleDelete = useCallback((id: string) => {
    if (id) remove(id);
  }, [remove]);

  // CRITICAL: Now uses Map.set internally - O(1) operation
  const updateBoxPosition = useCallback((id: string, updates: Partial<Box>) => {
    updateBox(id, updates);
  }, [updateBox]);

  // A finished drag/resize saves right away (one undo step). Drafts without a
  // class are skipped by commit() and saved when they get one.
  const handleBoxChangeEnd = useCallback((id: string, finalGeometry: Partial<Box>) => {
    commit(id, finalGeometry);
  }, [commit]);

  useEffect(() => {
    const isTyping = (e: KeyboardEvent) =>
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement)?.isContentEditable;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') { setIsCtrlPressed(true); return; }
      if (e.key === 'Alt')     { setIsAltPressed(true);  return; }
      if (isTyping(e)) return;
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // With a box selected, 1–9 give it a class and save it in one keystroke.
      if (selectedBox && /^[1-9]$/.test(e.key)) {
        const choice = classes?.[Number(e.key) - 1];
        if (choice) {
          e.preventDefault();
          setClass(selectedBox, { name: choice.name, color: choice.color, classId: choice.classId });
          setSelectedBox(null);
          setAnnotationStartTime(null);
        }
        return;
      }

      switch (e.key) {
        case 'Enter':
          // Enter saves the selected box; with nothing selected it approves the image.
          if (selectedBox) {
            e.preventDefault();
            // An unlabeled box stays open in the editor until it gets a class.
            if (!getBoxesArray().find((b) => b.id === selectedBox)?.label?.trim()) break;
            handleSave();
            setSelectedBox(null);
          }
          break;
        case 'Escape':
          if (tool === 'polygon' && currentPolygon) toast.error('Polygon drawing cancelled');
          else if (selectedBox) {
            commands.revert(selectedBox);
            setSelectedBox(null);
          }
          break;
        case '1': case 'd': case 'D':
          prevToolRef.current = null;
          setTool('draw');
          break;
        case '2': case 'm': case 'M':
          prevToolRef.current = null;
          setTool('move');
          break;
        case '3':
          prevToolRef.current = null;
          setTool('polygon');
          break;
        case 'Delete': case 'Backspace':
          if (selectedBox) handleDelete(selectedBox);
          break;
        // Hold S → temporary move/select mode (returns to draw on keyup)
        case 's': case 'S':
          if (tool === 'draw' && !prevToolRef.current) {
            prevToolRef.current = 'draw';
            setTool('move');
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') { setIsCtrlPressed(false); return; }
      if (e.key === 'Alt')     { setIsAltPressed(false);  return; }
      if ((e.key === 's' || e.key === 'S') && prevToolRef.current) {
        setTool(prevToolRef.current);
        prevToolRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleSave reads current state each render
  }, [tool, currentPolygon, selectedBox, handleDelete, setTool, classes, setClass, setSelectedBox, commands.revert, getBoxesArray]);

  // Combined mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // SAM Point Click Mode - intercept clicks
    if (samSession.isSessionActive && activeSAMTool === 'points') {
      const { x, y } = getScaledCoordinates(e.clientX, e.clientY);
      const label = e.button === 2 ? 0 : 1; // Right-click = negative, left = positive
      samSession.addPoint({ x, y, label });
      return; // Don't start drawing
    }
  
    // Allow panning with Alt key or middle mouse button
    if (e.altKey || e.button === 1) {
      handleZoomMouseDown(e);
    } else {
  
      if (!annotationStartTime) {
        setAnnotationStartTime(Date.now());
      }
      // Otherwise handle drawing
      startDrawing(e, tool);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      // If we're panning, handle zoom mouse move
      handleZoomMouseMove(e);
    } else {
      // Otherwise handle drawing mouse move
      handleDrawMouseMove(e, tool);
    }
  };

  const handleAcceptSuggestions = (suggestionIds: string[]) => {
    const toAccept = samSession.suggestions.filter(s => suggestionIds.includes(s.id));
    const first = toAccept[0];
    samSession.acceptSuggestions(
      {
        suggestionIds,
        classId: undefined,
        className: first?.suggested_class_name || undefined,
      },
      {
        onSuccess: () => {
          for (const s of toAccept) {
            const resolvedClass = classes?.find(c =>
              c.name.toLowerCase() === (s.suggested_class_name || '').toLowerCase()
            );
            addBox({
              id: s.id,
              x: s.bbox.x,
              y: s.bbox.y,
              width: s.bbox.width,
              height: s.bbox.height,
              label: s.suggested_class_name || resolvedClass?.name || '',
              color: resolvedClass?.color || '#888888',
              class_id: resolvedClass?.classId || 0,
            });
          }
          // CRITICAL: Invalidate cache so previous/next images reload fresh data
          queryClient.invalidateQueries({ 
            queryKey: ['projectImageDetails', currentOrganization?.id, projectId, image.image.image_id] 
          });

        },
      },
    );
  };

  // Get appropriate cursor based on current state
  const getCursor = () => {
    if (isDragging) return 'grabbing';
    if (isAltPressed) return 'grab';
    if (isCtrlPressed) return 'zoom-in';
    if (samSession.isSessionActive && activeSAMTool === 'points') return 'crosshair';
    return 'crosshair';
  };

  if (isError || isLoading) {
    return (
      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingMessage="Loading annotations..."
        errorMessage="Failed to fetch annotations. Please try again."
      />
    );
  }


  return (
    <div className="flex relative p-4 flex-1 justify-center items-center w-full h-full">
      {selectedBox && (
        <AnnotationEditor
          classes={classes || []}
          onSaveClass={handleSave}
          onDeleteClass={handleDelete}
          onCancel={commands.revert}
        />
      )}

      <div 
        className="relative flex flex-1 overflow-hidden w-full h-full justify-center items-center"
        onWheel={handleWheel}
        ref={canvasRef}
      >
        {/* Transformable Content */}
        <div
          ref={contentRef}
          style={{
            ...getTransformStyle(),
            cursor: getCursor(),
          }}
          className="absolute"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => {
            handleMouseUp();
            stopDrawing();
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => !isDragging && handleCanvasClick(e, tool)}
          onContextMenu={(e) => handleContextMenu(e, tool)}
        >
          {/* `--zoom` lets overlays (handles, badges, strokes, guide lines) cancel the
              zoom transform in CSS and keep a constant size on screen. */}
          <div
            className="annotation-canvas relative bg-[beige] justify-center items-center"
            style={{ '--zoom': zoomScale } as React.CSSProperties}
          >
            <img
              key={image.id}
              src={image.image.download_url}
              alt="Sample image"
              className="object-contain select-none w-full max-h-[800px]"
              onDragStart={(e) => e.preventDefault()}
            />

            <AnnotationLayer
              boxes={getBoxesArray()}
              polygons={getPolygonsArray()}
              selectedBox={selectedBox}
              selectedPolygon={selectedPolygon}
              hoveredBoxId={hoveredBoxId}
              tool={tool}
              imageSize={imageSize}
              setSelectedBox={setSelectedBox}
              setSelectedPolygon={setSelectedPolygon}
              updateBoxPosition={updateBoxPosition}
              onBoxChangeEnd={handleBoxChangeEnd}
            />

            <SAMSuggestionLayer
              suggestions={samSession.suggestions}
              points={samSession.points}
              selectedSuggestionId={selectedSuggestionId}
              hoveredSuggestionId={hoveredSuggestionId}
              onHoverSuggestion={onHoverSuggestion}
              onSelect={onSelectSuggestion}
              onAccept={(id: string) => handleAcceptSuggestions([id])}
              onReject={(id: string) => samSession.rejectSuggestions([id])}
            />
            
            <DrawingBox currentBox={currentBox} imageSize={imageSize} />
            <CurrentPolygon currentPolygon={currentPolygon} mousePosition={mousePosition} />
            <GuideLines mousePosition={mousePosition} showGuideLines={showGuideLines} />
          </div>
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
