import React, { useState } from 'react';
import { ImageCardProps } from '@/types/image';
import BoundingBox from './BoundingBox';
import ImageLoader from './ImageLoader';

const ImageCard: React.FC<ImageCardProps> = ({ 
  image, 
  index, 
  onClick, 
  className = '',
  highlightColor = 'rgba(255, 255, 0, 0.9)',
  size = 'md'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Size mappings for different card sizes
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const handleClick = () => {
    if (onClick) {
      onClick(index);
    }
  };

  return (
    <div 
      className={`relative rounded-md overflow-hidden shadow-sm transition-all duration-300 ${className} 
        ${sizeClasses[size]} ${isHovered ? 'shadow-md ring-2 ring-indigo-300 bg-indigo-50/30' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div 
        className="relative w-full h-full cursor-pointer"
        onClick={handleClick}
      >
        {/* Image */}
        <img 
          src={image.image_url}
          alt={image.image_name}
          className={`absolute inset-0 w-full h-full object-fill transition-all duration-300 
            ${isLoaded ? 'opacity-100' : 'opacity-0'} 
            ${isHovered ? 'brightness-90' : 'brightness-95'}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
        
        {/* Bounding boxes */}
        {isLoaded && image.annotations?.map((annotation, idx) => (
          <BoundingBox 
            key={`${image.image_id}-annotation-${idx}`}
            annotation={annotation}
            highlightColor={highlightColor}
          />
        ))}
        
        {/* Loading state */}
        {!isLoaded && <ImageLoader size={size} />}
        
        {/* Image name overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 transition-opacity duration-300 
          ${isHovered || size === 'sm' ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white text-xs truncate font-medium">
            {image.image_name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;