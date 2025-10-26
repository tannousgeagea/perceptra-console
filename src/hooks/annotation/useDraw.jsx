import { useState } from 'react';
import { useCoordinates } from '@/hooks/annotation/useCoordinates';
import { useAnnotation } from '@/contexts/AnnotationContext';
import { toast } from '@/hooks/use-toast';

export const useDraw = (boxes, setBoxes, setSelectedBox) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState(null);
  const { getScaledCoordinates } = useCoordinates();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showGuideLines, setShowGuideLines] = useState(true);

  const {
    currentPolygon,
    addPointToCurrentPolygon,
    finalizeCurrentPolygon
  } = useAnnotation();

  const startDrawing = (e, tool) => {
    if (tool !== 'draw') return;
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);

    const newBox = {
      id: Date.now().toString(),
      x,
      y,
      width: 0,
      height: 0,
      label: '',
    };

    setCurrentBox(newBox);
    setIsDrawing(true);
  };

  const draw = (e, tool) => {
    if (!isDrawing || !currentBox || tool !== 'draw') return;
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);

    setCurrentBox({
      ...currentBox,
      width: x - currentBox.x,
      height: y - currentBox.y,
    });
  };

  const handleMouseMove = (e, tool) => {
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);
    setMousePosition({ x, y });
    
    // Call draw for when drawing is in progress
    draw(e, tool);
  };

  const handleMouseEnter = () => {
    setShowGuideLines(true);
  };

  const handleMouseLeave = () => {
    setShowGuideLines(false);
    stopDrawing();
  };

  const stopDrawing = () => {
    if (isDrawing && currentBox && Math.abs(currentBox.width) > 0.00625 && Math.abs(currentBox.height) > 0.00625) {
      const normalizedBox = {
        ...currentBox,
        x: Math.min(currentBox.x, currentBox.x + currentBox.width),
        y: Math.min(currentBox.y, currentBox.y + currentBox.height),
        width: Math.abs(currentBox.width),
        height: Math.abs(currentBox.height),
      };
      setBoxes([...boxes, normalizedBox]);
      setSelectedBox(normalizedBox.id);
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  const handleCanvasClick = (e, tool) => {
    if (tool !== 'polygon') return;
    
    e.stopPropagation();
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);
    
    if (e.detail === 2 && currentPolygon && currentPolygon.length >= 2) {
      finalizeCurrentPolygon();
      toast.success('Polygon created');
    } else {
      addPointToCurrentPolygon({ x, y });
    }
  };

  const handleContextMenu = (e, tool) => {
    e.preventDefault();
    
    if (tool === 'polygon' && currentPolygon) {
      if (currentPolygon.length >= 3) {
        finalizeCurrentPolygon();
        toast({
          title: 'Polygon created',
          variant: "success"
        });
      } else {
        toast({
          title: "Polygon Failed",
          description: "Need at least 3 points",
          variant: "warning",

      });
      }
    }
  };

  return { 
    startDrawing, 
    draw, 
    stopDrawing, 
    currentBox,
    currentPolygon,
    handleMouseMove, 
    handleMouseEnter, 
    handleMouseLeave, 
    mousePosition, 
    showGuideLines,
    handleCanvasClick,
    handleContextMenu
   };
};
