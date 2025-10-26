import React, { createContext, useContext, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  id: string;
  points: Point[];
  label: string;
}

type AnnotationTool = 'draw' | 'move' | 'polygon';

export interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

interface AnnotationContextType {
  boxes: Box[];
  polygons: Polygon[];
  selectedBox: string | null;
  selectedPolygon: string | null;
  tool: AnnotationTool;
  currentPolygon: Point[] | null;
  setBoxes: (boxes: Box[]) => void;
  setPolygons: (polygons: Polygon[]) => void;
  setSelectedBox: (id: string | null) => void;
  setSelectedPolygon: (id: string | null) => void;
  setTool: (tool: AnnotationTool) => void;
  setCurrentPolygon: (points: Point[] | null) => void;
  addPointToCurrentPolygon: (point: Point) => void;
  finalizeCurrentPolygon: () => void;
}

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

export const AnnotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null);
  const [tool, setTool] = useState<AnnotationTool>('draw');
  const [currentPolygon, setCurrentPolygon] = useState<Point[] | null>(null);

  const addPointToCurrentPolygon = (point: Point) => {
    if (currentPolygon) {
      setCurrentPolygon([...currentPolygon, point]);
    } else {
      setCurrentPolygon([point]);
    }
  };

  const finalizeCurrentPolygon = () => {
    if (currentPolygon && currentPolygon.length >= 3) {
      const newPolygon: Polygon = {
        id: Date.now().toString(),
        points: [...currentPolygon],
        label: ''
      };
      setPolygons([...polygons, newPolygon]);
      setSelectedPolygon(newPolygon.id);
      setCurrentPolygon(null);
    }
  };

  return (
    <AnnotationContext.Provider
      value={{
        boxes,
        polygons,
        selectedBox,
        selectedPolygon,
        tool,
        currentPolygon,
        setBoxes,
        setPolygons,
        setSelectedBox,
        setSelectedPolygon,
        setTool,
        setCurrentPolygon,
        addPointToCurrentPolygon,
        finalizeCurrentPolygon,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
};

export const useAnnotation = () => {
  const context = useContext(AnnotationContext);
  if (context === undefined) {
    throw new Error('useAnnotation must be used within an AnnotationProvider');
  }
  return context;
};