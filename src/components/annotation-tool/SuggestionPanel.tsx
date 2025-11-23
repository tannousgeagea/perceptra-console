import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Sparkles, Copy, Tag, ArrowRight, X, Check, Wand2, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/ui/separator';
import type { AnnotationSuggestion } from '@/types/suggestion';

interface SuggestionPanelProps {
  suggestions: AnnotationSuggestion[];
  onGenerateAI: () => void;
  onSuggestSimilar: (annotationId: string) => void;
  onPropagate: () => void;
  onAccept: (suggestionId: string) => void;
  onReject: (suggestionId: string) => void;
  onAcceptAll: () => void;
  onClear: () => void;
  isGenerating: boolean;
  selectedAnnotationId?: string;
  hasPreviousImage?: boolean;
}

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  suggestions,
  onGenerateAI,
  onSuggestSimilar,
  onPropagate,
  onAccept,
  onReject,
  onAcceptAll,
  onClear,
  isGenerating,
  selectedAnnotationId,
  hasPreviousImage = false,
}) => {
  const pendingSuggestions = suggestions.filter((s) => s.status === 'pending');

  const getSuggestionIcon = (type: AnnotationSuggestion['type']) => {
    switch (type) {
      case 'ai_generated':
        return <Sparkles className="h-3.5 w-3.5" />;
      case 'similar_object':
        return <Copy className="h-3.5 w-3.5" />;
      case 'label_suggestion':
        return <Tag className="h-3.5 w-3.5" />;
      case 'propagated':
        return <ArrowRight className="h-3.5 w-3.5" />;
    }
  };

  const getSuggestionLabel = (type: AnnotationSuggestion['type']) => {
    switch (type) {
      case 'ai_generated':
        return 'AI Detection';
      case 'similar_object':
        return 'Similar Object';
      case 'label_suggestion':
        return 'Label Suggestion';
      case 'propagated':
        return 'From Previous';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Assistance</h3>
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={onGenerateAI}
            disabled={isGenerating}
            size="sm"
            variant="outline"
            className="w-full justify-start h-9 text-sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Auto-Annotate Image
          </Button>

          <Button
            onClick={() => selectedAnnotationId && onSuggestSimilar(selectedAnnotationId)}
            disabled={!selectedAnnotationId || isGenerating}
            size="sm"
            variant="outline"
            className="w-full justify-start h-9 text-sm"
            title={!selectedAnnotationId ? "Select an annotation first" : "Find similar objects"}
          >
            <Copy className="h-4 w-4 mr-2" />
            Find Similar Objects
          </Button>

          <Button
            onClick={onPropagate}
            disabled={!hasPreviousImage || isGenerating}
            size="sm"
            variant="outline"
            className="w-full justify-start h-9 text-sm"
            title={!hasPreviousImage ? "No previous image available" : "Use annotations from previous image"}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Use Previous Annotations
          </Button>
        </div>
      </div>

      <Separator />

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">
              Suggestions
              {pendingSuggestions.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({pendingSuggestions.length})
                </span>
              )}
            </h4>
            {pendingSuggestions.length > 0 && (
              <div className="flex gap-1">
                <Button
                  onClick={onAcceptAll}
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-primary hover:text-primary"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept All
                </Button>
                <Button
                  onClick={onClear}
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>

          {isGenerating && (
            <div className="flex items-center gap-2 p-3 mb-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="animate-spin">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-foreground">Generating suggestions...</p>
            </div>
          )}

          {pendingSuggestions.length === 0 && !isGenerating ? (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">No suggestions yet</p>
              <p className="text-xs text-muted-foreground">
                Use the buttons above to get AI assistance
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="group relative border border-border rounded-lg p-3 bg-card hover:bg-accent/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10">
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-foreground block">
                          {getSuggestionLabel(suggestion.type)}
                        </span>
                        {suggestion.suggested_label && (
                          <span className="text-xs text-muted-foreground">
                            {suggestion.suggested_label}
                          </span>
                        )}
                      </div>
                    </div>
                    {suggestion.confidence && (
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${suggestion.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => onAccept(suggestion.id)}
                      size="sm"
                      className="flex-1 h-8"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => onReject(suggestion.id)}
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionPanel;
