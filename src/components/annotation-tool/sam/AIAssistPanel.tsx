import React, { useEffect, useRef  } from 'react';
import { SessionControls } from './SessionControls';
import { SegmentationTools } from './SegmentationTools';
import { SuggestionsPanel } from './SuggestionsPanel';
import { Separator } from '@/components/ui/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/ui/collapsible';
import { ChevronDown, Settings2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/ui/badge';
import { cn } from '@/lib/utils';
import type { ModelConfig, Point, BBox, SAMSuggestion } from '@/types/sam';

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
  onAddPoint: (point: Point) => void;
  onClearPoints: () => void;
  onSegmentPoints: () => void;
  onSegmentBox: (box: BBox) => void;
  onSegmentText: (text: string) => void;
  onSegmentSimilar: (annotationId: string) => void;
  onPropagate: (sourceImageId: string, annotationIds: string[]) => void;

  // Suggestions
  suggestions: SAMSuggestion[];
  onAcceptSuggestions: (suggestionIds: string[]) => void;
  onRejectSuggestions: (suggestionIds: string[]) => void;
  onAcceptAll: () => void;
  onClearAll: () => void;

  // Context
  selectedAnnotationId?: string;
  hasPreviousImage?: boolean;
  previousImageId?: string;
  onSAMToolChange?: (tool: 'points' | 'box' | 'text' | 'similar' | 'propagate' | null) => void;
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
  onAddPoint,
  onClearPoints,
  onSegmentPoints,
  onSegmentBox,
  onSegmentText,
  onSegmentSimilar,
  onPropagate,
  suggestions,
  onAcceptSuggestions,
  onRejectSuggestions,
  onAcceptAll,
  onClearAll,
  selectedAnnotationId,
  hasPreviousImage,
  previousImageId,
  onSAMToolChange,
}) => {
  const pendingCount = suggestions.filter(s => s.status === 'pending').length;
  const hasSuggestions = pendingCount > 0;
  const [toolsOpen, setToolsOpen] = React.useState(true);
  // Auto-collapse tools when suggestions arrive to give them space
  useEffect(() => {
    if (hasSuggestions && pendingCount > 0) {
      setToolsOpen(false);
    }
  }, [hasSuggestions, pendingCount]);


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
            onAddPoint={onAddPoint}
            onClearPoints={onClearPoints}
            onSegmentPoints={onSegmentPoints}
            onSegmentBox={onSegmentBox}
            onSegmentText={onSegmentText}
            onSegmentSimilar={onSegmentSimilar}
            onPropagate={onPropagate}
            selectedAnnotationId={selectedAnnotationId}
            hasPreviousImage={hasPreviousImage}
            previousImageId={previousImageId}
            onToolChange={onSAMToolChange}
          />
        </CollapsibleContent>
      </Collapsible>

        <Separator />

      {/* Suggestions panel - takes remaining space, prominent when populated */}
      <div className={cn(
        "flex-1 min-h-0 flex flex-col transition-all duration-300",
        hasSuggestions && "ring-1 ring-inset ring-primary/20 bg-primary/[0.02]"
      )}>
        <SuggestionsPanel
          suggestions={suggestions}
          onAccept={onAcceptSuggestions}
          onReject={onRejectSuggestions}
          onAcceptAll={onAcceptAll}
          onClearAll={onClearAll}
        />
      </div>
    </div>
  );
};
