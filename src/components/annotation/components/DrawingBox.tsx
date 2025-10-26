import React from 'react';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DrawingBoxProps {
  currentBox: Box | null;
}

const DrawingBox: React.FC<DrawingBoxProps> = ({ currentBox }) => {
  if (!currentBox) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${currentBox.width < 0 ? (currentBox.x + currentBox.width) *  100: currentBox.x * 100}%`,
        top: `${currentBox.height < 0 ? (currentBox.y + currentBox.height) *  100: currentBox.y * 100}%`,
        width: `${Math.abs(currentBox.width * 100)}%`,
        height: `${Math.abs(currentBox.height * 100)}%`,
        border: '2px dashed #3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointerEvents: 'none'
      }}
    />
  );
};

export default DrawingBox;