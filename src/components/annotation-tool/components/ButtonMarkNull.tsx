import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Ban, Loader, RotateCcw } from 'lucide-react';
import { ProjectImageOut } from '@/types/image';
import { useMarkImageAsNull } from '@/hooks/useProjectImageUpdate';
import { useAnnotationState } from "@/contexts/AnnotationStateContext";
import { useAnnotationGeometry } from "@/contexts/AnnotationGeometryContext";
import { cn } from '@/lib/utils';
import { useAnnotationPaceStore } from '@/stores/annotationPaceStore';
import { isTypingTarget } from '../hotkeys';

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
  const recordFinished = useAnnotationPaceStore((s) => s.recordFinished);
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
    recordFinished();
    setAllBoxes([]);
    setSelectedBox(null);
    goToNextImage();
  };

  // E toggles the flag (mark empty and move on / restore).
  const clickRef = useRef(handleClick);
  clickRef.current = handleClick;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'e' && e.key !== 'E') return;
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e)) return;
      if (isPending) return;
      e.preventDefault();
      clickRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPending]);

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
      <div className='space-x-2'>
        <span>{isNull ? 'Restore' : 'Empty'}</span>
        <kbd className="text-[9px] px-1 leading-4 bg-amber-500/20 border border-amber-500/30 rounded">E</kbd>
      </div>
    </Button>
  );
};

export default MarkAsNullButton;
