import React from 'react';

interface ImageLoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ size = 'md' }) => {
  // Size mappings for the spinner
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-200/70 z-10">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 ${sizeClasses[size]}`} />
    </div>
  );
};

export default ImageLoader;