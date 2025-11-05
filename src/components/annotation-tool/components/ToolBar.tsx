import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Move, Square, Hexagon } from 'lucide-react';
import { useAnnotation } from '@/contexts/AnnotationContext';

const ToolBar = () => {
  const { tool, setTool } = useAnnotation();

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Button
          variant={tool === 'draw' ? 'default' : 'outline'}
          onClick={() => setTool('draw')}
          className="flex-1"
        >
          <Square className="w-4 h-4 mr-2" />
          Box
        </Button>
        <Button
          variant={tool === 'polygon' ? 'default' : 'outline'}
          onClick={() => setTool('polygon')}
          className="flex-1"
        >
          <Hexagon className="w-4 h-4 mr-2" />
          Polygon
        </Button>
        <Button
          variant={tool === 'move' ? 'default' : 'outline'}
          onClick={() => setTool('move')}
          className="flex-1"
        >
          <Move className="w-4 h-4 mr-2" />
          Move
        </Button>
      </div>
    </div>
  );
};

export default ToolBar;
