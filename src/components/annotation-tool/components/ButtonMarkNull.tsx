import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Ban } from 'lucide-react';
import { ProjectImageOut } from '@/types/image';
import { useMarkImageAsNull } from '@/hooks/useProjectImageUpdate';
import { useAnnotation } from '@/contexts/AnnotationContext';
import { toast } from 'sonner';

interface MarkAsNullButtonProps {
  projectId: string;
  currentImage: ProjectImageOut;
  goToNextImage: () => void;
  className?: string;
}

const MarkAsNullButton:React.FC<MarkAsNullButtonProps> = ( {currentImage, projectId, goToNextImage, className} ) => {
  const { mutate: markNull, isPending } = useMarkImageAsNull(projectId);
  const { setBoxes, setSelectedBox } = useAnnotation();

  const handleMarkAsNull = async () => {
    try {
        markNull({
          projectImageId: Number(currentImage.id),
          payload: {
            is_null: true,
            reason: 'No objects of interest in this image',
          },
        });

        // Reset the current annotations
        setBoxes([]);
        setSelectedBox(null);
        
        // Move to the next image
        goToNextImage();
    } catch (error) {
      toast.error("Failed to delete image")
    }
  }
  return (
    <Button 
      onClick={handleMarkAsNull} 
      disabled={isPending}
      className={className}
    >
      <Ban className="mr-1 h-4 w-4" />
      {isPending ? "Marking ..." : "Mark null"}
    </Button>
  );
};

export default MarkAsNullButton;
