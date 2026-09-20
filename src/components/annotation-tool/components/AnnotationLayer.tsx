import React from 'react';
import BoundingBox from '../BoundingBox';
import PolygonAnnotation from './PolygonAnnotation';
import { Box } from '@/types/annotation';
import { ImageSize } from '@/hooks/annotation/useCoordinates';

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
  hoveredBoxId?: string | null;
  tool: 'draw' | 'move' | 'polygon';
  /** Native image size so boxes can report their dimensions in image pixels. */
  imageSize?: ImageSize | null;
  setSelectedBox: (id: string | null) => void;
  setSelectedPolygon: (id: string | null) => void;
  updateBoxPosition: (id: string, updates: Partial<Box>) => void;
}

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  boxes,
  polygons,
  selectedBox,
  selectedPolygon,
  hoveredBoxId,
  tool,
  imageSize,
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
          isHighlighted={hoveredBoxId === box.id}
          tool={tool}
          imageSize={imageSize}
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
      prevBox.color !== nextBox.color ||
      prevBox.label !== nextBox.label
    ) {
      return false;
    }
  }
  
  // Check other props
  return (
    prev.selectedBox === next.selectedBox &&
    prev.selectedPolygon === next.selectedPolygon &&
    prev.hoveredBoxId === next.hoveredBoxId &&
    prev.tool === next.tool &&
    prev.imageSize?.width === next.imageSize?.width &&
    prev.imageSize?.height === next.imageSize?.height &&
    prev.updateBoxPosition === next.updateBoxPosition &&
    prev.polygons.length === next.polygons.length
  );
});