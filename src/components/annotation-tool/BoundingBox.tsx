import React, { useState, useEffect, useCallback } from 'react';
import { useCoordinates } from '@/hooks/annotation/useCoordinates';

interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

interface Props {
  box: Box;
  isSelected: boolean;
  tool: 'draw' | 'move' | 'polygon';
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<Box>) => void;
}

// Clamp box resize by calculating from anchor point
const clampBoxResize = (
  anchorX: number, 
  anchorY: number, 
  cursorX: number, 
  cursorY: number,
  minSize: number = 0.01
) => {
  // Clamp cursor to bounds first
  const clampedCursorX = Math.max(0, Math.min(1, cursorX));
  const clampedCursorY = Math.max(0, Math.min(1, cursorY));
  
  // Calculate box from anchor to cursor
  const x = Math.min(anchorX, clampedCursorX);
  const y = Math.min(anchorY, clampedCursorY);
  const width = Math.max(minSize, Math.abs(clampedCursorX - anchorX));
  const height = Math.max(minSize, Math.abs(clampedCursorY - anchorY));
  
  return { x, y, width, height };
};
// Clamp box to stay within image bounds [0, 1]
const clampBox = (x: number, y: number, width: number, height: number) => {
  const clampedX = Math.max(0, Math.min(1 - width, x));
  const clampedY = Math.max(0, Math.min(1 - height, y));
  const clampedWidth = Math.max(0.01, Math.min(1 - clampedX, width));
  const clampedHeight = Math.max(0.01, Math.min(1 - clampedY, height));
  
  return { 
    x: clampedX, 
    y: clampedY, 
    width: clampedWidth, 
    height: clampedHeight 
  };
};

const BoundingBox: React.FC<Props> = ({ box,isSelected, tool, onSelect, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<string | null>(null);
  const { getScaledCoordinates } = useCoordinates();

  const handleMouseDown = useCallback((e: React.MouseEvent, type: string | null = null) => {
    if (tool !== 'move') return;
    
    e.stopPropagation();
    onSelect();

    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);

    if (type) {
      setResizing(type);
    } else {
      setIsDragging(true);
    }

    setDragStart({
      x: x - box.x,
      y: y - box.y
    });
  }, [tool, onSelect, getScaledCoordinates, box.x, box.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !resizing) return;

    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);

    if (isDragging) {
      const newX = x - dragStart.x;
      const newY = y - dragStart.y;
      
      // Clamp position to keep box in bounds
      const clamped = clampBox(newX, newY, box.width, box.height);

      onUpdate(box.id, {
        x: clamped.x,
        y: clamped.y
      });
    } else if (resizing) {
      let updates: Partial<Box> = {};
      switch (resizing) {
        case 'nw':
          // Anchor: bottom-right
          updates = clampBoxResize(box.x + box.width, box.y + box.height, x, y);
          break;
        case 'ne':
          // Anchor: bottom-left
          updates = clampBoxResize(box.x, box.y + box.height, x, y);
          break;
        case 'sw':
          // Anchor: top-right
          updates = clampBoxResize(box.x + box.width, box.y, x, y);
          break;
        case 'se':
          // Anchor: top-left
          updates = clampBoxResize(box.x, box.y, x, y);
          break;
      }
      onUpdate(box.id, updates);
    }
  }, [isDragging, resizing, getScaledCoordinates, box.id, box.x, box.y, box.width, box.height, dragStart.x, dragStart.y, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, resizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    console.log(`Box ${box.id} rendered`);
  });

  const boxClasses = [
    "absolute border-2 cursor-move",
    isSelected ? "bg-[rgba(128,0,255,0.281)]" : "",
    tool !== 'move' ? "pointer-events-none" : ""
  ].filter(Boolean).join(' ');

  return (
    <div
      className={boxClasses}
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
        borderColor: `${box.color}`,
      }}
      onMouseDown={handleMouseDown}
    >
      {isSelected && tool === 'move' && (
        <>
          {/* Resize handle: top left */}
          <div 
            className="absolute w-3 h-3 bg-[var(--primary)] border-2 border-white -translate-x-1/2 -translate-y-1/2"
            style={{ left: 0, top: 0, cursor: "nw-resize" }}
            onMouseDown={(e) => handleMouseDown(e, 'nw')}
          />
          {/* Resize handle: top right */}
          <div 
            className="absolute w-3 h-3 bg-[var(--primary)] border-2 border-white translate-x-1/2 -translate-y-1/2"
            style={{ right: 0, top: 0, cursor: "ne-resize" }}
            onMouseDown={(e) => handleMouseDown(e, 'ne')}
          />
          {/* Resize handle: bottom left */}
          <div 
            className="absolute w-3 h-3 bg-[var(--primary)] border-2 border-white -translate-x-1/2 translate-y-1/2"
            style={{ left: 0, bottom: 0, cursor: "sw-resize" }}
            onMouseDown={(e) => handleMouseDown(e, 'sw')}
          />
          {/* Resize handle: bottom right */}
          <div 
            className="absolute w-3 h-3 bg-[var(--primary)] border-2 border-white translate-x-1/2 translate-y-1/2"
            style={{ right: 0, bottom: 0, cursor: "se-resize" }}
            onMouseDown={(e) => handleMouseDown(e, 'se')}
          />
        </>
      )}
    </div>
  );
};

// CRITICAL: Memoization with proper comparison
export default React.memo(BoundingBox, (prev, next) => {
  return (
    prev.box.id === next.box.id &&
    prev.box.x === next.box.x &&
    prev.box.y === next.box.y &&
    prev.box.width === next.box.width &&
    prev.box.height === next.box.height &&
    prev.box.color === next.box.color &&
    prev.isSelected === next.isSelected &&
    prev.tool === next.tool
  );
});