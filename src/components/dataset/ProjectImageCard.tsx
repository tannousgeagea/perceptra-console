import { ProjectImage } from '@/types/dataset';
import { Card } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { Bike, ChartCandlestick, FlaskConical } from 'lucide-react';
import { FileImage, Tag, CheckCircle2, AlertCircle, Clock, Database } from 'lucide-react';
import BoundingBox from '../image/BoundingBox';
import { getModeBadge } from '@/utils/split';

interface ProjectImageCardProps {
  image: ProjectImage;
  selected: boolean;
  onSelect: (id: string) => void;
  showAnnotations: boolean;
}

export function ProjectImageCard({ image, selected, onSelect, showAnnotations }: ProjectImageCardProps) {
  const statusConfig = {
    annotated: { icon: CheckCircle2, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    reviewed: { icon: CheckCircle2, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    dataset: { icon: Database, color: 'bg-green-500/10 text-green-500 border-blue-500/20' },
    unannotated: { icon: AlertCircle, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  };

  const StatusIcon = statusConfig[image.status].icon;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex-1">
      <div className="relative group">
        <div className="relative w-full aspect-[16/9] bg-muted">
          <img
            src={image.download_url}
            alt={image.name}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            className="w-full h-full object-fit brightness-50"
          />
          {showAnnotations && image.annotations.length > 0 && (
            image.annotations?.map((annotation, idx) => (
              <BoundingBox
                key={`${image.image_id}-ann-${idx}`}
                annotation={annotation}
                compact
              />
            ))
          )}
        </div>
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(image.id)}
            className="w-6 h-6"
          />
        </div>
        <div className="absolute top-2 right-2">
          <Badge className={statusConfig[image.status].color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {image.status}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          {getModeBadge(image.split!)}
        </div>
        {image.marked_as_null && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive">Null</Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{image.original_filename}</h3>
              <p className="text-xs text-muted-foreground truncate">{image.image_id}</p>
            </div>
            <FileImage className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </div>

        {image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {image.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Annotations:</span>
            <span className="font-medium text-foreground">{image.annotations.length}</span>
          </div>
          
          {image.annotations.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set(image.annotations.map(a => a.class_name))).slice(0, 3).map((className) => (
                <Badge key={className} variant="outline" className="text-xs">
                  {className}
                </Badge>
              ))}
              {Array.from(new Set(image.annotations.map(a => a.class_name))).length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{Array.from(new Set(image.annotations.map(a => a.class_name))).length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span>Dimensions:</span>
            <span className="font-medium text-foreground">
              {image.width} × {image.height}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Size:</span>
            <span className="font-medium text-foreground">{image.file_size_mb.toFixed(2)} MB</span>
          </div>

          {image.job_assignment_status && (
            <div className="flex items-center justify-between">
              <span>Job Status:</span>
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {image.job_assignment_status}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span>Priority:</span>
            <span className="font-medium text-foreground">{image.priority}</span>
          </div>

          <div className="pt-2 border-t mt-auto">
            <span>Added {formatDistanceToNow(new Date(image.added_at))} ago</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
