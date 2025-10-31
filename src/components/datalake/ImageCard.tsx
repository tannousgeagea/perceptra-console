import { ImageRecord } from '@/types/image';
import { Card } from '@/components/ui/ui/card';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Badge } from '@/components/ui/ui/badge';
import { Image, Calendar, HardDrive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ImageCardProps {
  image: ImageRecord;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ImageCard({ image, selected, onSelect }: ImageCardProps) {
  return (
    <Card
      className={`group relative overflow-hidden transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-primary bg-data-selected' : ''
      }`}
    >
      {/* Checkbox overlay */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onSelect(image.id)}
          className="bg-white data-[state=checked]:bg-primary"
        />
      </div>

      {/* Image */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img
          src={image.download_url}
          alt={image.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Filename */}
        <div className="flex items-start gap-2">
          <Image className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" title={image.name}>
              {image.name}
            </p>
            <p className="text-xs text-muted-foreground font-mono truncate" title={image.image_id}>
              {image.image_id}
            </p>
          </div>
        </div>

        {/* Tags */}
        {image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {image.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {image.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                +{image.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            <span>{image.file_size_mb}MB</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(image.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Dimensions */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {image.width} × {image.height}
          </span>
          <Badge variant="outline" className="text-xs">
            {image.storage_profile.backend}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
