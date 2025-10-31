import { ImageRecord } from '@/types/image';
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

interface ImageTableProps {
  images: ImageRecord[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
}

export function ImageTable({ images, selectedIds, onSelect, onSelectAll }: ImageTableProps) {
  const allSelected = images.length > 0 && images.every((img) => selectedIds.has(img.id));
  const someSelected = images.some((img) => selectedIds.has(img.id)) && !allSelected;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
                className={someSelected ? 'data-[state=checked]:bg-muted' : ''}
              />
            </TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Dimensions</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Backend</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Uploaded</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((image) => (
            <TableRow
              key={image.id}
              className={selectedIds.has(image.id) ? 'bg-data-selected' : ''}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(image.id)}
                  onCheckedChange={() => onSelect(image.id)}
                />
              </TableCell>
              <TableCell>
                <img
                  src={image.download_url}
                  alt={image.name}
                  className="w-16 h-12 object-cover rounded"
                  loading="lazy"
                />
              </TableCell>
              <TableCell className="font-medium max-w-[200px] truncate" title={image.name}>
                {image.name}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {image.image_id}
              </TableCell>
              <TableCell className="text-sm">
                {image.width} × {image.height}
              </TableCell>
              <TableCell className="text-sm">{image.file_size_mb} MB</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {image.storage_profile.backend}
                </Badge>
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
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(image.created_at), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
