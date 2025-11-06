import { JobImageCard } from './JobImageCard';
import { ProjectImage } from '@/types/dataset';
import { cn } from '@/lib/utils';

interface JobImageGridProps {
  images: ProjectImage[];
  imageSize: 'sm' | 'md' | 'lg';
  onImageClick: (index: number, image_id: string) => void;
}

const gridClasses = {
  sm: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3',
  md: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  lg: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
};

export function JobImageGrid({ images, imageSize,  onImageClick }: JobImageGridProps) {
  return (
    <div className={cn('grid', gridClasses[imageSize])}>
      {images.map((image, index) => (
        <JobImageCard
          key={image.id}
          image={image}
          size={imageSize}
          handleClick={() => onImageClick(index, image.image_id)}
        />
      ))}
    </div>
  );
}
