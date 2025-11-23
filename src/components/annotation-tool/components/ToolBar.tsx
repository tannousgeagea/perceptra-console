import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Move, Square, Hexagon } from 'lucide-react';
import { useAnnotation } from '@/contexts/AnnotationContext';
import KeyboardShortcuts from '../KeyboardShortcuts';
import { Separator } from '@/components/ui/ui/separator';

const ToolBar = () => {
  const { tool, setTool } = useAnnotation();

  return (
    <div className="p-4 border-b border-border bg-background">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Tools</h3>
        <KeyboardShortcuts />
      </div>
      <div className="flex flex-row gap-2">
        <Button
          variant={tool === 'draw' ? 'default' : 'outline'}
          onClick={() => setTool('draw')}
          className="flex-1"
        >
          <Square className="w-4 h-4" />
          {/* Box */}
        </Button>
        <Button
          variant={tool === 'polygon' ? 'default' : 'outline'}
          onClick={() => setTool('polygon')}
          className="flex-1"
        >
          <Hexagon className="w-4 h-4" />
          {/* Polygon */}
        </Button>
        <Button
          variant={tool === 'move' ? 'default' : 'outline'}
          onClick={() => setTool('move')}
          className="flex-1"
        >
          <Move className="w-4 h-4" />
          {/* Move */}
        </Button>
      </div>
      <Separator className="my-3" />
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• <kbd className="text-[10px] px-1 py-0.5 bg-muted rounded">Ctrl</kbd> + scroll to zoom</p>
        <p>• <kbd className="text-[10px] px-1 py-0.5 bg-muted rounded">Alt</kbd> + drag to pan</p>
        <p>• <kbd className="text-[10px] px-1 py-0.5 bg-muted rounded">Esc</kbd> to cancel</p>
      </div>
    </div>
  );
};

export default ToolBar;
