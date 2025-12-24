import React, { useState, useEffect } from "react";

import { 
  CustomDialog, 
  CustomDialogContent, 
  CustomDialogHeader, 
  CustomDialogTitle, 
  CustomDialogDescription, 
  CustomDialogFooter 
} from "@/components/common/CustomDialog";

import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Copy, Loader2 } from "lucide-react";
import { ModelListItem } from "@/hooks/useModels";

interface DuplicateModelDialogProps {
  model: ModelListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (model: ModelListItem, newName: string) => void;
}

const DuplicateModelDialog: React.FC<DuplicateModelDialogProps> = ({
  model,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (model && open) {
      setNewName(`${model.name} (Copy)`);
    }
  }, [model, open]);

  const handleConfirm = async () => {
    if (!model || !newName.trim()) return;
    
    setIsLoading(true);
    // Simulate a brief delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    onConfirm(model, newName.trim());
    setIsLoading(false);
    onOpenChange(false);
  };

  if (!model) return null;

  return (
    <CustomDialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent>
        <CustomDialogHeader>
          <CustomDialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            Duplicate Model
          </CustomDialogTitle>
          <CustomDialogDescription>
            Create a copy of "{model.name}". The new model will have no training versions.
          </CustomDialogDescription>
        </CustomDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-name">New Model Name</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter a name for the duplicate"
            />
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium">What will be copied:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Model configuration and settings</li>
              <li>• Description and tags</li>
              <li>• Model type: {model.task}</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Training versions will not be copied.
            </p>
          </div>
        </div>

        <CustomDialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!newName.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Duplicating...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Model
              </>
            )}
          </Button>
        </CustomDialogFooter>
      </CustomDialogContent>
    </CustomDialog>
  );
};

export default DuplicateModelDialog;