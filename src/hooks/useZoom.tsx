import { useState, useCallback, RefObject } from 'react';

interface ZoomPosition {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface ZoomState extends ZoomPosition {
  isDragging: boolean;
  startX: number;
  startY: number;
}

interface UseZoomOptions {
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  initialScale?: number;
}

export function useZoom({
  minScale = 0.5,
  maxScale = 5,
  scaleStep = 0.1,
  initialScale = 1,
}: UseZoomOptions = {}) {
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: initialScale,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
  });
  
  // Handle zoom with wheel only
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate zoom direction and new scale with reduced step size
      const delta = e.deltaY < 0 ? scaleStep * 0.25 : -scaleStep * 0.25;
      const newScale = Math.min(
        maxScale,
        Math.max(minScale, zoomState.scale + delta)
      );
      
      if (newScale === zoomState.scale) return;
      
      // Calculate new offsets to zoom towards cursor position
      const scaleFactor = newScale / zoomState.scale;
      
      // Point under mouse remains stationary during zoom
      const newOffsetX = mouseX - (mouseX - zoomState.offsetX) * scaleFactor;
      const newOffsetY = mouseY - (mouseY - zoomState.offsetY) * scaleFactor;
      
      setZoomState({
        ...zoomState,
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      });
    },
    [zoomState, minScale, maxScale, scaleStep]
  );
  
  // Start panning with middle mouse button or when in pan mode
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only trigger for middle mouse button (button 1) or Alt+left click
      const isPanTrigger = e.button === 1 || (e.button === 0 && e.altKey);
      if (!isPanTrigger) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      setZoomState({
        ...zoomState,
        isDragging: true,
        startX: e.clientX - zoomState.offsetX,
        startY: e.clientY - zoomState.offsetY,
      });
    },
    [zoomState]
  );
  
  // Update position while panning
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!zoomState.isDragging) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      setZoomState({
        ...zoomState,
        offsetX: e.clientX - zoomState.startX,
        offsetY: e.clientY - zoomState.startY,
      });
    },
    [zoomState]
  );
  
  // Stop panning
  const handleMouseUp = useCallback(() => {
    if (zoomState.isDragging) {
      setZoomState((prev) => ({
        ...prev,
        isDragging: false,
      }));
    }
  }, [zoomState.isDragging]);
  
  // Reset zoom to initial state
  const resetZoom = useCallback(() => {
    setZoomState({
      scale: initialScale,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      startX: 0,
      startY: 0,
    });
  }, [initialScale]);
  
  // Programmatically zoom in
  const zoomIn = useCallback(() => {
    setZoomState((prev) => {
      const newScale = Math.min(maxScale, prev.scale + scaleStep * 0.25);
      return { ...prev, scale: newScale };
    });
  }, [maxScale, scaleStep]);
  
  // Programmatically zoom out
  const zoomOut = useCallback(() => {
    setZoomState((prev) => {
      const newScale = Math.max(minScale, prev.scale - scaleStep * 0.25);
      return { ...prev, scale: newScale };
    });
  }, [minScale, scaleStep]);
  
  // Programmatically set zoom to a specific level and position
  const setZoom = useCallback((position: Partial<ZoomPosition>) => {
    setZoomState((prev) => ({
      ...prev,
      ...position,
      scale: position.scale 
        ? Math.min(maxScale, Math.max(minScale, position.scale)) 
        : prev.scale,
    }));
  }, [maxScale, minScale]);
  
  // Get transform CSS property for applying zoom with smooth transition
  const getTransformStyle = useCallback(() => {
    return {
      transform: `translate(${zoomState.offsetX}px, ${zoomState.offsetY}px) scale(${zoomState.scale})`,
      transformOrigin: '0 0',
      transition: zoomState.isDragging ? 'none' : 'transform 0.15s ease-out',
    };
  }, [zoomState.offsetX, zoomState.offsetY, zoomState.scale, zoomState.isDragging]);
  
  return {
    ...zoomState,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetZoom,
    zoomIn,
    zoomOut,
    setZoom,
    getTransformStyle,
  };
}