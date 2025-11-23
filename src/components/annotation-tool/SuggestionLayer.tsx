import React from 'react';
import type { AnnotationSuggestion, AnnotationData } from '@/types/suggestion';

interface SuggestionLayerProps {
  suggestions: AnnotationSuggestion[];
  onSelect?: (suggestionId: string) => void;
  selectedSuggestionId?: string;
}

const SuggestionLayer: React.FC<SuggestionLayerProps> = ({ 
  suggestions, 
  onSelect, 
  selectedSuggestionId 
}) => {
  const pendingSuggestions = suggestions.filter((s) => s.status === 'pending');

  const isBoxData = (data: any): data is AnnotationData => {
    return 'x' in data && 'y' in data && 'width' in data && 'height' in data;
  };

  const getSuggestionStyle = (type: AnnotationSuggestion['type'], isSelected: boolean) => {
    const baseStyles = {
      ai_generated: {
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsla(var(--primary), 0.1)',
      },
      similar_object: {
        borderColor: 'hsl(var(--chart-2))',
        backgroundColor: 'hsla(var(--chart-2), 0.1)',
      },
      label_suggestion: {
        borderColor: 'hsl(var(--chart-3))',
        backgroundColor: 'hsla(var(--chart-3), 0.1)',
      },
      propagated: {
        borderColor: 'hsl(var(--chart-4))',
        backgroundColor: 'hsla(var(--chart-4), 0.1)',
      },
    };

    const style = baseStyles[type] || baseStyles.ai_generated;
    
    return {
      ...style,
      borderWidth: isSelected ? '3px' : '2px',
      borderStyle: 'dashed',
      opacity: isSelected ? 1 : 0.8,
    };
  };

  return (
    <>
      {pendingSuggestions.map((suggestion) => {
        if (!isBoxData(suggestion.annotation_data)) return null;

        const { x, y, width, height } = suggestion.annotation_data;
        const isSelected = selectedSuggestionId === suggestion.id;
        const style = getSuggestionStyle(suggestion.type, isSelected);

        return (
          <div
            key={suggestion.id}
            onClick={() => onSelect?.(suggestion.id)}
            style={{
              position: 'absolute',
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              width: `${width * 100}%`,
              height: `${height * 100}%`,
              border: `${style.borderWidth} ${style.borderStyle} ${style.borderColor}`,
              backgroundColor: style.backgroundColor,
              cursor: 'pointer',
              pointerEvents: 'auto',
              opacity: style.opacity,
              transition: 'all 0.2s ease',
              boxShadow: isSelected ? `0 0 0 2px ${style.borderColor}40` : 'none',
            }}
            className="hover:opacity-100"
          >
            {/* Confidence badge */}
            {suggestion.confidence && (
              <div
                style={{
                  position: 'absolute',
                  top: '-24px',
                  left: '0',
                  backgroundColor: style.borderColor,
                  color: 'white',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '0.3px',
                }}
              >
                {Math.round(suggestion.confidence * 100)}%
                {suggestion.suggested_label && ` · ${suggestion.suggested_label}`}
              </div>
            )}

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
                  backgroundColor: style.borderColor,
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

export default SuggestionLayer;
