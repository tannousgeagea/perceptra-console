import React, { useState } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/ui/alert';

interface PropagateToolProps {
  isProcessing: boolean;
  hasPreviousImage?: boolean;
  previousImageId?: string;
  onPropagate: (sourceImageId: string, annotationIds: string[]) => void;
}

export const PropagateTool: React.FC<PropagateToolProps> = ({
  isProcessing,
  hasPreviousImage,
  previousImageId,
  onPropagate,
}) => {
  const [selectedAll, setSelectedAll] = useState(true);

  const handlePropagate = () => {
    if (previousImageId) {
      // In real implementation, this would get actual annotation IDs
      onPropagate(previousImageId, []);
    }
  };

  if (!hasPreviousImage) {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Propagate from Previous
          </h4>
          <p className="text-xs text-muted-foreground">
            Copy annotations from the previous image to speed up sequential annotation.
          </p>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            No previous image available. This feature works when annotating image sequences.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-primary" />
          Propagate from Previous
        </h4>
        <p className="text-xs text-muted-foreground">
          Reuse annotations from the previous frame. Perfect for video sequences.
        </p>
      </div>

      <div className="p-3 rounded-lg border border-border bg-card space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Previous Image</span>
        </div>

        <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
          <Checkbox
            id="select-all"
            checked={selectedAll}
            onCheckedChange={(checked) => setSelectedAll(checked as boolean)}
          />
          <label htmlFor="select-all" className="text-xs cursor-pointer flex-1">
            Select all annotations
          </label>
        </div>

        <Alert className="border-primary/30 bg-primary/5">
          <AlertDescription className="text-xs">
            {selectedAll ? 'All annotations will be copied as suggestions' : 'Select annotations to copy'}
          </AlertDescription>
        </Alert>
      </div>

      <Button
        onClick={handlePropagate}
        disabled={isProcessing || !selectedAll}
        className="w-full bg-gradient-to-r from-primary to-primary/80"
        size="sm"
      >
        <ArrowRight className="h-3 w-3 mr-2" />
        {isProcessing ? 'Copying...' : 'Copy Selected'}
      </Button>

      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> Use this for video frames or similar consecutive images to annotate 3x faster.
        </p>
      </div>
    </div>
  );
};
