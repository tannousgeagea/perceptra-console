import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import { MousePointer, Box, Search, Copy, ArrowRight, Layers } from 'lucide-react';
import { PointClickTool } from './tools/PointClickTool';
import { BoxRefinementTool } from './tools/BoxRefinementTool';
import { TextPromptTool } from './tools/TextPromptTool';
import { FindSimilarTool } from './tools/FindSimilarTool';
import { PropagateTool } from './tools/PropagateTool';
import { AutoSegmentTool } from './tools/AutoSegmentTool';
import type { Point, BBox } from '@/types/sam';

interface AutoSegmentConfig {
  points_per_side?: number;
  pred_iou_thresh?: number;
  stability_score_thresh?: number;
  min_area?: number;
}

type ActiveTool = 'points' | 'box' | 'text' | 'similar' | 'propagate' | 'auto' | null;

interface SegmentationToolsProps {
  sessionId: string | null;
  isProcessing: boolean;
  modelVersion: 'sam_v1' | 'sam_v2' | 'sam_v3';
  points: Point[];
  pointMode: 1 | 0;
  setPointMode: (mode: 1 | 0) => void;
  onAddPoint: (point: Point) => void;
  onClearPoints: () => void;
  onSegmentPoints: () => void;
  onSegmentBox: (box: BBox) => void;
  onSegmentText: (text: string) => void;
  onSegmentSimilar: (annotationId: string) => void;
  onPropagate: (sourceImageId: string, annotationIds: string[]) => void;
  onSegmentAuto: (config: AutoSegmentConfig) => void;
  selectedAnnotationId?: string;
  hasPreviousImage?: boolean;
  previousImageId?: string;
  onToolChange?: (tool: ActiveTool) => void;
}

export const SegmentationTools: React.FC<SegmentationToolsProps> = ({
  sessionId,
  isProcessing,
  modelVersion,
  points,
  pointMode,
  setPointMode,
  onAddPoint,
  onClearPoints,
  onSegmentPoints,
  onSegmentBox,
  onSegmentText,
  onSegmentSimilar,
  onPropagate,
  onSegmentAuto,
  selectedAnnotationId,
  hasPreviousImage,
  previousImageId,
  onToolChange,
}) => {
  const [activeTab, setActiveTab] = useState('points');

  useEffect(() => {
    if (sessionId && onToolChange) {
      onToolChange(activeTab as ActiveTool);
    } else if (onToolChange) {
      onToolChange(null);
    }
  }, [activeTab, sessionId, onToolChange]);

  if (!sessionId) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <MousePointer className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Start an AI session to use segmentation tools
        </p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
      <TabsList className="grid w-full grid-cols-6 h-auto gap-0.5 bg-transparent p-2">
        <TabsTrigger value="points" className="flex-col h-auto py-2 px-1 data-[state=active]:bg-primary/10">
          <MousePointer className="h-4 w-4 mb-1" />
          <span className="text-[10px]">Click</span>
        </TabsTrigger>
        <TabsTrigger value="box" className="flex-col h-auto py-2 px-1 data-[state=active]:bg-primary/10">
          <Box className="h-4 w-4 mb-1" />
          <span className="text-[10px]">Box</span>
        </TabsTrigger>
        <TabsTrigger
          value="text"
          className="flex-col h-auto py-2 px-1 data-[state=active]:bg-primary/10"
          disabled={modelVersion !== 'sam_v3'}
        >
          <Search className="h-4 w-4 mb-1" />
          <span className="text-[10px]">Text</span>
        </TabsTrigger>
        <TabsTrigger value="similar" className="flex-col h-auto py-2 px-1 data-[state=active]:bg-primary/10">
          <Copy className="h-4 w-4 mb-1" />
          <span className="text-[10px]">Similar</span>
        </TabsTrigger>
        <TabsTrigger value="propagate" className="flex-col h-auto py-2 px-1 data-[state=active]:bg-primary/10">
          <ArrowRight className="h-4 w-4 mb-1" />
          <span className="text-[10px]">Prev</span>
        </TabsTrigger>
        <TabsTrigger value="auto" className="flex-col h-auto py-2 px-1 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
          <Layers className="h-4 w-4 mb-1" />
          <span className="text-[10px]">Auto</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="points" className="mt-0 p-4 space-y-3">
        <PointClickTool
          points={points}
          isProcessing={isProcessing}
          pointMode={pointMode}
          setPointMode={setPointMode}
          onAddPoint={onAddPoint}
          onClearPoints={onClearPoints}
          onSegment={onSegmentPoints}
        />
      </TabsContent>

      <TabsContent value="box" className="mt-0 p-4 space-y-3">
        <BoxRefinementTool
          isProcessing={isProcessing}
          onSegmentBox={onSegmentBox}
        />
      </TabsContent>

      <TabsContent value="text" className="mt-0 p-4 space-y-3">
        <TextPromptTool
          isProcessing={isProcessing}
          onSegmentText={onSegmentText}
        />
      </TabsContent>

      <TabsContent value="similar" className="mt-0 p-4 space-y-3">
        <FindSimilarTool
          isProcessing={isProcessing}
          selectedAnnotationId={selectedAnnotationId}
          onFindSimilar={onSegmentSimilar}
        />
      </TabsContent>

      <TabsContent value="propagate" className="mt-0 p-4 space-y-3">
        <PropagateTool
          isProcessing={isProcessing}
          hasPreviousImage={hasPreviousImage}
          previousImageId={previousImageId}
          onPropagate={onPropagate}
        />
      </TabsContent>

      <TabsContent value="auto" className="mt-0 p-4 space-y-3">
        <AutoSegmentTool
          isProcessing={isProcessing}
          onSegmentAuto={onSegmentAuto}
        />
      </TabsContent>
    </Tabs>
  );
};
