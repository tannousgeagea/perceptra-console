import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Trash2, Loader } from 'lucide-react';
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
  const { mutate: deleteImage, isPending } = useDeleteProjectImage(projectId);

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
      title='delete image'
    >
      {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
};

export default DeleteButton;