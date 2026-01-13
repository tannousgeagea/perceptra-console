import React, { createContext, useContext, useCallback } from 'react';
import { useImmer } from 'use-immer';
import { Polygon, Box } from '@/types/annotation';

interface AnnotationGeometryContextType {
  // Geometry data (hot - changes frequently)
  boxes: Map<string, Box>;
  polygons: Map<string, Polygon>;
  
  // Efficient update methods
  addBox: (box: Box) => void;
  updateBox: (id: string, updates: Partial<Box>) => void;
  deleteBox: (id: string) => void;
  setAllBoxes: (boxes: Box[]) => void;
  
  addPolygon: (polygon: Polygon) => void;
  updatePolygon: (id: string, updates: Partial<Polygon>) => void;
  deletePolygon: (id: string) => void;
  setAllPolygons: (polygons: Polygon[]) => void;
  
  // Helper to get arrays (for rendering)
  getBoxesArray: () => Box[];
  getPolygonsArray: () => Polygon[];
}

const AnnotationGeometryContext = createContext<AnnotationGeometryContextType | undefined>(undefined);

export const AnnotationGeometryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use immer for immutable Map updates
  const [boxes, updateBoxes] = useImmer<Map<string, Box>>(new Map());
  const [polygons, updatePolygons] = useImmer<Map<string, Polygon>>(new Map());

  // Box operations
  const addBox = useCallback((box: Box) => {
    updateBoxes(draft => {
      draft.set(box.id, box);
    });
  }, [updateBoxes]);

  const updateBox = useCallback((id: string, updates: Partial<Box>) => {
    updateBoxes(draft => {
      const box = draft.get(id);
      if (box) {
        Object.assign(box, updates);
      }
    });
  }, [updateBoxes]);

  const deleteBox = useCallback((id: string) => {
    updateBoxes(draft => {
      draft.delete(id);
    });
  }, [updateBoxes]);

  const setAllBoxes = useCallback((newBoxes: Box[]) => {
    updateBoxes(draft => {
      draft.clear();
      newBoxes.forEach(box => draft.set(box.id, box));
    });
  }, [updateBoxes]);

  // Polygon operations
  const addPolygon = useCallback((polygon: Polygon) => {
    updatePolygons(draft => {
      draft.set(polygon.id, polygon);
    });
  }, [updatePolygons]);

  const updatePolygon = useCallback((id: string, updates: Partial<Polygon>) => {
    updatePolygons(draft => {
      const polygon = draft.get(id);
      if (polygon) {
        Object.assign(polygon, updates);
      }
    });
  }, [updatePolygons]);

  const deletePolygon = useCallback((id: string) => {
    updatePolygons(draft => {
      draft.delete(id);
    });
  }, [updatePolygons]);

  const setAllPolygons = useCallback((newPolygons: Polygon[]) => {
    updatePolygons(draft => {
      draft.clear();
      newPolygons.forEach(polygon => draft.set(polygon.id, polygon));
    });
  }, [updatePolygons]);

  // Helper functions
  const getBoxesArray = useCallback(() => Array.from(boxes.values()), [boxes]);
  const getPolygonsArray = useCallback(() => Array.from(polygons.values()), [polygons]);

  return (
    <AnnotationGeometryContext.Provider
      value={{
        boxes,
        polygons,
        addBox,
        updateBox,
        deleteBox,
        setAllBoxes,
        addPolygon,
        updatePolygon,
        deletePolygon,
        setAllPolygons,
        getBoxesArray,
        getPolygonsArray,
      }}
    >
      {children}
    </AnnotationGeometryContext.Provider>
  );
};

export const useAnnotationGeometry = () => {
  const context = useContext(AnnotationGeometryContext);
  if (context === undefined) {
    throw new Error('useAnnotationGeometry must be used within an AnnotationGeometryProvider');
  }
  return context;
};