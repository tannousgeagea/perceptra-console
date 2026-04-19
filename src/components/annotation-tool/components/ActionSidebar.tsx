import React from "react";
import { useAnnotationState } from "@/contexts/AnnotationStateContext";
import ApproveButton from "./ButtonApprove";
import DeleteButton from "./ButtonDelete";
import MarkAsNullButton from "./ButtonMarkNull";
import { ProjectImageOut } from "@/types/image";
import { AIAssistPanel } from "../sam/AIAssistPanel";
import { SuggestionFloatingBar } from '../sam/SuggestionFloatingBar';
import { useSAMSession } from "@/hooks/useSAMSession";
import type { AnnotationClass } from "@/types/classes";

interface ActionSidebarProps {
  currentImage: ProjectImageOut;
  projectId: string;
  goToNextImage: () => void;
  samSession: ReturnType<typeof useSAMSession>;
  classes: AnnotationClass[];
  previousImageId?: string;
  hasPreviousImage?: boolean;
  hoveredSuggestionId?: string | null;
  onHoverSuggestion?: (id: string | null) => void;
  onSAMToolChange?: (tool: 'points' | 'box' | 'text' | 'similar' | 'propagate' | 'auto' | null) => void;
}

const ActionSidebar: React.FC<ActionSidebarProps> = ({
  currentImage,
  projectId,
  goToNextImage,
  samSession,
  classes,
  previousImageId,
  hasPreviousImage,
  hoveredSuggestionId,
  onHoverSuggestion,
  onSAMToolChange,
}) => {
  const { selectedBox } = useAnnotationState();

  const handleAcceptAll = (classId?: string, className?: string) => {
    const allIds = samSession.suggestions
      .filter(s => s.status === 'pending')
      .map(s => s.id);
    if (allIds.length > 0) {
      samSession.acceptSuggestions({ suggestionIds: allIds, classId, className });
    }
  };

  const handleAcceptSuggestions = (ids: string[], classId?: string, className?: string) => {
    samSession.acceptSuggestions({ suggestionIds: ids, classId, className });
  };

  return (
    <aside className="h-full flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-l border-slate-800 flex-shrink-0">
      <div className="py-4 border-b border-slate-800 flex justify-center">
        <div className="flex w-full items-center gap-6 justify-center">
          <ApproveButton
            currentImage={currentImage}
            projectId={projectId}
            goToNextImage={goToNextImage}
            className=""
          />
          <DeleteButton
            currentImage={currentImage}
            projectId={projectId}
            goToNextImage={goToNextImage}
            className=""
          />
          <MarkAsNullButton
            currentImage={currentImage}
            projectId={projectId}
            goToNextImage={goToNextImage}
            className="bg-red-500 hover:bg-red-600 text-white"
          />
        </div>
      </div>

      <SuggestionFloatingBar
        suggestions={samSession.suggestions}
        onAcceptAll={() => handleAcceptAll()}
        onClearAll={samSession.clearSuggestions}
      />

      <div className="w-80 border-l">
        <AIAssistPanel
          sessionId={samSession.sessionId}
          isSessionActive={samSession.isSessionActive}
          isSessionLoading={samSession.isSessionLoading}
          currentConfig={samSession.modelConfig}
          onStartSession={samSession.createSession}
          onSwitchModel={samSession.switchModel}
          onEndSession={samSession.endSession}

          isProcessing={samSession.isProcessing}
          points={samSession.points}
          pointMode={samSession.pointMode}
          setPointMode={samSession.setPointMode}
          onAddPoint={samSession.addPoint}
          onClearPoints={samSession.clearPoints}
          onSegmentPoints={() => samSession.segmentWithPoints(samSession.points)}
          onSegmentBox={samSession.segmentWithBox}
          onSegmentText={samSession.segmentWithText}
          onSegmentSimilar={samSession.segmentSimilar}
          onPropagate={samSession.propagateFromPrevious}
          onSegmentAuto={samSession.segmentAuto}

          suggestions={samSession.suggestions}
          classes={classes}
          onAcceptSuggestions={handleAcceptSuggestions}
          onRejectSuggestions={samSession.rejectSuggestions}
          onAcceptAll={handleAcceptAll}
          onClearAll={samSession.clearSuggestions}

          selectedAnnotationId={selectedBox!}
          hasPreviousImage={hasPreviousImage}
          previousImageId={previousImageId}
          hoveredSuggestionId={hoveredSuggestionId}
          onHoverSuggestion={onHoverSuggestion}
          onSAMToolChange={onSAMToolChange}
        />
      </div>

      <footer className="fixed w-80 bottom-0 bg-slate-900/90 backdrop-blur-md border-t border-indigo-500/50 shadow-[0_-1px_4px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="px-4 py-3 text-center backdrop-blur-md">
          <p className="text-[11px] text-slate-300 tracking-wide">
            © {new Date().getFullYear()}{" "}
            <span className="text-indigo-400 font-semibold">Perceptra Vision UI</span>
          </p>
        </div>
      </footer>
    </aside>
  );
};

export default ActionSidebar;
