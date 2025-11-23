import React, { useState } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { ScrollArea } from '@/components/ui/ui/scroll-area';
import { Check, X, CheckCheck, Trash2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/ui/progress';
import type { SAMSuggestion } from '@/types/sam';

interface SuggestionsPanelProps {
  suggestions: SAMSuggestion[];
  onAccept: (suggestionIds: string[]) => void;
  onReject: (suggestionIds: string[]) => void;
  onAcceptAll: () => void;
  onClearAll: () => void;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestions,
  onAccept,
  onReject,
  onAcceptAll,
  onClearAll,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === pendingSuggestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingSuggestions.map(s => s.id)));
    }
  };

  const handleAcceptSelected = () => {
    if (selectedIds.size > 0) {
      onAccept(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleRejectSelected = () => {
    if (selectedIds.size > 0) {
      onReject(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const getSuggestionTypeLabel = (type: SAMSuggestion['type']) => {
    const labels = {
      point: 'Point Click',
      box: 'Box Refined',
      text: 'Text Found',
      similar: 'Similar Object',
      propagated: 'Propagated',
    };
    return labels[type];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">AI Suggestions</h3>
            {pendingSuggestions.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {pendingSuggestions.length}
              </Badge>
            )}
          </div>
          {pendingSuggestions.length > 0 && (
            <Checkbox
              checked={selectedIds.size === pendingSuggestions.length}
              onCheckedChange={toggleAll}
              className="h-4 w-4"
            />
          )}
        </div>

        {pendingSuggestions.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={selectedIds.size > 0 ? handleAcceptSelected : onAcceptAll}
              size="sm"
              className="flex-1 h-8 bg-gradient-to-r from-green-600 to-green-500"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              {selectedIds.size > 0 ? `Accept (${selectedIds.size})` : 'Accept All'}
            </Button>
            {selectedIds.size > 0 ? (
              <Button
                onClick={handleRejectSelected}
                size="sm"
                variant="outline"
                className="h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Reject
              </Button>
            ) : (
              <Button
                onClick={onClearAll}
                size="sm"
                variant="outline"
                className="h-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        {pendingSuggestions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No suggestions yet</p>
            <p className="text-xs text-muted-foreground">
              Use the AI tools above to generate suggestions
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {pendingSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="group relative border border-border rounded-lg p-3 bg-card hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedIds.has(suggestion.id)}
                    onCheckedChange={() => toggleSelection(suggestion.id)}
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="text-xs mb-1">
                          {getSuggestionTypeLabel(suggestion.type)}
                        </Badge>
                        {suggestion.suggested_label && (
                          <p className="text-sm font-medium">{suggestion.suggested_label}</p>
                        )}
                      </div>
                      {suggestion.confidence && (
                        <div className="text-right">
                          <div className="text-xs font-mono text-muted-foreground mb-1">
                            {Math.round(suggestion.confidence * 100)}%
                          </div>
                          <Progress
                            value={suggestion.confidence * 100}
                            className="h-1 w-12"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <Button
                        onClick={() => onAccept([suggestion.id])}
                        size="sm"
                        className="h-7 flex-1 bg-green-600 hover:bg-green-500"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => onReject([suggestion.id])}
                        size="sm"
                        variant="outline"
                        className="h-7"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
