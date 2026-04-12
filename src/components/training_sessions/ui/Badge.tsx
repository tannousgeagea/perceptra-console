import React from 'react';
import { Status } from '@/types/training_session';

interface BadgeProps {
  status: Status;
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getStatusStyles = (status: Status): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'running':
        return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(
        status
      )}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default Badge;