import { ProjectImage } from '@/types/dataset';
import { ProjectImageCard } from './ProjectImageCard';

interface ProjectImageGridProps {
  images: ProjectImage[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  showAnnotations: boolean;
  
}

export function ProjectImageGrid({ images, selectedIds, onSelect, showAnnotations }: ProjectImageGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((image) => (
        <ProjectImageCard
          key={image.id}
          image={image}
          selected={selectedIds.has(image.id)}
          onSelect={onSelect}
          showAnnotations={showAnnotations}
        />
      ))}
    </div>
  );
}
