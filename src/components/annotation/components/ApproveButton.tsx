import React, { useEffect } from 'react';
import { Button } from '@/components/ui/ui/button';
import { CheckCircle } from 'lucide-react';
import { useImageApproval } from '@/hooks/useApproveImage';
import { useAnnotation } from '@/contexts/AnnotationContext';
import { toast } from '@/hooks/use-toast';

interface Image {
    image_id: string;
    project_id: string;
    url: string;
  }
  
  interface ApproveButtonProps {
    currentImage: Image;
    goToNextImage: () => void;
    className?: string;
  }

const ApproveButton:React.FC<ApproveButtonProps> = ( {currentImage, goToNextImage, className} ) => {
  const { approveImage, isApproving } = useImageApproval();
//   const { currentImage, goToNextImage } = useImage();
  const { boxes, setBoxes, setSelectedBox } = useAnnotation();

  const handleApprove = async () => {
    if (boxes.length === 0) {
      toast({
        title: "No annotations",
        description: "Please create at least one annotation before approving",
        variant: "warning",
      });
      return;
    }

    try {
      const response = await approveImage(currentImage.image_id, currentImage.project_id);
      
      console.log(response)
      if (response.success) {
        toast({
          title: "Approved",
          description: "Annotations approved successfully",
          variant: "success",
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for the Enter key and ensure we're not already in an approving state
      if (event.key === "Enter" && !isApproving) {
        handleApprove();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isApproving, boxes, currentImage]);

  return (
    <Button 
      onClick={handleApprove} 
      disabled={isApproving}
      className={className}
      variant="default"
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      {isApproving ? "Approving ..." : "Approve"}
    </Button>
  );
};

export default ApproveButton;
