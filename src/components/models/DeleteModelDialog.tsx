import React, { useState } from "react";
import { ModelListItem } from "@/types/models";
import { DeleteConfirmDialog } from "../common/DeleteConfirmDialog";

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
    if (!model) return;

    console.log("Deleting ...")
    setIsDeleting(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onConfirm(model.id);
    setIsDeleting(false);
    setConfirmText("");
    onOpenChange(false);
  };

  return (
    <>
      <DeleteConfirmDialog
        title="Delete Model"
        description={
          <>
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-6">
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
          </>
        }
        confirmText={model?.name || ''}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        open={open}
        onOpenChange={onOpenChange}
      />
    </>
  );
};

export default DeleteModelDialog;