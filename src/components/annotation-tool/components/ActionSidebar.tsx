import React, { useState } from "react";
import { useAnnotationState } from "@/contexts/AnnotationStateContext";
import ApproveButton from "./ButtonApprove";
import DeleteButton from "./ButtonDelete";
import MarkAsNullButton from "./ButtonMarkNull";
import { ProjectImageOut } from "@/types/image";
import { AIAssistPanel } from "../sam/AIAssistPanel";
import { SuggestionFloatingBar } from '../sam/SuggestionFloatingBar';
import { useSAMSession } from "@/hooks/useSAMSession";


interface ActionSidebarProps {
  currentImage: ProjectImageOut;
  projectId: string;
  goToNextImage: () => void;
  samSession: ReturnType<typeof useSAMSession>; // ADD THIS
  // suggestions: AnnotationSuggestion[];
  // generateAI: () => void;
  // suggestSimilar: (annotationId: string) => void;
  // propagate: (sourceImageId: string) => void;
  // acceptSuggestion: (suggestionId: string) => void;
  // rejectSuggestion: (suggestionId: string) => void;
  // handleAcceptAll: () => void;
  // clearSuggestions: () => void;
  // isGenerating: boolean;
  previousImageId?: string;
  hasPreviousImage?: boolean;
  hoveredSuggestionId?: string | null;
  onHoverSuggestion?: (id: string | null) => void;
  onSAMToolChange?: (tool: 'points' | 'box' | 'text' | 'similar' | 'propagate' | null) => void;
}

const ActionSidebar: React.FC<ActionSidebarProps> = ({
  currentImage,
  projectId,
  goToNextImage,
  samSession,
  // suggestions,
  // generateAI,
  // suggestSimilar,
  // propagate,
  // acceptSuggestion,
  // rejectSuggestion,
  // handleAcceptAll,
  // clearSuggestions,
  // isGenerating,
  previousImageId,
  hasPreviousImage,
  hoveredSuggestionId,
  onHoverSuggestion,
  onSAMToolChange,
}) => {

  const { selectedBox } = useAnnotationState();
  // const samSession = useSAMSession(projectId!, currentImage?.id || "");

  const handleAcceptAll = () => {
    const allSuggestionIds = samSession.suggestions
      .filter(s => s.status === 'pending')
      .map(s => s.id);
    
    if (allSuggestionIds.length > 0) {
      samSession.acceptSuggestions({ suggestionIds: allSuggestionIds });
    }
  };

  const handleClearAll = () => {
    samSession.clearSuggestions();
  };
  
  return (
    <aside className="h-full flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-l border-slate-800 flex-shrink-0">
      <div className="py-4 border-b border-slate-800 flex justify-center">
        {/* <h2 className="text-lg font-bold text-center mb-4 tracking-wide bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text">
          <Settings className="w-4 h-4" /> Image Actions
        </h2> */}

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
        onAcceptAll={handleAcceptAll}
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
          onAddPoint={samSession.addPoint}
          onClearPoints={samSession.clearPoints}
          onSegmentPoints={() => samSession.segmentWithPoints(samSession.points)}
          onSegmentBox={samSession.segmentWithBox}
          onSegmentText={samSession.segmentWithText}
          onSegmentSimilar={samSession.segmentSimilar}
          onPropagate={samSession.propagateFromPrevious}
          
          suggestions={samSession.suggestions}
          onAcceptSuggestions={(ids) => samSession.acceptSuggestions({ suggestionIds: ids })}
          onRejectSuggestions={samSession.rejectSuggestions}
          onAcceptAll={handleAcceptAll}
          onClearAll={handleClearAll}
          
          selectedAnnotationId={selectedBox!}
          hasPreviousImage={hasPreviousImage}
          previousImageId={previousImageId}
          hoveredSuggestionId={hoveredSuggestionId}
          onHoverSuggestion={onHoverSuggestion}
          onSAMToolChange={onSAMToolChange}
        />
      </div>

      {/* Footer */}
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
