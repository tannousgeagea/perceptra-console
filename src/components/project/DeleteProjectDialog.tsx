
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
        title="Delete Project"
        description={
          <>
            The project "{project.name}" will be removed for everyone, including its{" "}
            {project.statistics.total_images.toLocaleString()} images and{" "}
            {project.statistics.total_annotations.toLocaleString()} annotations.
            You can undo this right after deleting.
          </>
        }
        subtitle="Only organization admins and owners can delete projects."
        confirmText={project.name}
        onConfirm={() => onConfirm(project.project_id)}
        isLoading={isDeleting}
        open={open}
        onOpenChange={onOpenChange}
      />
    </>

  );
};
