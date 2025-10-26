import React from 'react';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  id: string;
  points: Point[];
  label: string;
}

interface Props {
  polygon: Polygon;
  isSelected: boolean;
  tool: 'draw' | 'move' | 'polygon';
  onSelect: () => void;
}

const PolygonAnnotation: React.FC<Props> = ({ polygon, isSelected, tool, onSelect }) => {
  const pointsString = polygon.points.map(p => `${p.x},${p.y}`).join(' ');
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool !== 'move') return;
    e.stopPropagation();
    onSelect();
  };

  const classNames = [
    'fill-[rgba(59,_131,_246,_0.877)] stroke-[2]',
    isSelected ? 'fill-[rgba(59,246,190,0.377)]' : 'fill-[rgba(59,131,246,0.877)]',
    tool === 'draw' || tool === 'polygon' ? 'pointer-events-none' : "pointer-events-auto"
  ].filter(Boolean).join(' ');
  
  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none" 
      onClick={handleMouseDown}
      viewBox="0 0 1 1"
      preserveAspectRatio='none'
    >
      <polygon 
        points={pointsString} 
        className={classNames}
        style={{
          stroke: '#3B82F6',
          strokeWidth: 0.002,
        }}
      />
      {polygon.points.map((point, index) => (
        <circle 
          key={index}
          cx={point.x} 
          cy={point.y} 
          r={0.005} 
          className={`fill-[var(--primary)] stroke-white`}
          style={{
            fill: '#3B82F6',
            stroke: 'white',
            strokeWidth: 0.001,
          }}
        />
      ))}
      {isSelected && polygon.label && (
        <foreignObject 
          x={polygon.points[0].x} 
          y={polygon.points[0].y - 0.03} 
          width="0.2" 
          height="0.06"
        >
          <div className="bg-[rgba(128,0,255,0.822)] text-white px-1 py-[2px] rounded text-[10px]">{polygon.label}</div>
        </foreignObject>
      )}
    </svg>
  );
};

export default PolygonAnnotation;