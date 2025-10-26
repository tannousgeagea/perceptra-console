import React, { useState, useRef, useEffect } from 'react';
import { useAnnotation } from '@/contexts/AnnotationContext';
import { useDraw } from '@/hooks/annotation/useDraw';
import useSaveAnnotation from '@/hooks/annotation/useSaveAnnotation';
import useDeleteAnnotation from "@/hooks/annotation/useDeleteAnnotation";
import useFetchAnnotationClasses from "@/hooks/annotation/useFetchAnnotationClasses"
import { toast } from '@/hooks/use-toast';
import AnnotationEditor from './AnnotationEditor'
import GuideLines from './GuideLines'
import CurrentPolygon from './CurrentPolygon' 
import DrawingBox from './DrawingBox'
import AnnotationLayer from './AnnotationLayer'
import { baseURL } from '@/components/api/base';
import './Canvas.css'

const Canvas = ({ image }) => {
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
    addPointToCurrentPolygon
  } = useAnnotation();
  const canvasRef = useRef(null);
  const { 
    startDrawing, 
    stopDrawing, 
    currentBox, 
    handleMouseMove, 
    handleMouseEnter, 
    handleMouseLeave, 
    mousePosition, 
    showGuideLines, 
    handleCanvasClick, 
    handleContextMenu 
  } = useDraw(boxes, setBoxes, setSelectedBox);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const { classes, loading: classesLoading, error: classerError } = useFetchAnnotationClasses(image.project_id)
  const { saveAnnotation, loading: saveLoading, error: saveError, success: saveSuccess } = useSaveAnnotation();
  const { deleteAnnotation, loading: deleteLoading, error: deleteError, success: deleteSuccess  } = useDeleteAnnotation();

  const updateCanvasDimensions = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCanvasDimensions({ width: rect.width, height: rect.height });
    }
  };

  const fetchAnnotations = async (imageID, projectId) => {
    const response = await fetch(`${baseURL}/api/v1/annotations/${projectId}/${imageID}`);
    const data = await response.json();
    if (data) {
      setBoxes(data.map(box =>
        box.data
      ));
    }
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleSave = async () => {
    if (image) {
      const annotation = boxes.find((b) => b.id === selectedBox);
      if (!annotation.color){
        const color = getRandomColor()
        annotation.color = color
      }
      await saveAnnotation(annotation, image.project_id, image.image_id);
    };
  };

  const handleDelete = async (id) => {
    if (id) {
      await deleteAnnotation(id)
    }
  }

  useEffect(() => {
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    if (image) fetchAnnotations(image.image_id, image.project_id);
    return () => window.removeEventListener('resize', updateCanvasDimensions);
  }, [image]);

  const updateBoxPosition = (id, updates) => {
    setBoxes(boxes.map(box => 
      box.id === id ? { ...box, ...updates } : box
    ));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && tool === 'polygon' && currentPolygon) {
        addPointToCurrentPolygon(null);
        toast.info('Polygon drawing cancelled');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tool, currentPolygon]);


  console.log(mousePosition)
  return (
    <div className="flex relative p-4 flex-1 justify-center items-center w-full">
      {selectedBox &&
        <AnnotationEditor
          classes={classes}
          onSaveClass={handleSave}
          onDeleteClass={handleDelete}
        />
      }

      <div
        ref={canvasRef}
        className="relative flex bg-[#f5f5dc] justify-center items-center max-w-[1000px] cursor-crosshair h-[500px]"
        onMouseDown={(e) => startDrawing(e, tool)}
        onMouseMove={(e) => handleMouseMove(e, tool)}
        onMouseUp={stopDrawing}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => handleCanvasClick(e, tool)}
        onContextMenu={(e) => handleContextMenu(e, tool)}
      >
        <img 
          src={image.image_url}
          alt="Sample image"
          className="object-contain select-none w-full h-full"
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
        
        <DrawingBox currentBox={currentBox}/>
        <CurrentPolygon currentPolygon={currentPolygon} mousePosition={mousePosition} />
        <GuideLines mousePosition={mousePosition} showGuideLines={showGuideLines}/>
      </div>
    </div>
  );
};

export default Canvas;