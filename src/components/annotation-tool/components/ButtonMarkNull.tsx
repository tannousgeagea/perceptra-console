import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Ban, Loader } from 'lucide-react';
import { ProjectImageOut } from '@/types/image';
import { useMarkImageAsNull } from '@/hooks/useProjectImageUpdate';
import { useAnnotationState } from "@/contexts/AnnotationStateContext";
import { useAnnotationGeometry } from "@/contexts/AnnotationGeometryContext";
import { toast } from 'sonner';

interface MarkAsNullButtonProps {
  projectId: string;
  currentImage: ProjectImageOut;
  goToNextImage: () => void;
  className?: string;
}

const MarkAsNullButton:React.FC<MarkAsNullButtonProps> = ( {currentImage, projectId, goToNextImage, className} ) => {
  const { mutate: markNull, isPending } = useMarkImageAsNull(projectId);
  const { setSelectedBox } = useAnnotationState();
  const { setAllBoxes } = useAnnotationGeometry();

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
        setAllBoxes([]);
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
      title='mark image as null (backgroud image)'
    >
      {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
    </Button>
  );
};

export default MarkAsNullButton;
