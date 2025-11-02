import React, { useEffect } from 'react';
import { Button } from '@/components/ui/ui/button';
import { CheckCircle } from 'lucide-react';
import { useReviewProjectImage } from '@/hooks/useProjectImageUpdate';
import { useAnnotation } from '@/contexts/AnnotationContext';
import { toast } from '@/hooks/use-toast';
import { ProjectImageOut } from '@/types/image';

interface ApproveButtonProps {
  currentImage: ProjectImageOut;
  projectId: string;
  goToNextImage: () => void;
  className?: string;
}

const ApproveButton:React.FC<ApproveButtonProps> = ( {currentImage, projectId, goToNextImage, className} ) => {
  const { mutate: reviewImage, isPending } = useReviewProjectImage(projectId!);
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
      reviewImage({ 
        projectImageId: Number(currentImage.id), 
        payload: { 
          approved: true, 
        } 
      });

      // Reset the current annotations
      setBoxes([]);
      setSelectedBox(null);
      goToNextImage();

    } catch (error) {
      console.error("Error approving image:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for the Enter key and ensure we're not already in an approving state
      if (event.key === "Enter" && !isPending) {
        handleApprove();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPending, boxes, currentImage]);

  return (
    <Button 
      onClick={handleApprove} 
      disabled={isPending}
      className={className}
      variant="default"
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      {isPending ? "Approving ..." : "Approve"}
    </Button>
  );
};

export default ApproveButton;
