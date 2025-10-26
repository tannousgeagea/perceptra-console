import React from 'react';

interface ProgressBarProps {
  progress: number;
  status: 'running' | 'completed' | 'failed' | 'pending';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, status }) => {
  const getBarColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'running':
        return 'bg-amber-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-gray-300';
      default:
        return 'bg-blue-500';
    }
  };

  const barColor = getBarColor();
  const displayProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
      <div
        className={`h-2.5 rounded-full ${barColor} ${
          status === 'running' ? 'animate-pulse' : ''
        }`}
        style={{ width: `${displayProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;