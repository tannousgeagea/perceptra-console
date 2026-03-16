import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/ui/dialog';
import { Input } from '@/components/ui/ui/input';
import { Textarea } from '@/components/ui/ui/textarea';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Sparkles } from 'lucide-react';
import { AnnotationClass } from '@/types/classes';
import { cn } from '@/lib/utils';

interface FindObjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: AnnotationClass[];
  onFindObjects?: (className: string, description: string) => void;
}

export const FindObjectsDialog: React.FC<FindObjectsDialogProps> = ({
  open,
  onOpenChange,
  classes,
  onFindObjects,
}) => {
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');

  const handleClassClick = (name: string) => {
    setClassName(name);
  };

  const handleSubmit = () => {
    if (!className.trim()) return;
    onFindObjects?.(className, description);
    onOpenChange(false);
    setClassName('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Find Objects with AI
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Use SAM3 to automatically find and label objects in your image.
        </p>

        <div className="space-y-4 mt-2">
          {/* Class Name */}
          <div>
            <label className="text-sm font-medium text-foreground">
              Class Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g., person, car, dog"
              className="mt-1.5 bg-background border-border"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              className="mt-1.5 bg-background border-border resize-none"
              rows={2}
            />
          </div>

          {/* Available Classes */}
          {classes.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground">Available Classes</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {classes.map((cls) => (
                  <Badge
                    key={cls.id}
                    variant={className === cls.name ? 'default' : 'outline'}
                    className={cn(
                      "cursor-pointer transition-colors text-xs",
                      className === cls.name
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent border-border text-foreground"
                    )}
                    onClick={() => handleClassClick(cls.name)}
                  >
                    {cls.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!className.trim()}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4" />
              Find Objects
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
