import React, { useState, useRef, useEffect } from 'react';
import { useAnnotation } from '@/contexts/AnnotationContext';
import { useDraw } from '@/hooks/useDraw';
import useSaveAnnotation from '@/hooks/annotation/useSaveAnnotation';
import useDeleteAnnotation from "@/hooks/annotation/useDeleteAnnotation";
import useFetchAnnotationClasses from "@/hooks/annotation/useFetchAnnotationClasses";
import { toast } from '@/hooks/use-toast';
import AnnotationEditor from './AnnotationEditor';
import GuideLines from './GuideLines';
import CurrentPolygon from './CurrentPolygon';
import DrawingBox from './DrawingBox';
import AnnotationLayer from './AnnotationLayer';
import { baseURL } from '@/components/api/base';
import { useZoom } from '@/hooks/useZoom';


interface Image {
  image_id: string;
  image_url: string;
  project_id: string;
}

interface CanvasProps {
  image: Image;
}

interface Box {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    color: string;
  }
  

const Canvas: React.FC<CanvasProps> = ({ image }) => {
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
    addPointToCurrentPolygon,
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
  } = useDraw();
  const { classes } = useFetchAnnotationClasses(image.project_id);
  const { saveAnnotation } = useSaveAnnotation();
  const { deleteAnnotation } = useDeleteAnnotation();

  // Track if the control key is pressed
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);

  const {
    scale,
    offsetX,
    offsetY,
    isDragging,
    handleWheel,
    handleMouseDown: handleZoomMouseDown,
    handleMouseMove: handleZoomMouseMove,
    handleMouseUp,
    resetZoom,
    zoomIn,
    zoomOut,
    getTransformStyle,
  } = useZoom({
    minScale: 0.25,
    maxScale: 10,
    scaleStep: 0.25,
    initialScale: 1,
  });

  const fetchAnnotations = async (imageID: string, projectId: string) => {
    const response = await fetch(`${baseURL}/api/v1/annotations/${projectId}/${imageID}`);
    const data = await response.json();
    if (data) {
      // Assuming the API returns an array of objects with a "data" property containing the box.
      setBoxes(data.map((box: any) => box.data));
    }
  };

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
        await saveAnnotation(annotation, image.project_id, image.image_id);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (id) {
      await deleteAnnotation(id);
    }
  };

  useEffect(() => {
    if (image) fetchAnnotations(image.image_id, image.project_id);
  }, [image]);

  const updateBoxPosition = (id: string, updates: Partial<Box>) => {
    setBoxes(boxes.map((box: Box) => 
      box.id === id ? { ...box, ...updates } : box
    ));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      
      if (e.key === 'Control') {
        setIsCtrlPressed(true);
      } else if (e.key === 'Alt') {
        setIsAltPressed(true);
      } else if (e.key === 'Escape' && tool === 'polygon' && currentPolygon) {
        toast({
          title: 'Polygon drawing cancelled'
        });
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
  }, [tool, currentPolygon, addPointToCurrentPolygon]);

  // Combined mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Allow panning with Alt key or middle mouse button
    if (e.altKey || e.button === 1) {
      handleZoomMouseDown(e);
    } else {
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

  // Zoom functionality
  // const [scale, setScale] = useState(1);
  // const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
  //   e.preventDefault();
  //   // Adjust zoom sensitivity and clamp scale between 0.5 and 3
  //   let newScale = e.deltaY < 0 ? scale * 1.05 : scale / 1.05;
  //   newScale = Math.min(Math.max(newScale, 0.5), 3);
  //   setScale(newScale);
  // };

  return (
    <div className="flex relative p-4 flex-1 justify-center items-center w-full h-full">
      {selectedBox && (
        <AnnotationEditor
          classes={classes}
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
              src={image.image_url}
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
