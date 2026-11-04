import React, { useEffect } from 'react';
import { Button } from '@/components/ui/ui/button';
import { CheckCircle, Loader } from 'lucide-react';
import { useReviewProjectImage } from '@/hooks/useProjectImageUpdate';
import { toast } from '@/hooks/use-toast';
import { ProjectImageOut } from '@/types/image';
import { useAnnotationGeometry } from '@/contexts/AnnotationGeometryContext';
import { useAnnotationState } from '@/contexts/AnnotationStateContext';
import { useAnnotationPaceStore } from '@/stores/annotationPaceStore';
import { isTypingTarget } from '../hotkeys';

interface ApproveButtonProps {
  currentImage: ProjectImageOut;
  projectId: string;
  goToNextImage: () => void;
  className?: string;
}

const ApproveButton:React.FC<ApproveButtonProps> = ( {currentImage, projectId, goToNextImage, className} ) => {
  const { mutate: reviewImage, isPending } = useReviewProjectImage(projectId!);
  const { getBoxesArray } = useAnnotationGeometry();
  const { selectedBox } = useAnnotationState();
  const recordFinished = useAnnotationPaceStore((s) => s.recordFinished);
  const boxes = getBoxesArray();

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
      recordFinished();

      // Reset the current annotations
      // setBoxes([]);
      // setSelectedBox(null);
      goToNextImage();

    } catch (error) {
      console.error("Error approving image:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Enter approves — unless typing, or a box is selected (Enter saves the box then).
      // Shift+Enter is "send back" (ReviewFeedback).
      if (event.key !== "Enter" || event.shiftKey || isPending || event.repeat) return;
      if (isTypingTarget(event) || selectedBox || event.defaultPrevented) return;
      handleApprove();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleApprove reads these
  }, [isPending, boxes, currentImage, selectedBox]);

  return (
    <Button
      onClick={handleApprove}
      disabled={isPending}
      className={className}
      variant="ghost"
    >
      {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
      <div className='space-x-2'>
        <span>Approve</span>
        <kbd className="text-[9px] px-1 leading-4 bg-emerald-500/20 border border-emerald-500/30 rounded">↵</kbd>
      </div>
    </Button>
  );
};

export default ApproveButton;
