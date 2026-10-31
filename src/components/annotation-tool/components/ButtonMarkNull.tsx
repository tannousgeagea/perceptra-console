import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Ban, Loader, RotateCcw } from 'lucide-react';
import { ProjectImageOut } from '@/types/image';
import { useMarkImageAsNull } from '@/hooks/useProjectImageUpdate';
import { useAnnotationState } from "@/contexts/AnnotationStateContext";
import { useAnnotationGeometry } from "@/contexts/AnnotationGeometryContext";
import { cn } from '@/lib/utils';

interface MarkAsNullButtonProps {
  projectId: string;
  currentImage: ProjectImageOut;
  goToNextImage: () => void;
  className?: string;
}

/**
 * Toggles the image's "empty" (null) flag.
 * - Not flagged: marks it empty, clears the canvas and moves on.
 * - Flagged: restores it — the server brings back the annotations removed by
 *   the flag, and the image details refetch to show them.
 */
const MarkAsNullButton: React.FC<MarkAsNullButtonProps> = ({ currentImage, projectId, goToNextImage, className }) => {
  const { mutate: markNull, isPending } = useMarkImageAsNull(projectId);
  const { setSelectedBox } = useAnnotationState();
  const { setAllBoxes } = useAnnotationGeometry();
  const isNull = !!currentImage.marked_as_null;

  const handleClick = () => {
    if (isNull) {
      markNull({ projectImageId: Number(currentImage.id), payload: { is_null: false } });
      return;
    }

    markNull({
      projectImageId: Number(currentImage.id),
      payload: { is_null: true, reason: 'No objects of interest in this image' },
    });
    setAllBoxes([]);
    setSelectedBox(null);
    goToNextImage();
  };

  const Icon = isPending ? Loader : isNull ? RotateCcw : Ban;

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant="ghost"
      title={isNull
        ? 'Restore: remove the empty flag and bring back any annotations it removed'
        : 'Mark as empty: no objects of interest (negative sample)'}
      className={cn(className, isNull && 'text-sky-400 hover:bg-sky-500/10 hover:text-sky-300')}
    >
      <Icon className={cn('h-4 w-4', isPending && 'animate-spin')} />
      <span>{isNull ? 'Restore' : 'Empty'}</span>
    </Button>
  );
};

export default MarkAsNullButton;
