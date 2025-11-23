import React, { useState } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Search, Sparkles } from 'lucide-react';

interface TextPromptToolProps {
  isProcessing: boolean;
  onSegmentText: (text: string) => void;
}

export const TextPromptTool: React.FC<TextPromptToolProps> = ({
  isProcessing,
  onSegmentText,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSegmentText(text.trim());
    }
  };

  const examplePrompts = [
    'red pipes',
    'cracks in wall',
    'all windows',
    'defects',
  ];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          Text Prompt (SAM v3)
        </h4>
        <p className="text-xs text-muted-foreground">
          Describe objects you want to find. AI will detect all matching instances.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., 'metal pipes', 'cracks', 'defects'"
            className="pl-9 h-10"
            disabled={isProcessing}
          />
        </div>

        <Button
          type="submit"
          disabled={!text.trim() || isProcessing}
          className="w-full bg-gradient-to-r from-primary to-primary/80"
          size="sm"
        >
          <Sparkles className="h-3 w-3 mr-2" />
          {isProcessing ? 'Searching...' : 'Find All'}
        </Button>
      </form>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Example prompts:</p>
        <div className="flex flex-wrap gap-1.5">
          {examplePrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setText(prompt)}
              disabled={isProcessing}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
