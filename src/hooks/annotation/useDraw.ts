import { useState, useCallback } from 'react';
import { useCoordinates } from '@/hooks/annotation/useCoordinates';
import { useAnnotation } from '@/contexts/AnnotationContext';
import { toast } from 'sonner';
import type { useSAMSession } from '@/hooks/useSAMSession';

type AnnotationTool = 'draw' | 'move' | 'polygon';

export const useDraw = (samSession: ReturnType<typeof useSAMSession>) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  } | null>(null);
  const { getScaledCoordinates } = useCoordinates();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showGuideLines, setShowGuideLines] = useState(true);

  // Get state from context
  const {
    boxes,
    setBoxes,
    setSelectedBox,
    currentPolygon,
    addPointToCurrentPolygon,
    finalizeCurrentPolygon
  } = useAnnotation();

  const startDrawing = useCallback((e: React.MouseEvent, tool: AnnotationTool) => {
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
  }, [getScaledCoordinates]);

  const draw = useCallback((e: React.MouseEvent, tool: AnnotationTool) => {
    if (!isDrawing || !currentBox || tool !== 'draw') return;
    
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);

    setCurrentBox({
      ...currentBox,
      width: x - currentBox.x,
      height: y - currentBox.y,
    });
  }, [isDrawing, currentBox, getScaledCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent, tool: AnnotationTool) => {
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);
    setMousePosition({ x, y });
    
    // Call draw for when drawing is in progress
    draw(e, tool);
  }, [getScaledCoordinates, draw]);

  const handleMouseEnter = useCallback(() => {
    setShowGuideLines(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowGuideLines(false);
    stopDrawing();
  }, []);

  const stopDrawing = useCallback(() => {
    if (isDrawing && currentBox && Math.abs(currentBox.width) > 0.00625 && Math.abs(currentBox.height) > 0.00625) {
      const normalizedBox = {
        ...currentBox,
        x: Math.min(currentBox.x, currentBox.x + currentBox.width),
        y: Math.min(currentBox.y, currentBox.y + currentBox.height),
        width: Math.abs(currentBox.width),
        height: Math.abs(currentBox.height),
        color: '', // Will be set on save
        class_id: 0, // Will be set when class is selected
      };
      setBoxes([...boxes, normalizedBox]);
      setSelectedBox(normalizedBox.id);
    }
    setIsDrawing(false);
    setCurrentBox(null);
  }, [isDrawing, currentBox, boxes, setBoxes, setSelectedBox]);

  const handleCanvasClick = useCallback((e: React.MouseEvent, tool: AnnotationTool) => {
    if (tool !== 'polygon') return;
    
    e.stopPropagation();
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);
    
    // Double-click to finalize
    if (e.detail === 2 && currentPolygon && currentPolygon.length >= 2) {
      finalizeCurrentPolygon();
      toast.success('Polygon created');
    } else {
      addPointToCurrentPolygon({ x, y });
    }
  }, [getScaledCoordinates, currentPolygon, addPointToCurrentPolygon, finalizeCurrentPolygon]);

  const handleContextMenu = useCallback((e: React.MouseEvent, tool: AnnotationTool) => {
    e.preventDefault();
    
    if (tool === 'polygon' && currentPolygon) {
      if (currentPolygon.length >= 3) {
        finalizeCurrentPolygon();
        toast.success('Polygon created');
      } else {
        toast.error('Need at least 3 points for polygon');
      }
    }
  }, [currentPolygon, finalizeCurrentPolygon]);

  return { 
    startDrawing, 
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
