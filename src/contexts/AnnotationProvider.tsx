import React from 'react';
import { AnnotationStateProvider } from './AnnotationStateContext';
import { AnnotationGeometryProvider } from './AnnotationGeometryContext';

/**
 * Combined provider that wraps both state and geometry contexts
 * This maintains the same API for existing code while enabling split context optimization
 */
export const AnnotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AnnotationStateProvider>
      <AnnotationGeometryProvider>
        {children}
      </AnnotationGeometryProvider>
    </AnnotationStateProvider>
  );
};

// Re-export hooks for convenience
export { useAnnotationState } from './AnnotationStateContext';
export { useAnnotationGeometry } from './AnnotationGeometryContext';
export type { Box, Polygon } from '@/types/annotation';