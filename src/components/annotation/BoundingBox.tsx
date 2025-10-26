import React, { useState, useEffect } from 'react';
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

const BoundingBox: React.FC<Props> = ({ box,isSelected, tool, onSelect, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<string | null>(null);
  const { getScaledCoordinates } = useCoordinates();

  const handleMouseDown = (e: React.MouseEvent, type: string | null = null) => {
    if (tool !== 'move') return;
    
    e.stopPropagation();
    onSelect();

    const { x, y} = getScaledCoordinates(e.clientX, e.clientY);

    if (type) {
      setResizing(type);
    } else {
      setIsDragging(true);
    }

    setDragStart({
      x: x - box.x,
      y: y - box.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging && !resizing) return;

    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);

    console.log("X ", x)
    console.log("Y", y)

    if (isDragging) {
      onUpdate(box.id, {
        x: x - dragStart.x,
        y: y - dragStart.y
      });
    } else if (resizing) {
      switch (resizing) {
        case 'nw':
          onUpdate(box.id, {
            x: x,
            y: y,
            width: box.width + (box.x - x),
            height: box.height + (box.y - y)
          });
          break;
        case 'ne':
          onUpdate(box.id, {
            y: y,
            width: x - box.x,
            height: box.height + (box.y - y)
          });
          break;
        case 'sw':
          onUpdate(box.id, {
            x: x,
            width: box.width + (box.x - x),
            height: y - box.y
          });
          break;
        case 'se':
          onUpdate(box.id, {
            width: x - box.x,
            height: y - box.y
          });
          break;
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizing(null);
  };

  useEffect(() => {
    if (isDragging || resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, resizing]);

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
      {/* {box.label && (
        <div 
          className="absolute text-white py-[2px] px-[4px] rounded-[2px] text-[10px]"
          style={{background: `${box.color}`}}
        >
          {box.label}
        </div>
      )} */}
    </div>
  );
};

export default BoundingBox;