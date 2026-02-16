import { useState } from 'react';
import { ProjectImage } from '@/types/dataset';
import { Input } from '@/components/ui/ui/input';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Card, CardContent } from '@/components/ui/ui/card';
import { Search, CheckSquare, Square, ImageIcon, HardDrive } from 'lucide-react';
import { ProjectDatasetFilters } from '../dataset/ProjectDatasetFilters';
import { ProjectImageTable } from '../dataset/ProjectImageTable';

interface Props {
  images: ProjectImage[];
  selectedIds: Set<string>;
  totalSizeMb: number;
  searchQuery: string;
  tagFilter: string[];
  statusFilter: string;
  allTags: string[];
  onSearchChange: (q: string) => void;
  onTagFilterChange: (tags: string[]) => void;
  onStatusFilterChange: (s: string) => void;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onNext: () => void;
}

export function ImageSelectionStep({
  images,
  selectedIds,
  totalSizeMb,
  searchQuery,
  tagFilter,
  statusFilter,
  allTags,
  onSearchChange,
  onTagFilterChange,
  onStatusFilterChange,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onNext,
}: Props) {

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAnnotations, setShowAnnotations] = useState(true);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <ProjectDatasetFilters
            searchText={searchQuery}
            onSearchChange={onSearchChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showAnnotations={showAnnotations}
            onShowAnnotationsChange={setShowAnnotations}
          />
        </div>
      </div>

      {/* Selection bar */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onSelectAll}>
            <CheckSquare className="h-4 w-4 mr-1" /> Select all ({images.length})
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeselectAll}>
            <Square className="h-4 w-4 mr-1" /> Deselect all
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            {selectedIds.size} selected
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-4 w-4" />
            {totalSizeMb.toFixed(1)} MB
          </span>
        </div>
      </div>

      {/* Image grid */}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[480px] overflow-y-auto px-6 pr-1">
          {images.map((img) => {
            const selected = selectedIds.has(img.id);
            return (
              <Card
                key={img.id}
                className={`cursor-pointer transition-all overflow-hidden ${
                  selected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'
                }`}
                onClick={() => onToggle(img.id)}
              >
                <div className="relative">
                  <img
                    src={img.download_url}
                    alt={img.name}
                    className="w-full h-28 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2">
                    <Checkbox checked={selected} className="bg-background/80" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute bottom-1 right-1 text-[10px] px-1 py-0"
                  >
                    {img.status}
                  </Badge>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs truncate font-medium">{img.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {img.width}×{img.height} · {img.file_size_mb.toFixed(1)} MB
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <ProjectImageTable
          images={images}
          selectedIds={selectedIds}
          onSelect={onToggle}
          onSelectAll={onSelectAll}
        />
      )}

      {/* Next */}
      <div className="flex justify-end pt-2">
        <Button onClick={onNext} disabled={selectedIds.size === 0}>
          Continue — {selectedIds.size} image{selectedIds.size !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
