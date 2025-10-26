import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No sessions yet. Start training a model!',
  ctaText = 'Start Training',
  onCtaClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <FileQuestion className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-sm text-gray-500 max-w-md text-center mb-6">
        When you start training machine learning models, your sessions will appear here.
      </p>
      {onCtaClick && (
        <button
          type="button"
          onClick={onCtaClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;