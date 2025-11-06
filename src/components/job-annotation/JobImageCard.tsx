import { useState } from 'react';
import { Card } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { Button } from '@/components/ui/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/ui/dropdown-menu';
import { ProjectImage } from '@/types/dataset';
import { CheckCircle2, Circle, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import BoundingBox from "@/components/image/BoundingBox";

interface JobImageCardProps {
  image: ProjectImage;
  size: 'sm' | 'md' | 'lg';
  handleClick: () => void;
}

export function JobImageCard({ image, size, handleClick }: JobImageCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const getStatusBadge = () => {
    const statusConfig = {
      unannotated: { label: 'Pending', variant: 'secondary' as const },
      annotated: { label: 'Annotated', variant: 'default' as const },
      reviewed: { label: 'Reviewed', variant: 'default' as const },
    };
    
    const config = statusConfig[image.status] || statusConfig.unannotated;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card onClick={handleClick} className={cn(
      'overflow-hidden transition-all hover:shadow-lg group',
      isUpdating && 'opacity-50 pointer-events-none'
    )}>
      <div className={cn(
        'relative bg-accent/50',
        size === 'sm' && 'aspect-square',
        size === 'md' && 'aspect-video',
        size === 'lg' && 'aspect-[4/3]'
      )}>
        <img
          src={image.download_url}
          alt={image.name}
          className="w-full h-full object-fit brightness-75"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
        
        {isLoaded &&
          image.annotations?.map((annotation, idx) => (
            <BoundingBox
              key={`${image.image_id}-ann-${idx}`}
              annotation={annotation}
              compact
            />
          ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute top-2 right-2 flex gap-2">
          {getStatusBadge()}
        </div>

        {image.annotations && image.annotations.length > 0 && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur">
              {image.annotations.length} {image.annotations.length === 1 ? 'annotation' : 'annotations'}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-sm font-medium truncate">{image.name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {image.width} × {image.height}
        </p>
      </div>
    </Card>
  );
}
