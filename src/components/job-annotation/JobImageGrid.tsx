import { JobImageCard } from './JobImageCard';
import { ProjectImage } from '@/types/dataset';
import { cn } from '@/lib/utils';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useAuth } from '@/contexts/AuthContext';
import { PersonAvatar } from '@/components/realtime/PresenceStack';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/ui/tooltip';
import type { PresenceEntry } from '@/contexts/RealtimeContext';

interface JobImageGridProps {
  images: ProjectImage[];
  imageSize: 'sm' | 'md' | 'lg';
  selectedIds: Set<string>;
  selectionMode: boolean;
  onToggleSelect: (imageId: string) => void;
  onImageClick: (index: number, image_id: string) => void;
}

const gridClasses = {
  sm: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3',
  md: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  lg: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
};

/** Who has each image open in the annotator (other people only). */
const usePeopleByImage = () => {
  const { presence } = useRealtime();
  const { user } = useAuth();
  const me = user?.id != null ? String(user.id) : undefined;
  const byImage = new Map<string, PresenceEntry[]>();
  for (const entry of presence) {
    if (entry.view !== 'annotate' || !entry.image_uid || String(entry.user_id) === me) continue;
    const list = byImage.get(entry.image_uid) ?? [];
    if (!list.some((p) => p.user_id === entry.user_id)) list.push(entry);
    byImage.set(entry.image_uid, list);
  }
  return byImage;
};

const OpenBy = ({ people }: { people: PresenceEntry[] }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="flex -space-x-1.5" onClick={(e) => e.stopPropagation()}>
        {people.slice(0, 3).map((p) => (
          <PersonAvatar key={p.user_id} entry={p} size="xs" ring="ring-black/40" />
        ))}
      </div>
    </TooltipTrigger>
    <TooltipContent className="text-xs">
      {people.map((p) => p.name).join(', ')} {people.length === 1 ? 'has' : 'have'} this image open
    </TooltipContent>
  </Tooltip>
);

export function JobImageGrid({ images, imageSize, selectedIds, selectionMode, onToggleSelect,  onImageClick }: JobImageGridProps) {
  const peopleByImage = usePeopleByImage();
  return (
    <div className={cn('grid', gridClasses[imageSize])}>
      {images.map((image, index) => (
        <JobImageCard
          key={image.project_image_id}
          image={image}
          size={imageSize}
          selected={selectedIds.has(image.project_image_id)}
          selectionMode={selectionMode}
          onToggleSelect={onToggleSelect}
          handleClick={() => onImageClick(index, image.image_id)}
          overlay={peopleByImage.has(image.image_id) ? <OpenBy people={peopleByImage.get(image.image_id)!} /> : undefined}
        />
      ))}
    </div>
  );
}
