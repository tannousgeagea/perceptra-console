import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Copy, MousePointer } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/ui/alert';

interface FindSimilarToolProps {
  isProcessing: boolean;
  selectedAnnotationId?: string;
  onFindSimilar: (annotationId: string) => void;
}

export const FindSimilarTool: React.FC<FindSimilarToolProps> = ({
  isProcessing,
  selectedAnnotationId,
  onFindSimilar,
}) => {
  const handleFind = () => {
    if (selectedAnnotationId) {
      onFindSimilar(selectedAnnotationId);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Copy className="h-4 w-4 text-primary" />
          Find Similar Objects
        </h4>
        <p className="text-xs text-muted-foreground">
          Click an existing annotation, then AI will find all visually similar objects in the image.
        </p>
      </div>

      {!selectedAnnotationId ? (
        <div className="p-4 rounded-lg border-2 border-dashed border-muted bg-muted/20">
          <div className="text-center space-y-2">
            <MousePointer className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Select an annotation on the canvas
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Alert className="border-primary/30 bg-primary/5">
            <AlertDescription className="text-xs">
              Reference annotation selected. Click "Find Similar" to detect matching objects.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleFind}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
            size="sm"
          >
            <Copy className="h-3 w-3 mr-2" />
            {isProcessing ? 'Searching...' : 'Find Similar'}
          </Button>
        </div>
      )}

      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Use case:</span> Perfect for images with repeated objects like pipes, bottles, or components. Annotate one, find them all.
        </p>
      </div>
    </div>
  );
};
