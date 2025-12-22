import React, { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/ui/alert-dialog";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { ModelListItem } from "@/hooks/useModels";

interface DeleteModelDialogProps {
  model: ModelListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (modelId: string) => void;
}

const DeleteModelDialog: React.FC<DeleteModelDialogProps> = ({
  model,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!model || confirmText !== model.name) return;

    setIsDeleting(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onConfirm(model.id);
    setIsDeleting(false);
    setConfirmText("");
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText("");
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-[450px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl">Delete Model</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
            <p className="text-sm text-foreground">
              You are about to delete <span className="font-semibold">{model?.name}</span> and all of its{" "}
              <span className="font-semibold">{model?.version_count} version(s)</span>. This will permanently remove:
            </p>
            <ul className="mt-3 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>All trained model weights and artifacts</li>
              <li>Training logs and metrics history</li>
              <li>Deployment configurations</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Type <span className="font-mono text-destructive">{model?.name}</span> to confirm:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Enter model name to confirm"
              className="h-10"
              autoComplete="off"
            />
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== model?.name || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Model
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteModelDialog;