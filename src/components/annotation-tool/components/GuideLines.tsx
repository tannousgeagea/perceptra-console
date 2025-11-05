import React from 'react';

interface GuideLinesProps {
  mousePosition: { x: number; y: number };
  showGuideLines: boolean;
}

const GuideLines: React.FC<GuideLinesProps> = ({ mousePosition, showGuideLines }) => {
  if (!showGuideLines) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: `${mousePosition.x * 100}%`,
          top: '0',
          width: '1px',
          height: '100%',
          borderLeft: '2px dashed rgb(255, 255, 255)',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '0',
          top: `${mousePosition.y * 100}%`,
          width: '100%',
          height: '1px',
          borderTop: '2px dashed rgb(255, 255, 255)',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
    </>
  );
};

export default GuideLines;