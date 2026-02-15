import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Sparkles, CheckCheck, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SAMSuggestion } from '@/types/sam';
interface SuggestionFloatingBarProps {
  suggestions: SAMSuggestion[];
  onAcceptAll: () => void;
  onClearAll: () => void;
}
export const SuggestionFloatingBar: React.FC<SuggestionFloatingBarProps> = ({
  suggestions,
  onAcceptAll,
  onClearAll,
}) => {
  const pending = suggestions.filter(s => s.status === 'pending');
  if (pending.length === 0) return null;
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-card/95 backdrop-blur-xl border border-primary/30 shadow-lg shadow-primary/10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {pending.length} suggestion{pending.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-1.5">
          <Button
            onClick={onAcceptAll}
            size="sm"
            className="h-7 text-xs rounded-full bg-green-600 hover:bg-green-500 text-white px-3"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Accept All
          </Button>
          <Button
            onClick={onClearAll}
            size="sm"
            variant="ghost"
            className="h-7 text-xs rounded-full text-destructive hover:text-destructive px-2"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground animate-pulse" />
      </div>
    </div>
  );
};
