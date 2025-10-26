import React, { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useProgress } from '@/hooks/useProgress';
import { ProgressBar } from './ProgressBar';

interface TaskProgressTrackerProps {
  taskId: string;
  title?: string;
  variant?: 'bar' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  pollingInterval?: number;
  showConfetti?: boolean;
}

export const TaskProgressTracker: React.FC<TaskProgressTrackerProps> = ({
  taskId,
  title,
  variant = 'bar',
  size = 'md',
  pollingInterval = 1000,
  showConfetti = true
}) => {
  const handleComplete = useCallback(() => {
    if (showConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [showConfetti]);

  const { progress, error } = useProgress({
    taskId,
    pollingInterval,
    onComplete: handleComplete
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <ProgressBar
        percentage={progress.percentage}
        status={progress.status}
        message={progress?.message}
        variant={variant}
        size={size}
        error={error || progress.error}
        isComplete={progress.isComplete}
        title={title}
      />
    </div>
  );
};