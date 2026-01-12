import React from 'react';
import BoundingBox from '../BoundingBox';
import PolygonAnnotation from './PolygonAnnotation';
import { Box } from '@/contexts/AnnotationContext';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  id: string;
  points: Point[];
  label: string;
}

interface AnnotationLayerProps {
  boxes: Box[];
  polygons: Polygon[];
  selectedBox: string | null;
  selectedPolygon: string | null;
  tool: 'draw' | 'move' | 'polygon';
  setSelectedBox: (id: string | null) => void;
  setSelectedPolygon: (id: string | null) => void;
  updateBoxPosition: (id: string, updates: Partial<Box>) => void;
}

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  boxes,
  polygons,
  selectedBox,
  selectedPolygon,
  tool,
  setSelectedBox,
  setSelectedPolygon,
  updateBoxPosition
}) => {
  return (
    <>
      {boxes.map((box) => (
        <BoundingBox
          key={box.id}
          box={box}
          isSelected={selectedBox === box.id}
          tool={tool}
          onSelect={() => setSelectedBox(box.id)}
          onUpdate={updateBoxPosition}
        />
      ))}
      
      {polygons.map((polygon) => (
        <PolygonAnnotation
          key={polygon.id}
          polygon={polygon}
          isSelected={selectedPolygon === polygon.id}
          tool={tool}
          onSelect={() => setSelectedPolygon(polygon.id)}
        />
      ))}
    </>
  );
};

// CRITICAL: Memoize to prevent unnecessary rerenders
// Only rerender when boxes/polygons array changes, not on every parent render
export default React.memo(AnnotationLayer, (prev, next) => {
  // Check if boxes array has same items
  if (prev.boxes.length !== next.boxes.length) return false;
  
  // Check if any box has changed
  for (let i = 0; i < prev.boxes.length; i++) {
    const prevBox = prev.boxes[i];
    const nextBox = next.boxes[i];
    if (
      prevBox.id !== nextBox.id ||
      prevBox.x !== nextBox.x ||
      prevBox.y !== nextBox.y ||
      prevBox.width !== nextBox.width ||
      prevBox.height !== nextBox.height ||
      prevBox.color !== nextBox.color
    ) {
      return false;
    }
  }
  
  // Check other props
  return (
    prev.selectedBox === next.selectedBox &&
    prev.selectedPolygon === next.selectedPolygon &&
    prev.tool === next.tool &&
    prev.polygons.length === next.polygons.length
  );
});