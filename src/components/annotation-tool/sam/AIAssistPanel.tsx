import React from 'react';
import { SessionControls } from './SessionControls';
import { SegmentationTools } from './SegmentationTools';
import { SuggestionsPanel } from './SuggestionsPanel';
import { Separator } from '@/components/ui/ui/separator';
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
}) => {
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

      <div className="flex-1 overflow-hidden flex flex-col">
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
        />

        <Separator />

        <div className="flex-1 min-h-0">
          <SuggestionsPanel
            suggestions={suggestions}
            onAccept={onAcceptSuggestions}
            onReject={onRejectSuggestions}
            onAcceptAll={onAcceptAll}
            onClearAll={onClearAll}
          />
        </div>
      </div>
    </div>
  );
};
