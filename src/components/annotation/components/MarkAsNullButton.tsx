import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Ban } from 'lucide-react';
import { useMarkImageAsNull } from '@/hooks/useMarkImageAsNull';
import { useAnnotation } from '@/contexts/AnnotationContext';
import { toast } from '@/hooks/use-toast';

interface Image {
    image_id: string;
    project_id: string;
    url: string;
  }
  
  interface MarkAsNullButtonProps {
    currentImage: Image;
    goToNextImage: () => void;
    className?: string;
  }

const MarkAsNullButton:React.FC<MarkAsNullButtonProps> = ( {currentImage, goToNextImage, className} ) => {
  const { markImageAsNull, isMarkingAsNull } = useMarkImageAsNull();
  const { boxes, setBoxes, setSelectedBox } = useAnnotation();

  const handleMarkAsNull = async () => {
    try {
      const response = await markImageAsNull(currentImage.image_id, currentImage.project_id);
      if (response.success) {
        toast({
          title: "Marked as null",
          description: "Annotations marked as null successfully",
          variant: "info",
          duration: 300,
        });
        
        // Reset the current annotations
        setBoxes([]);
        setSelectedBox(null);
        
        // Move to the next image
        goToNextImage();
      }
    } catch (error) {
      console.error("Error approving image:", error);
    }
  };

  return (
    <Button 
      onClick={handleMarkAsNull} 
      disabled={isMarkingAsNull}
      className={className}
    >
      <Ban className="mr-1 h-4 w-4" />
      {isMarkingAsNull ? "Marking ..." : "Mark null"}
    </Button>
  );
};

export default MarkAsNullButton;
