import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnnotationTool, Point } from '@/types/annotation';

interface AnnotationStateContextType {
  // Selection state (cold - changes infrequently)
  selectedBox: string | null;
  selectedPolygon: string | null;
  setSelectedBox: (id: string | null) => void;
  setSelectedPolygon: (id: string | null) => void;
  
  // Tool state (cold)
  tool: AnnotationTool;
  setTool: (tool: AnnotationTool) => void;
  
  // Drawing state (cold - only during active drawing)
  currentPolygon: Point[] | null;
  setCurrentPolygon: (points: Point[] | null) => void;
  addPointToCurrentPolygon: (point: Point) => void;
  finalizeCurrentPolygon: () => void;
  
  // Polygon finalization callback
  onPolygonFinalized?: (points: Point[]) => void;
  setOnPolygonFinalized: (callback: (points: Point[]) => void) => void;
}

const AnnotationStateContext = createContext<AnnotationStateContextType | undefined>(undefined);

export const AnnotationStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null);
  const [tool, setTool] = useState<AnnotationTool>('draw');
  const [currentPolygon, setCurrentPolygon] = useState<Point[] | null>(null);
  const [onPolygonFinalized, setOnPolygonFinalized] = useState<((points: Point[]) => void) | undefined>();

  const addPointToCurrentPolygon = useCallback((point: Point) => {
    setCurrentPolygon(prev => prev ? [...prev, point] : [point]);
  }, []);

  const finalizeCurrentPolygon = useCallback(() => {
    if (currentPolygon && currentPolygon.length >= 3 && onPolygonFinalized) {
      onPolygonFinalized(currentPolygon);
      setCurrentPolygon(null);
    }
  }, [currentPolygon, onPolygonFinalized]);

  return (
    <AnnotationStateContext.Provider
      value={{
        selectedBox,
        selectedPolygon,
        setSelectedBox,
        setSelectedPolygon,
        tool,
        setTool,
        currentPolygon,
        setCurrentPolygon,
        addPointToCurrentPolygon,
        finalizeCurrentPolygon,
        onPolygonFinalized,
        setOnPolygonFinalized,
      }}
    >
      {children}
    </AnnotationStateContext.Provider>
  );
};

export const useAnnotationState = () => {
  const context = useContext(AnnotationStateContext);
  if (context === undefined) {
    throw new Error('useAnnotationState must be used within an AnnotationStateProvider');
  }
  return context;
};