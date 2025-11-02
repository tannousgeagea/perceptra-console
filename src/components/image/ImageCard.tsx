import React, { useState } from "react";
import { ImageCardProps } from "@/types/image";
import BoundingBox from "./BoundingBox";
import ImageLoader from "./ImageLoader";
import { cn } from "@/lib/utils"; // if you have a className merge util

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  onClick,
  className = "",
  highlightColor = "rgba(255, 255, 0, 0.9)",
  size = "md",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Card size variants
  const sizeClasses = {
    sm: "max-w-[12rem]",
    md: "max-w-[18rem]",
    lg: "max-w-[24rem]",
  };

  const handleClick = () => {
    if (onClick) onClick(index);
  };

  return (
    <div
      className={cn(
        `relative rounded-sm overflow-hidden bg-muted/20 border border-border
         shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer`,
        sizeClasses[size],
        className,
        isHovered && "ring-2 ring-primary/30 scale-[1.02]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Image container with fixed aspect ratio */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {/* Main image */}
        <img
          src={image.download_url}
          alt={image.name}
          className={`object-contain w-full h-full transition-all duration-500 
            ${isLoaded ? "opacity-100" : "opacity-0"} 
            ${isHovered ? "scale-[1.03]" : "scale-100"}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />

        {/* Bounding boxes overlay */}
        {isLoaded &&
          image.annotations?.map((annotation, idx) => (
            <BoundingBox
              key={`${image.image_id}-ann-${idx}`}
              annotation={annotation}
              highlightColor={highlightColor}
              compact
            />
          ))}

        {/* Image loader while loading */}
        {!isLoaded && <ImageLoader size={size} />}

        {/* Hover gradient overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent 
            opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Image name */}
        <div
          className={`absolute bottom-0 left-0 right-0 
            px-2 py-1 text-xs sm:text-sm font-medium truncate text-white
            bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300
            ${isHovered ? "opacity-100" : "opacity-90"}`}
        >
          {image.name}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
