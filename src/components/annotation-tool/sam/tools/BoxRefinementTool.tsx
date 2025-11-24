import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Box, Info } from 'lucide-react';
import type { BBox } from '@/types/sam';

interface BoxRefinementToolProps {
  isProcessing: boolean;
  onSegmentBox: (box: BBox) => void;
}

export const BoxRefinementTool: React.FC<BoxRefinementToolProps> = ({
  isProcessing,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Box className="h-4 w-4 text-primary" />
          Box Refinement
        </h4>
        <p className="text-xs text-muted-foreground">
          Draw a rough bounding box around an object. AI will automatically refine it to create a precise mask.
        </p>
      </div>

      <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
        <div className="text-center space-y-2">
          <Box className="h-8 w-8 mx-auto text-primary/50" />
          <p className="text-xs text-muted-foreground">
            Switch to box tool and draw on canvas
          </p>
          {isProcessing && (
            <p className="text-xs text-primary animate-pulse">
              Refining box with AI...
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">How it works:</span> The AI uses your box as a hint to find the exact object boundaries, creating a pixel-perfect mask automatically.
        </div>
      </div>
    </div>
  );
};
