import React from 'react';
import type { SAMSuggestion, Point } from '@/types/sam';

interface SAMOverlayProps {
  suggestions: SAMSuggestion[];
  points: Point[];
  isSessionActive: boolean;
  onAcceptSuggestion: (suggestionId: string) => void;
}

// CRITICAL: Memoized to prevent rerenders when boxes change
const SAMOverlay: React.FC<SAMOverlayProps> = ({
  suggestions,
  points,
  isSessionActive,
  onAcceptSuggestion,
}) => {
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <>
      {/* SAM Suggestions */}
      {pendingSuggestions.map(suggestion => (
        <div
          key={suggestion.id}
          className="absolute border-2 border-blue-400 bg-blue-500/20 cursor-pointer hover:bg-blue-500/30 transition-colors"
          style={{
            left: `${suggestion.bbox.x * 100}%`,
            top: `${suggestion.bbox.y * 100}%`,
            width: `${suggestion.bbox.width * 100}%`,
            height: `${suggestion.bbox.height * 100}%`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onAcceptSuggestion(suggestion.id);
          }}
        >
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {suggestion.suggested_label || 'AI'} ({Math.round(suggestion.confidence * 100)}%)
          </div>
        </div>
      ))}

      {/* SAM Points */}
      {isSessionActive && points.map((point, index) => (
        <div
          key={index}
          className="absolute w-3 h-3 rounded-full border-2 border-white pointer-events-none"
          style={{
            left: `${point.x * 100}%`,
            top: `${point.y * 100}%`,
            backgroundColor: point.label === 1 ? '#22c55e' : '#ef4444',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </>
  );
};

// CRITICAL: Only rerender when SAM data changes, not when boxes change
export default React.memo(SAMOverlay, (prev, next) => {
  return (
    prev.suggestions.length === next.suggestions.length &&
    prev.points.length === next.points.length &&
    prev.isSessionActive === next.isSessionActive &&
    prev.suggestions.every((s, i) => s.id === next.suggestions[i]?.id)
  );
});