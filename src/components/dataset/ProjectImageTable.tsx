import { ProjectImage } from '@/types/dataset';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Badge } from '@/components/ui/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, AlertCircle, Database } from 'lucide-react';

interface ProjectImageTableProps {
  images: ProjectImage[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
}

export function ProjectImageTable({
  images,
  selectedIds,
  onSelect,
  onSelectAll,
}: ProjectImageTableProps) {
  const allSelected = images.length > 0 && images.every((img) => selectedIds.has(img.id));
  const someSelected = images.some((img) => selectedIds.has(img.id));

  const statusConfig = {
    annotated: { icon: CheckCircle2, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    reviewed: { icon: CheckCircle2, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    unannotated: { icon: AlertCircle, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    dataset: { icon: Database, color: 'bg-green-500/10 text-green-500 border-blue-500/20' },

  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
                className={someSelected && !allSelected ? 'opacity-50' : ''}
              />
            </TableHead>
            <TableHead className="w-24">Preview</TableHead>
            <TableHead>Filename</TableHead>
            <TableHead>Image ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Annotations</TableHead>
            <TableHead className="text-right">Dimensions</TableHead>
            <TableHead className="text-right">Size</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((image) => {
            const StatusIcon = statusConfig[image.status].icon;
            return (
              <TableRow
                key={image.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelect(image.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(image.id)}
                    onCheckedChange={() => onSelect(image.id)}
                    aria-label={`Select ${image.original_filename}`}
                  />
                </TableCell>
                <TableCell>
                  <img
                    src={image.download_url}
                    alt={image.original_filename}
                    className="w-16 h-16 object-cover rounded"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {image.original_filename.slice(0, 20)}...
                  {image.marked_as_null && (
                    <Badge variant="destructive" className="ml-2">Null</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {image.image_id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig[image.status].color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {image.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">{image.annotations.length}</span>
                    {image.annotations.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {Array.from(new Set(image.annotations.map(a => a.class_name))).length} classes
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm">
                  {image.width} × {image.height}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {image.file_size_mb.toFixed(2)} MB
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {image.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {image.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{image.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(image.added_at))} ago
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
