
import { DeleteConfirmDialog } from "../common/DeleteConfirmDialog";
import type { Project } from "@/types/project";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onConfirm: (id: string) => void;
  isDeleting?: boolean;
}

export const DeleteProjectDialog = ({
  open,
  onOpenChange,
  project,
  onConfirm,
  isDeleting,
}: DeleteProjectDialogProps) => {
  if (!project) return null;

  return (
    <>
      <DeleteConfirmDialog
        title="Delete Version"
        description={
          <>
            This will permanently delete the project "{project.name}" and all its
            associated data including {project.statistics.total_images} images and{" "}
            {project.statistics.total_annotations} annotations. This action cannot be
            undone.
          </>
        }
        confirmText={project.name}
        onConfirm={() => onConfirm(project.project_id)}
        isLoading={isDeleting}
        open={open}
        onOpenChange={onOpenChange}
      />
    </>

  );
};
