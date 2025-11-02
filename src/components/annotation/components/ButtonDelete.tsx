import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectImageOut } from '@/types/image';
import { useDeleteProjectImage } from '@/hooks/useProjectImageUpdate';

interface DeleteButtonProps {
  currentImage: ProjectImageOut;
  projectId: string;
  goToNextImage: () => void;
  className?: string;
}

const DeleteButton:React.FC<DeleteButtonProps> = ( {currentImage, projectId, goToNextImage, className} ) => {
  const { mutate: deleteImage, isPending } = useDeleteProjectImage(projectId!, {
    // onSuccess: () => {
    //   toast.success('Image deleted');
    //   // Navigate away or update list
    // },
  });

  const handleDelete = async () => {
    try {
      deleteImage({ projectImageId: Number(currentImage.id), hardDelete: false });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error(`Failed to delete image: ${error}`);
    }
  };

  return (
    <Button 
      onClick={handleDelete} 
      disabled={isPending}
      className={className}
      variant="destructive"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
};

export default DeleteButton;