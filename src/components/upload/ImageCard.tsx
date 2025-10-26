
import React from 'react';
import { Trash2 } from 'lucide-react';
import { useUploadContext, UploadedImage } from '@/contexts/UploadContext';
import { cn } from '@/lib/utils';

interface ImageCardProps {
  image: UploadedImage;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const { removeImage } = useUploadContext();
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 m-w-24 dark:border-gray-700 hover:shadow-lg transition-all duration-300 ease-in-out">
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img
          src={image.previewUrl}
          alt={image.file.name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
          <button
            onClick={() => removeImage(image.id)}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-red-500 transition-colors"
            aria-label="Remove image"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="p-3">
        <p className="text-[0.75rem] font-medium text-gray-800 dark:text-gray-200 truncate" title={image.file.name}>
          {image.file.name}
        </p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {(image.file.size / 1024).toFixed(1)} KB
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};
