import React, { useState, useEffect } from 'react';
import BackArrow from '../../ui/actions/BackArrow';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAnnotation } from '@/contexts/AnnotationContext';

interface AnnotationControlsProps {
  current: number;
  total: number;
  title: string;
  onPrevious: () => void;
  onNext: () => void;
}

const AnnotationControls: React.FC<AnnotationControlsProps> = ({
  current,
  total,
  title,
  onPrevious,
  onNext,
}) => {
  const { setBoxes, setSelectedBox } = useAnnotation();
  // Initial Tailwind classes for full opacity with a transition.
  const [transitionClasses, setTransitionClasses] = useState(
    'opacity-100 transition-opacity duration-300'
  );

  const handleNavigation = (direction: 'prev' | 'next') => {
    setTransitionClasses('opacity-0 transition-opacity duration-300');

    setTimeout(() => {
      setBoxes([]);
      setSelectedBox(null);

      if (direction === 'prev') {
        onPrevious();
      } else {
        onNext();
      }

      setTransitionClasses('opacity-100 transition-opacity duration-300');
    }, 300);
  };

  const handlePrevious = () => {
    if (current > 1) {
      handleNavigation('prev');
    }
  };

  const handleNext = () => {
    if (current < total) {
      handleNavigation('next');
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [current, total]);

  return (
    <div
      className={`flex items-center justify-between text-[#00d1b2] px-3 py-2 rounded text-sm gap-2 border-b border-white/60 ${transitionClasses}`}
    >
      <div className="flex items-center gap-2">
        <BackArrow />
        <p className="overflow-hidden text-ellipsis whitespace-nowrap font-normal text-xl w-[300px]">
          {title}
        </p>
      </div>
      <div className="bg-[#dadceb33] rounded-lg py-[0.15rem] px-4 flex items-center justify-center mr-[15rem]">
        <button
          onClick={handlePrevious}
          disabled={current === 1}
          className="bg-transparent border-none text-[#00d1b2] cursor-pointer text-[16px] disabled:text-white/30 disabled:cursor-not-allowed"
        >
          <ChevronLeft />
        </button>
        <span className="font-bold">{`${current} / ${total}`}</span>
        <button
          onClick={handleNext}
          disabled={current === total}
          className="bg-transparent border-none text-[#00d1b2] cursor-pointer text-[16px] disabled:text-white/30 disabled:cursor-not-allowed"
        >
          <ChevronRight />
        </button>
      </div>
      <div></div>
    </div>
  );
};

export default AnnotationControls;
