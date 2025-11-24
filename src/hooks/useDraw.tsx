import { useState } from 'react';
import { useCoordinates } from '@/hooks/annotation/useCoordinates';
import { useAnnotation } from '@/contexts/AnnotationContext';
import { toast } from '@/hooks/use-toast';
import type { UseSAMSessionReturn } from '@/hooks/useSAMSession'; // ADD THIS TYPE


export interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

export interface Point {
  x: number;
  y: number;
}

type Tool = 'draw' | 'polygon' | 'move';

interface UseDrawReturn {
  startDrawing: (e: React.MouseEvent<HTMLElement>, tool: Tool) => void;
  draw: (e: React.MouseEvent<HTMLElement>, tool: Tool) => void;
  stopDrawing: () => void;
  currentBox: Box | null;
  currentPolygon: Point[] | null;
  handleMouseMove: (e: React.MouseEvent<HTMLElement>, tool: Tool) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  mousePosition: Point;
  showGuideLines: boolean;
  handleCanvasClick: (e: React.MouseEvent<HTMLElement>, tool: Tool) => void;
  handleContextMenu: (e: React.MouseEvent<HTMLElement>, tool: Tool) => void;
}

export const useDraw = (
  samSession?: ReturnType<typeof import('@/hooks/useSAMSession').useSAMSession>
): UseDrawReturn => {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentBox, setCurrentBox] = useState<Box | null>(null);
  const { getScaledCoordinates } = useCoordinates();
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });
  const [showGuideLines, setShowGuideLines] = useState<boolean>(true);

  const { 
    boxes,
    currentPolygon,
    setBoxes,
    setSelectedBox, 
    addPointToCurrentPolygon, 
    finalizeCurrentPolygon 
  } = useAnnotation();

  const startDrawing = (e: React.MouseEvent<HTMLElement>, tool: Tool) => {
    if (tool !== 'draw') return;
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);

    const newBox: Box = {
      id: Date.now().toString(),
      x,
      y,
      width: 0,
      height: 0,
      label: '',
      color: '',
    };

    setCurrentBox(newBox);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLElement>, tool: Tool) => {
    if (!isDrawing || !currentBox || tool !== 'draw') return;
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);

    setCurrentBox({
      ...currentBox,
      width: x - currentBox.x,
      height: y - currentBox.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>, tool: Tool) => {
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);
    setMousePosition({ x, y });
    // Update drawing if in progress
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
    if (
      isDrawing &&
      currentBox &&
      Math.abs(currentBox.width) > 0.00625 &&
      Math.abs(currentBox.height) > 0.00625
    ) {
      const normalizedBox: Box = {
        ...currentBox,
        x: Math.min(currentBox.x, currentBox.x + currentBox.width),
        y: Math.min(currentBox.y, currentBox.y + currentBox.height),
        width: Math.abs(currentBox.width),
        height: Math.abs(currentBox.height),
      };

      if (samSession?.isSessionActive) {
        samSession.segmentWithBox({
          x: normalizedBox.x,
          y: normalizedBox.y,
          width: normalizedBox.width,
          height: normalizedBox.height,
        });

      } else {
        setBoxes([...boxes, normalizedBox]);
        setSelectedBox(normalizedBox.id);
      };
    };
    setIsDrawing(false);
    setCurrentBox(null);
    setShowGuideLines(true);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLElement>, tool: Tool) => {
    // SAM point click mode (when session active and using draw tool)

    console.log(tool)
    console.log(samSession?.isSessionActive)
    if (tool === 'draw' && samSession?.isSessionActive) {
      e.stopPropagation();
      const { x, y } = getScaledCoordinates(e.clientX, e.clientY);
      const isRightClick = e.button === 2;
      
      samSession.addPoint({
        x,
        y,
        label: isRightClick ? 0 : 1, // 0 = negative, 1 = positive
      });
      return;
    }

    if (tool !== 'polygon') return;
    e.stopPropagation();
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);

    if (e.detail === 2 && currentPolygon && currentPolygon.length >= 2) {
      finalizeCurrentPolygon();
      toast({title: 'Polygon created'});
    } else {
      addPointToCurrentPolygon({ x, y });
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLElement>, tool: Tool) => {
    e.preventDefault();

    if (tool === 'polygon' && currentPolygon) {
      if (currentPolygon.length >= 3) {
        finalizeCurrentPolygon();
        toast({
          title: 'Polygon created',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Polygon Failed',
          description: 'Need at least 3 points',
          variant: 'warning',
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
