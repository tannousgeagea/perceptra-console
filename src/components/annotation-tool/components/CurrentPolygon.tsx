import React from 'react';

interface Point {
  x: number;
  y: number;
}

interface CurrentPolygonProps {
  currentPolygon: Point[] | null;
  mousePosition: { x: number; y: number };
}

const CurrentPolygon: React.FC<CurrentPolygonProps> = ({ currentPolygon, mousePosition }) => {
  if (!currentPolygon || currentPolygon.length === 0) return null;

  return (
    <svg 
    className="absolute top-0 left-0 w-full h-full pointer-events-none"
    viewBox='0 0 1 1'
    preserveAspectRatio='none'
    >
    {currentPolygon.length > 1 && (
      <polyline
        points={currentPolygon.map(p => `${p.x},${p.y}`).join(' ')}
        style={{
          fill: 'none',
          stroke: '#3B82F6',
          strokeWidth: 0.002,
          strokeDasharray: "0.005,0.005",
        }}
      />
    )}
    
    {currentPolygon.length > 0 && (
      <line
        x1={currentPolygon[currentPolygon.length - 1].x}
        y1={currentPolygon[currentPolygon.length - 1].y}
        x2={mousePosition.x}
        y2={mousePosition.y}
        style={{
          stroke: '#3B82F6',
          strokeWidth: 0.002,
          strokeDasharray: "0.005,0.005",
        }}
      />
    )}
    
    {currentPolygon.map((point, index) => (
      <circle
        key={index}
        cx={point.x}
        cy={point.y}
        r={0.005}
        style={{
          fill: '#3B82F6',
          stroke: 'white',
          strokeWidth: 0.001,
        }}
      />
    ))}
  </svg>
  );
};

export default CurrentPolygon;