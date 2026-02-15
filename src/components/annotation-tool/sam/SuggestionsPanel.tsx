import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { ScrollArea } from '@/components/ui/ui/scroll-area';
import { Check, X, CheckCheck, Trash2, Sparkles, MousePointer, Box, Search, Copy, ArrowRight, ChevronUp } from 'lucide-react';
import { Progress } from '@/components/ui/ui/progress';
import type { SAMSuggestion } from '@/types/sam';
import { cn } from '@/lib/utils';

interface SuggestionsPanelProps {
  suggestions: SAMSuggestion[];
  onAccept: (suggestionIds: string[]) => void;
  onReject: (suggestionIds: string[]) => void;
  onAcceptAll: () => void;
  onClearAll: () => void;
}

const typeConfig: Record<SAMSuggestion['type'], { label: string; icon: React.ReactNode; color: string }> = {
  point: { label: 'Point Click', icon: <MousePointer className="h-3 w-3" />, color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  box: { label: 'Box Refined', icon: <Box className="h-3 w-3" />, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  text: { label: 'Text Found', icon: <Search className="h-3 w-3" />, color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  similar: { label: 'Similar', icon: <Copy className="h-3 w-3" />, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  propagated: { label: 'Propagated', icon: <ArrowRight className="h-3 w-3" />, color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};


export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestions,
  onAccept,
  onReject,
  onAcceptAll,
  onClearAll,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const prevCountRef = useRef(0);

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  // Track newly added suggestions for animation
  useEffect(() => {
    if (pendingSuggestions.length > prevCountRef.current) {
      const existingIds = new Set(suggestions.slice(0, prevCountRef.current).map(s => s.id));
      const fresh = new Set(pendingSuggestions.filter(s => !existingIds.has(s.id)).map(s => s.id));
      setNewIds(fresh);
      const timer = setTimeout(() => setNewIds(new Set()), 1500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = pendingSuggestions.length;
  }, [pendingSuggestions.length]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === pendingSuggestions.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(pendingSuggestions.map(s => s.id)));
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.5) return 'text-amber-400';
    return 'text-red-400';
  };

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.5) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (pendingSuggestions.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 mb-2">
          <Sparkles className="h-5 w-5 text-muted-foreground/60" />
        </div>
        <p className="text-xs text-muted-foreground">No suggestions yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header with count + bulk actions */}
      <div className="px-3 py-2.5 border-b border-border bg-primary/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {pendingSuggestions.length}
              </span>
            </div>
            <span className="font-semibold text-sm">Suggestions</span>
          </div>
          <Checkbox
            checked={selectedIds.size === pendingSuggestions.length && pendingSuggestions.length > 0}
            onCheckedChange={toggleAll}
            className="h-4 w-4"
          />
        </div>

        <div className="flex gap-1.5">
          <Button
            onClick={selectedIds.size > 0 ? handleAcceptSelected : onAcceptAll}
            size="sm"
            className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-500 text-white"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            {selectedIds.size > 0 ? `Accept ${selectedIds.size}` : 'Accept All'}
          </Button>
          {selectedIds.size > 0 ? (
            <Button onClick={handleRejectSelected} size="sm" variant="outline" className="h-7 text-xs">
              <X className="h-3 w-3 mr-1" />
              Reject
            </Button>
          ) : (
            <Button onClick={onClearAll} size="sm" variant="outline" className="h-7 text-xs text-destructive hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestion cards */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {pendingSuggestions.map((suggestion) => {
            const config = typeConfig[suggestion.type];
            const isNew = newIds.has(suggestion.id);
            const isSelected = selectedIds.has(suggestion.id);

            return (
              <div
                key={suggestion.id}
                className={cn(
                  "relative border rounded-lg p-2.5 transition-all duration-300 cursor-pointer",
                  isSelected
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-card hover:bg-accent/30",
                  isNew && "animate-in slide-in-from-right-5 fade-in duration-500"
                )}
                onClick={() => toggleSelection(suggestion.id)}
              >
                {/* New indicator pulse */}
                {isNew && (
                  <div className="absolute -left-px top-2 bottom-2 w-0.5 rounded-full bg-primary animate-pulse" />
                )}

                <div className="flex items-start gap-2.5">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelection(suggestion.id)}
                    className="mt-0.5 h-3.5 w-3.5"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 gap-1 border", config.color)}>
                          {config.icon}
                          {config.label}
                        </Badge>
                        {suggestion.suggested_label && (
                          <span className="text-xs font-medium text-foreground truncate max-w-[80px]">
                            {suggestion.suggested_label}
                          </span>
                        )}
                      </div>
                      {suggestion.confidence != null && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="h-1 w-8 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", getConfidenceBarColor(suggestion.confidence))}
                              style={{ width: `${suggestion.confidence * 100}%` }}
                            />
                          </div>
                          <span className={cn("text-[10px] font-mono font-semibold", getConfidenceColor(suggestion.confidence))}>
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        onClick={(e) => { e.stopPropagation(); onAccept([suggestion.id]); }}
                        size="sm"
                        className="h-6 flex-1 text-[10px] bg-green-600 hover:bg-green-500"
                      >
                        <Check className="h-2.5 w-2.5 mr-0.5" />
                        Accept
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); onReject([suggestion.id]); }}
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] px-2"
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
