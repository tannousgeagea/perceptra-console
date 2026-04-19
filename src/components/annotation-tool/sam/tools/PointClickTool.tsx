import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { MousePointer, Eraser, Zap, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Point } from '@/types/sam';

interface PointClickToolProps {
  points: Point[];
  isProcessing: boolean;
  pointMode: 1 | 0;
  setPointMode: (mode: 1 | 0) => void;
  onAddPoint: (point: Point) => void;
  onClearPoints: () => void;
  onSegment: () => void;
}

export const PointClickTool: React.FC<PointClickToolProps> = ({
  points,
  isProcessing,
  pointMode,
  setPointMode,
  onClearPoints,
  onSegment,
}) => {
  const positivePoints = points.filter(p => p.label === 1).length;
  const negativePoints = points.filter(p => p.label === 0).length;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
          <MousePointer className="h-4 w-4 text-primary" />
          Point & Click Segmentation
        </h4>
        <p className="text-xs text-muted-foreground">
          Click on the canvas to place points. Switch mode below to include or exclude regions.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1.5 p-1 rounded-lg bg-muted/50 border border-border">
        <button
          onClick={() => setPointMode(1)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
            pointMode === 1
              ? "bg-green-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <Plus className="h-3 w-3" />
          Positive
        </button>
        <button
          onClick={() => setPointMode(0)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
            pointMode === 0
              ? "bg-red-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <Minus className="h-3 w-3" />
          Negative
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 p-3 rounded-lg border border-border bg-card/50">
          <div className="text-xs text-muted-foreground mb-1">Positive</div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <Badge variant="secondary" className="text-xs">{positivePoints}</Badge>
          </div>
        </div>
        <div className="flex-1 p-3 rounded-lg border border-border bg-card/50">
          <div className="text-xs text-muted-foreground mb-1">Negative</div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <Badge variant="secondary" className="text-xs">{negativePoints}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={onSegment}
          disabled={points.length === 0 || isProcessing}
          className="bg-gradient-to-r from-primary to-primary/80"
          size="sm"
        >
          <Zap className="h-3 w-3 mr-2" />
          Segment
        </Button>
        <Button
          onClick={onClearPoints}
          disabled={points.length === 0}
          variant="outline"
          size="sm"
        >
          <Eraser className="h-3 w-3 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
};
