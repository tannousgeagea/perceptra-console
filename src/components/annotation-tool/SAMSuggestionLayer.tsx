import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SAMSuggestion, Point } from '@/types/sam';

interface SAMSuggestionLayerProps {
  suggestions: SAMSuggestion[];
  points: Point[];
  onSelect?: (suggestionId: string) => void;
  onAccept?: (suggestionId: string) => void;
  onReject?: (suggestionId: string) => void;
  selectedSuggestionId?: string;
  hoveredSuggestionId?: string | null;
  onHoverSuggestion?: (id: string | null) => void;
}

const SAMSuggestionLayer: React.FC<SAMSuggestionLayerProps> = ({ 
  suggestions,
  points,
  onSelect, 
  onAccept,
  onReject,
  selectedSuggestionId,
  hoveredSuggestionId,
  onHoverSuggestion,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {suggestions.map((suggestion) => {
        const { bbox } = suggestion;
        if (!bbox || suggestion.status !== 'pending') return null;

        const isSelected = selectedSuggestionId === suggestion.id;
        const isHovered = hoveredSuggestionId === suggestion.id;
        const isHighlighted = isSelected || isHovered;
        
        return (
          <div
            key={suggestion.id}
            onMouseEnter={() => onHoverSuggestion?.(suggestion.id)}
            onMouseLeave={() => onHoverSuggestion?.(null)}
            onClick={() => onSelect?.(suggestion.id)}
            style={{
              position: 'absolute',
              left: `${bbox.x * 100}%`,
              top: `${bbox.y * 100}%`,
              width: `${bbox.width * 100}%`,
              height: `${bbox.height * 100}%`,
              border: `${isHighlighted ? '3px' : '2px'} dashed hsl(var(--primary))`,
              backgroundColor: isHighlighted 
                ? 'hsla(var(--primary), 0.15)' 
                : 'hsla(var(--primary), 0.05)',
              cursor: 'pointer',
              pointerEvents: 'auto',
              opacity: isHighlighted ? 1 : 0.7,
              transition: 'all 0.2s ease',
              boxShadow: isHighlighted 
                ? '0 0 12px 2px hsl(var(--primary) / 0.3)' 
                : 'none',
            }}
            className="hover:opacity-100 group"
          >
            {/* Top bar with confidence + actions */}
            <div
              style={{
                position: 'absolute',
                top: '-28px',
                left: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              {/* Confidence badge */}
              {suggestion.confidence != null && (
                <div
                  style={{
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'white',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    letterSpacing: '0.3px',
                  }}
                >
                  {Math.round(suggestion.confidence * 100)}%
                  {suggestion.suggested_label && ` · ${suggestion.suggested_label}`}
                </div>
              )}

              {/* Accept / Reject buttons - visible on hover or highlight */}
              <div
                className={cn(
                  "flex gap-0.5 transition-opacity duration-150",
                  isHighlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onAccept?.(suggestion.id); }}
                  className="flex items-center justify-center w-5 h-5 rounded bg-green-600 hover:bg-green-500 text-white shadow-md transition-colors"
                  title="Accept"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReject?.(suggestion.id); }}
                  className="flex items-center justify-center w-5 h-5 rounded bg-red-600 hover:bg-red-500 text-white shadow-md transition-colors"
                  title="Reject"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'hsl(var(--primary))',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              />
            )}
          </div>
        );
      })}

      {points.map((point, index) => (
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
    </div>
  );
};

export default SAMSuggestionLayer;
