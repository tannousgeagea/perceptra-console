import React from 'react';
import { SessionControls } from './SessionControls';
import { SegmentationTools } from './SegmentationTools';
import { SuggestionsPanel } from './SuggestionsPanel';
import { Separator } from '@/components/ui/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/ui/collapsible';
import { ChevronDown, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelConfig, Point, BBox, SAMSuggestion } from '@/types/sam';
import type { AnnotationClass } from '@/types/classes';

interface AutoSegmentConfig {
  points_per_side?: number;
  pred_iou_thresh?: number;
  stability_score_thresh?: number;
  min_area?: number;
}

type ActiveTool = 'points' | 'box' | 'text' | 'similar' | 'propagate' | 'auto' | null;

interface AIAssistPanelProps {
  // Session
  sessionId: string | null;
  isSessionActive: boolean;
  isSessionLoading: boolean;
  currentConfig?: ModelConfig;
  onStartSession: (config: ModelConfig) => void;
  onSwitchModel: (config: ModelConfig) => void;
  onEndSession: () => void;

  // Tools
  isProcessing: boolean;
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

  // Suggestions
  suggestions: SAMSuggestion[];
  classes: AnnotationClass[];
  onAcceptSuggestions: (suggestionIds: string[], classId?: string, className?: string) => void;
  onRejectSuggestions: (suggestionIds: string[]) => void;
  onAcceptAll: (classId?: string, className?: string) => void;
  onClearAll: () => void;

  // Context
  selectedAnnotationId?: string;
  hasPreviousImage?: boolean;
  previousImageId?: string;
  hoveredSuggestionId?: string | null;
  onHoverSuggestion?: (id: string | null) => void;
  onSAMToolChange?: (tool: ActiveTool) => void;
}

export const AIAssistPanel: React.FC<AIAssistPanelProps> = ({
  sessionId,
  isSessionActive,
  isSessionLoading,
  currentConfig,
  onStartSession,
  onSwitchModel,
  onEndSession,
  isProcessing,
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
  suggestions,
  classes,
  onAcceptSuggestions,
  onRejectSuggestions,
  onAcceptAll,
  onClearAll,
  selectedAnnotationId,
  hasPreviousImage,
  previousImageId,
  hoveredSuggestionId,
  onHoverSuggestion,
  onSAMToolChange,
}) => {
  const pendingCount = suggestions.filter(s => s.status === 'pending').length;
  const hasSuggestions = pendingCount > 0;
  const [toolsOpen, setToolsOpen] = React.useState(true);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background/95 to-background">
      <SessionControls
        isActive={isSessionActive}
        isLoading={isSessionLoading}
        currentConfig={currentConfig}
        onStartSession={onStartSession}
        onSwitchModel={onSwitchModel}
        onEndSession={onEndSession}
      />

      <Separator />

      <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 hover:bg-accent/30 transition-colors">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            Tools
          </div>
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", toolsOpen && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SegmentationTools
            sessionId={sessionId}
            isProcessing={isProcessing}
            modelVersion={currentConfig?.model || 'sam_v2'}
            points={points}
            pointMode={pointMode}
            setPointMode={setPointMode}
            onAddPoint={onAddPoint}
            onClearPoints={onClearPoints}
            onSegmentPoints={onSegmentPoints}
            onSegmentBox={onSegmentBox}
            onSegmentText={onSegmentText}
            onSegmentSimilar={onSegmentSimilar}
            onPropagate={onPropagate}
            onSegmentAuto={onSegmentAuto}
            selectedAnnotationId={selectedAnnotationId}
            hasPreviousImage={hasPreviousImage}
            previousImageId={previousImageId}
            onToolChange={onSAMToolChange}
          />
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Suggestions panel — takes remaining space */}
      <div className={cn(
        "flex-1 min-h-0 flex flex-col transition-all duration-300",
        hasSuggestions && "ring-1 ring-inset ring-primary/20 bg-primary/[0.02]"
      )}>
        <SuggestionsPanel
          suggestions={suggestions}
          classes={classes}
          onAccept={onAcceptSuggestions}
          onReject={onRejectSuggestions}
          onAcceptAll={onAcceptAll}
          onClearAll={onClearAll}
          hoveredSuggestionId={hoveredSuggestionId}
          onHoverSuggestion={onHoverSuggestion}
        />
      </div>
    </div>
  );
};
