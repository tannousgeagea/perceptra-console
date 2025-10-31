import { ImageRecord } from '@/types/image';
import { ImageCard } from './ImageCard';

interface ImageGridProps {
  images: ImageRecord[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
}

export function ImageGrid({ images, selectedIds, onSelect }: ImageGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          selected={selectedIds.has(image.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
