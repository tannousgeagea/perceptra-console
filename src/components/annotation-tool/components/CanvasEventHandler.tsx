import React, { useState, useEffect } from 'react';
import { useCoordinates } from '@/hooks/annotation/useCoordinates';
import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
}

interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface CanvasEventHandlerProps {
  children: React.ReactNode;
  tool: 'draw' | 'move' | 'polygon';
  onMousePositionChange: (position: { x: number; y: number }) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  currentPolygon: Point[] | null;
  addPointToCurrentPolygon: (point: Point) => void;
  finalizeCurrentPolygon: () => void;
  startDrawing: (position: { x: number; y: number }) => void;
  draw: (position: { x: number; y: number }) => void;
  stopDrawing: () => void;
}

const CanvasEventHandler: React.FC<CanvasEventHandlerProps> = ({
  children,
  tool,
  onMousePositionChange,
  onMouseEnter,
  onMouseLeave,
  currentPolygon,
  addPointToCurrentPolygon,
  finalizeCurrentPolygon,
  startDrawing,
  draw,
  stopDrawing
}) => {
  const { getScaledCoordinates } = useCoordinates();
  
  const handleCanvasClick = (e: React.MouseEvent) => {
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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (tool === 'polygon' && currentPolygon) {
      if (currentPolygon.length >= 3) {
        finalizeCurrentPolygon();
        toast.success('Polygon created');
      } else {
        toast.error('Need at least 3 points for a polygon');
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool !== 'draw') return;
    
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);
    startDrawing({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);
    onMousePositionChange({ x, y });
    
    if (tool === 'draw') {
      draw({ x, y });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && tool === 'polygon' && currentPolygon) {
        addPointToCurrentPolygon(null);
        toast.info('Polygon drawing cancelled');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tool, currentPolygon, addPointToCurrentPolygon]);

  return (
    <div
      className="relative w-[800px] h-[600px] overflow-hidden annotation-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrawing}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleCanvasClick}
      onContextMenu={handleContextMenu}
    >
      {children}
    </div>
  );
};

export default CanvasEventHandler;