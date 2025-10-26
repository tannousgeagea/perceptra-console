
import React from 'react';
import { useUploadContext } from '../contexts/UploadContext';

export const PlaceholderPage: React.FC = () => {
  const { currentSection } = useUploadContext();
  
  const getEmoji = () => {
    switch (currentSection) {
      case 'annotate': return '🏷️';
      case 'dataset': return '📊';
      case 'versions': return '🔄';
      case 'analytics': return '📈';
      default: return '🚧';
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-2rem)] p-6">
      <div className="text-6xl mb-4">{getEmoji()}</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
        {currentSection} Page
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md">
        This section is currently under development. Please check back later for updates.
      </p>
    </div>
  );
};
