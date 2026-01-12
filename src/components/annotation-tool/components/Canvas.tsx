import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAnnotation, Box } from '@/contexts/AnnotationContext';
import { useDraw } from '@/hooks/useDraw';
import { toast } from 'sonner';
import AnnotationEditor from './AnnotationEditor';
import GuideLines from './GuideLines';
import CurrentPolygon from './CurrentPolygon';
import DrawingBox from './DrawingBox';
import AnnotationLayer from './AnnotationLayer';
import { useZoom } from '@/hooks/useZoom';
import { ProjectImageOut } from '@/types/image';
import { useClasses } from '@/hooks/useClasses';
import QueryState from '@/components/common/QueryState';
import { useCreateAnnotation, useDeleteAnnotation, useAnnotations } from '@/hooks/useAnnotations';
import { useSAMSession } from '@/hooks/useSAMSession';

interface CanvasProps {
  image: ProjectImageOut;
  samSession: ReturnType<typeof useSAMSession>; // ADD THIS
}

  

const Canvas: React.FC<CanvasProps> = ({ image, samSession }) => {
  const {
    boxes,
    polygons,
    selectedBox,
    selectedPolygon,
    tool,
    currentPolygon,
    setBoxes,
    setSelectedBox,
    setSelectedPolygon,
  } = useAnnotation();

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
  const { mutate: deleteAnnotation } = useDeleteAnnotation();
  const { 
    data: annotationsData, 
    isLoading: isLoadingAnnotations 
  } = useAnnotations(
    projectId!,
    Number(image.image.id)
  );

  const [annotationStartTime, setAnnotationStartTime] = useState<number | null>(null);
  const { mutate: createAnnotation } = useCreateAnnotation(
    projectId!,
    Number(image.image.id)
  );

  // Track if the control key is pressed
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);

  // CRITICAL FIX: Only sync data layer ONCE on initial mount
  const [hasSyncedInitial, setHasSyncedInitial] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const {
    isDragging,
    handleWheel,
    handleMouseDown: handleZoomMouseDown,
    handleMouseMove: handleZoomMouseMove,
    handleMouseUp,
    getTransformStyle,
  } = useZoom({
    minScale: 0.25,
    maxScale: 10,
    scaleStep: 0.25,
    initialScale: 1,
  });
  
  useEffect(() => {
    if (annotationsData?.annotations && !hasSyncedInitial && !isDirty) {
      setBoxes(annotationsData.annotations.map(ann => ({
        id: ann.annotation_uid,
        x: ann.data.x,
        y: ann.data.y,
        width: ann.data.width,
        height: ann.data.height,
        label: ann.class_name,
        color: ann.color,
        class_id: ann.class_id,
      })));
      setHasSyncedInitial(true);
    }
  }, [annotationsData, hasSyncedInitial, isDirty, setBoxes]);

  // Reset sync state when image changes
  useEffect(() => {
    setHasSyncedInitial(false);
    setIsDirty(false);
  }, [image.image.id]);

  const getRandomColor = (): string => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleSave = async () => {
    if (image) {
      const annotation = boxes.find((b: Box) => b.id === selectedBox);
      if (annotation) {
        if (!annotation.color) {
          const color = getRandomColor();
          annotation.color = color;
        }
      
        // Calculate annotation time
        const annotationTimeSeconds = annotationStartTime 
          ? (Date.now() - annotationStartTime) / 1000 
          : null;

        createAnnotation({
          annotation_type: 'box',
          annotation_class_name: annotation.label, // person class
          data: [
            annotation.x, 
            annotation.y, 
            annotation.x + annotation.width, 
            annotation.y + annotation.height
          ],
          annotation_source: 'manual',
          confidence: 1.0,
          annotation_uid: annotation.id,
          annotation_time_seconds: annotationTimeSeconds!,
        });

        setAnnotationStartTime(null);
        setIsDirty(false); // Mark as saved
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!projectId) {
      toast.warning("Project ID is undefined")
      return;
    }

    if (id) {
      deleteAnnotation({
        projectId,
        annotationId: id,
        hardDelete: false
      });
    }
  };

  // FIXED: Wrap in useCallback to prevent recreating on every render
  const updateBoxPosition = useCallback((id: string, updates: Partial<Box>) => {
    setBoxes(boxes.map((box: Box) => 
      box.id === id ? { ...box, ...updates } : box
    ));
    setIsDirty(true); // Mark as dirty when user edits
  }, [boxes, setBoxes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        setIsCtrlPressed(true);
      } else if (e.key === 'Alt') {
        setIsAltPressed(true);
      } else if (e.key === 'Escape' && tool === 'polygon' && currentPolygon) {
        toast.error('Polygon drawing cancelled');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        setIsCtrlPressed(false);
      } else if (e.key === 'Alt') {
        setIsAltPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [tool, currentPolygon]);

  // Combined mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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

  // Get appropriate cursor based on current state
  const getCursor = () => {
    if (isDragging) return 'grabbing';
    if (isAltPressed) return 'grab';
    if (isCtrlPressed) return 'zoom-in';
    return 'crosshair';
  };

  if (isError || isLoading || isLoadingAnnotations) {
    return (
      <QueryState
        isLoading={isLoading || isLoadingAnnotations}
        isError={isError}
        onRetry={refetch}
        loadingMessage="Loading annotations..."
        errorMessage="Failed to fetch annotations. Please try again."
      />
    );
  }

  // Render SAM suggestions as overlays
  const renderSAMSuggestions = () => {
    if (!samSession.suggestions.length) return null;
    
    return samSession.suggestions
      .filter(s => s.status === 'pending')
      .map(suggestion => (
        <div
          key={suggestion.id}
          className="absolute border-2 border-blue-400 bg-blue-500/20 cursor-pointer hover:bg-blue-500/30 transition-colors"
          style={{
            left: `${suggestion.bbox.x * 100}%`,
            top: `${suggestion.bbox.y * 100}%`,
            width: `${suggestion.bbox.width * 100}%`,
            height: `${suggestion.bbox.height * 100}%`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            samSession.acceptSuggestions({ suggestionIds: [suggestion.id] });
          }}
        >
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {suggestion.suggested_label || 'AI'} ({Math.round(suggestion.confidence * 100)}%)
          </div>
        </div>
      ));
  };

  // Render SAM points being collected
  const renderSAMPoints = () => {
    if (!samSession.isSessionActive || !samSession.points.length) return null;
    
    return samSession.points.map((point, index) => (
      <div
        key={index}
        className="absolute w-3 h-3 rounded-full border-2 border-white pointer-events-none"
        style={{
          left: `${point.x * 100}%`,
          top: `${point.y * 100}%`,
          backgroundColor: point.label === 1 ? '#22c55e' : '#ef4444',
          transform: 'translate(-50%, -50%)',
        }}
      />
    ));
  };


  return (
    <div className="flex relative p-4 flex-1 justify-center items-center w-full h-full">
      {selectedBox && (
        <AnnotationEditor
          classes={classes || []}
          onSaveClass={handleSave}
          onDeleteClass={handleDelete}
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
          onMouseUp={(e) => {
            handleMouseUp();
            stopDrawing();
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => !isDragging && handleCanvasClick(e, tool)}
          onContextMenu={(e) => handleContextMenu(e, tool)}
        >
          <div className="annotation-canvas relative bg-[beige] justify-center items-center">
            <img 
              src={image.image.download_url}
              alt="Sample image"
              className="object-contain select-none w-full max-h-[800px]"
              onDragStart={(e) => e.preventDefault()}
            />

            <AnnotationLayer
              boxes={boxes}
              polygons={polygons}
              selectedBox={selectedBox}
              selectedPolygon={selectedPolygon}
              tool={tool}
              setSelectedBox={setSelectedBox}
              setSelectedPolygon={setSelectedPolygon}
              updateBoxPosition={updateBoxPosition}
            />

            {/* SAM Suggestions */}
            {renderSAMSuggestions()}
            
            {/* SAM Points */}
            {renderSAMPoints()}
            
            <DrawingBox currentBox={currentBox} />
            <CurrentPolygon currentPolygon={currentPolygon} mousePosition={mousePosition} />
            <GuideLines mousePosition={mousePosition} showGuideLines={showGuideLines} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
