import React from 'react';
import { screenPx } from '../canvasScale';

interface GuideLinesProps {
  mousePosition: { x: number; y: number };
  showGuideLines: boolean;
}

// Dashed crosshair drawn with gradients instead of borders so its thickness
// and dash length stay constant on screen at every zoom level (borders below
// 1px get snapped up by the browser; gradient-filled boxes do not).
const dash = (direction: 'to bottom' | 'to right') =>
  `repeating-linear-gradient(${direction}, rgba(255,255,255,0.95) 0 ${screenPx(6)}, transparent ${screenPx(6)} ${screenPx(12)})`;

const GuideLines: React.FC<GuideLinesProps> = ({ mousePosition, showGuideLines }) => {
  if (!showGuideLines) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: `${mousePosition.x * 100}%`,
          top: 0,
          width: screenPx(1),
          height: '100%',
          transform: 'translateX(-50%)',
          backgroundImage: dash('to bottom'),
          boxShadow: `0 0 0 ${screenPx(0.5)} rgba(0,0,0,0.25)`,
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: `${mousePosition.y * 100}%`,
          width: '100%',
          height: screenPx(1),
          transform: 'translateY(-50%)',
          backgroundImage: dash('to right'),
          boxShadow: `0 0 0 ${screenPx(0.5)} rgba(0,0,0,0.25)`,
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
    </>
  );
};

export default GuideLines;
