import React, { useState } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Slider } from '@/components/ui/ui/slider';
import { Label } from '@/components/ui/ui/label';
import { Layers, Zap } from 'lucide-react';

interface AutoSegmentConfig {
  points_per_side?: number;
  pred_iou_thresh?: number;
  stability_score_thresh?: number;
  min_area?: number;
}

interface AutoSegmentToolProps {
  isProcessing: boolean;
  onSegmentAuto: (config: AutoSegmentConfig) => void;
}

export const AutoSegmentTool: React.FC<AutoSegmentToolProps> = ({
  isProcessing,
  onSegmentAuto,
}) => {
  const [pointsPerSide, setPointsPerSide] = useState(32);
  const [iouThresh, setIouThresh] = useState(0.88);
  const [stabilityThresh, setStabilityThresh] = useState(0.95);
  const [minArea, setMinArea] = useState(0.001);

  const handleRun = () => {
    onSegmentAuto({
      points_per_side: pointsPerSide,
      pred_iou_thresh: iouThresh,
      stability_score_thresh: stabilityThresh,
      min_area: minArea,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          Auto Segmentation
        </h4>
        <p className="text-xs text-muted-foreground">
          Automatically finds all objects in the image using a dense point grid.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Points per side</Label>
            <span className="text-xs font-mono text-muted-foreground">{pointsPerSide}</span>
          </div>
          <Slider
            min={8}
            max={64}
            step={4}
            value={[pointsPerSide]}
            onValueChange={([v]) => setPointsPerSide(v)}
            className="h-4"
          />
          <p className="text-[10px] text-muted-foreground">More points → denser coverage, slower inference</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">IoU threshold</Label>
            <span className="text-xs font-mono text-muted-foreground">{iouThresh.toFixed(2)}</span>
          </div>
          <Slider
            min={0.5}
            max={1.0}
            step={0.01}
            value={[iouThresh]}
            onValueChange={([v]) => setIouThresh(v)}
            className="h-4"
          />
          <p className="text-[10px] text-muted-foreground">Higher → fewer, more confident masks</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Stability threshold</Label>
            <span className="text-xs font-mono text-muted-foreground">{stabilityThresh.toFixed(2)}</span>
          </div>
          <Slider
            min={0.5}
            max={1.0}
            step={0.01}
            value={[stabilityThresh]}
            onValueChange={([v]) => setStabilityThresh(v)}
            className="h-4"
          />
          <p className="text-[10px] text-muted-foreground">Higher → more stable, less noisy masks</p>
        </div>
      </div>

      <Button
        onClick={handleRun}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white"
        size="sm"
      >
        <Zap className="h-3 w-3 mr-2" />
        {isProcessing ? 'Scanning…' : 'Run Auto-Segment'}
      </Button>

      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> Results may take 10–60 seconds depending on image size and model.
        </p>
      </div>
    </div>
  );
};
