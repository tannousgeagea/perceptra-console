import React from 'react';
import { Annotation } from '@/types/image';

interface BoundingBoxProps {
  annotation: Annotation;
  highlightColor?: string;
}

const BoundingBox: React.FC<BoundingBoxProps> = ({ 
  annotation,
  highlightColor = 'rgba(255, 255, 0, 0.9)'
}) => {
  const [xMin, yMin, xMax, yMax] = annotation.xyxyn;
  
  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: `${xMin * 100}%`,
        top: `${yMin * 100}%`,
        width: `${(xMax - xMin) * 100}%`,
        height: `${(yMax - yMin) * 100}%`,
        border: `1.5px solid ${highlightColor}`,
      }}
    >
      {/* Highlight area inside bounding box */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          filter: 'brightness(150%)',
        }}
      />
      
      {/* Optional label */}
      {annotation.label && (
        <div 
          className="absolute -top-5 left-0 text-xs px-1 py-0.5 rounded"
          style={{ 
            backgroundColor: highlightColor,
            color: '#000',
            maxWidth: '100%',
          }}
        >
          {annotation.label}
          {annotation.confidence !== undefined && (
            <span className="ml-1 opacity-75">
              {Math.round(annotation.confidence * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BoundingBox;