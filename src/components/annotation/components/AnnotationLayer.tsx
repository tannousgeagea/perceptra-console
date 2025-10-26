import React from 'react';
import BoundingBox from '../BoundingBox';
import PolygonAnnotation from './PolygonAnnotation';

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
  color: string;
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

export default AnnotationLayer;