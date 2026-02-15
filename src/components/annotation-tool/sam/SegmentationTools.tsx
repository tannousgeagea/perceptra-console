import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import { MousePointer, Box, Search, Copy, ArrowRight } from 'lucide-react';
import { PointClickTool } from './tools/PointClickTool';
import { BoxRefinementTool } from './tools/BoxRefinementTool';
import { TextPromptTool } from './tools/TextPromptTool';
import { FindSimilarTool } from './tools/FindSimilarTool';
import { PropagateTool } from './tools/PropagateTool';
import type { Point, BBox } from '@/types/sam';

interface SegmentationToolsProps {
  sessionId: string | null;
  isProcessing: boolean;
  modelVersion: 'sam_v1' | 'sam_v2' | 'sam_v3';
  points: Point[];
  onAddPoint: (point: Point) => void;
  onClearPoints: () => void;
  onSegmentPoints: () => void;
  onSegmentBox: (box: BBox) => void;
  onSegmentText: (text: string) => void;
  onSegmentSimilar: (annotationId: string) => void;
  onPropagate: (sourceImageId: string, annotationIds: string[]) => void;
  selectedAnnotationId?: string;
  hasPreviousImage?: boolean;
  previousImageId?: string;
  onToolChange?: (tool: 'points' | 'box' | 'text' | 'similar' | 'propagate' | null) => void; // NEW
}

export const SegmentationTools: React.FC<SegmentationToolsProps> = ({
  sessionId,
  isProcessing,
  modelVersion,
  points,
  onAddPoint,
  onClearPoints,
  onSegmentPoints,
  onSegmentBox,
  onSegmentText,
  onSegmentSimilar,
  onPropagate,
  selectedAnnotationId,
  hasPreviousImage,
  previousImageId,
  onToolChange, // NEW
}) => {
  const [activeTab, setActiveTab] = useState('points');

  // Report active tool to parent
  useEffect(() => {
    if (sessionId && onToolChange) {
      onToolChange(activeTab as any);
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
      <TabsList className="grid w-full grid-cols-5 h-auto gap-1 bg-transparent p-2">
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
      </TabsList>

      <TabsContent value="points" className="mt-0 p-4 space-y-3">
        <PointClickTool
          points={points}
          isProcessing={isProcessing}
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
    </Tabs>
  );
};
