import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Badge } from '@/components/ui/ui/badge';
import { ScrollArea } from '@/components/ui/ui/scroll-area';
import { Search, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useBatchFinalizeImages } from '@/hooks/useProjectImageUpdate';
import { ProjectImage } from '@/types/dataset';
import { SelectAllMatchingBanner } from '@/components/ui/ui/select-all-matching-banner';
import { useSelectAllMatching } from '@/hooks/useSelectAllMatching';
import { X } from 'lucide-react';

interface SelectImagesStepProps {
  projectId: string;
  images: ProjectImage[];
  project_image_ids?: string[];
  total_images: number;
  onComplete: (imageIds: number[], finalizedCount: number) => void;
}

export function SelectImagesStep({ projectId, images, project_image_ids, total_images, onComplete }: SelectImagesStepProps) {
  const [searchText, setSearchText] = useState('');
  const { mutateAsync: batchFinalize, isPending } = useBatchFinalizeImages(projectId, {
    onSuccess: (data) => {
      toast.success(
        `Finalized ${data.finalized_count} of ${data.total_requested} images`
      );
      if (data.invalid_ids.length > 0) {
        toast.warning(
          `${data.invalid_ids.length} images skipped (not annotated/reviewed)`
        );
      }
    },
  });

  const filteredImages = useMemo(() => {
    if (!searchText.trim()) return images;
    const query = searchText.toLowerCase();
    return images.filter(img => img.name.toLowerCase().includes(query));
  }, [images, searchText]);

  const pageIds = filteredImages.map(img => img.project_image_id);
  const selection = useSelectAllMatching({
    pageIds,
    totalMatching: total_images,
    allMatchingIds: project_image_ids,
    resetKey: `${searchText}`,
  });

  const handleFinalize = async () => {
    if (selection.selectedCount === 0) {
      toast.error("Please select at least one image to finalize.");
      return;
    }

    try {
      const imageIds = Array.from(selection.selectedIds).map(id => parseInt(id));
      const response = await batchFinalize(imageIds); // ✅ Added 'await' and fixed typo 'resonse'
      
      onComplete(imageIds, response.finalized_count);
    } catch (error) {
      toast.error("Failed to finalize images. Please try again.");
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-[600px]">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={selection.togglePage}
          disabled={filteredImages.length === 0}
        >
          {selection.selectedCount === filteredImages.length ? 'Deselect All' : 'Select All'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={selection.clear}
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>


      <SelectAllMatchingBanner
        showSelectAllMatchingPrompt={selection.showSelectAllMatchingPrompt}
        allMatchingSelected={selection.allMatchingSelected}
        selectedCount={selection.selectedCount}
        pageSize={pageIds.length}
        totalMatching={total_images}
        onSelectAllMatching={selection.selectAllMatching}
        onClear={selection.clear}
      />

      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <AlertCircle className="h-4 w-4 text-primary" />
        <p className="text-sm text-primary">
          Select annotated and reviewed images to add to your dataset. They will be ready for splitting in the next step.
        </p>
      </div>

      {filteredImages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p>No images available for dataset. Make sure images are annotated and reviewed.</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pr-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  selection.selectedIds.has(image.project_image_id) ? 'border-primary shadow-md' : 'border-border'
                }`}
                onClick={() => selection.toggle(image.project_image_id)}
              >
                <div className="aspect-video bg-accent/50">
                  <img
                    src={image.download_url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selection.selectedIds.has(image.project_image_id)}
                    onCheckedChange={() => selection.toggle(image.project_image_id)}
                    className="bg-background shadow-md"
                  />
                </div>
                <div className="p-2 bg-background/95 backdrop-blur">
                  <p className="text-xs font-medium truncate">{image.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs">
                      {image.annotations.length} annotations
                    </Badge>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                        ✓
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                        R
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-sm font-medium">
          {selection.selectedCount} image(s) selected
        </span>
        <Button onClick={handleFinalize} disabled={isPending || selection.selectedCount === 0} size="lg">
          {isPending ? 'Finalizing...' : 'Finalize & Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
