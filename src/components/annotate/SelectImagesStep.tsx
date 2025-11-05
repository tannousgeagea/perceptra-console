import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Badge } from '@/components/ui/ui/badge';
import { ScrollArea } from '@/components/ui/ui/scroll-area';
import { Search, AlertCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBatchFinalizeImages } from './useDatasetBuilder';
import { ProjectImage } from '@/types/dataset';

interface SelectImagesStepProps {
  images: ProjectImage[];
  onComplete: (imageIds: number[], finalizedCount: number) => void;
}

// Mock available images (annotated and reviewed, ready to be finalized)
const generateMockImages = (): ProjectImage[] => {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `ready-${i + 1}`,
    image_id: `img-ready-${i + 1}`,
    name: `annotated_image_${String(i + 1).padStart(4, '0')}.jpg`,
    original_filename: `IMG_${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}.jpg`,
    width: 1920,
    height: 1080,
    aspect_ratio: 16 / 9,
    file_format: 'jpg',
    file_size: 2048000,
    file_size_mb: 2.0,
    megapixels: 2.1,
    storage_key: `storage/images/ready-${i + 1}.jpg`,
    checksum: `md5-ready-${i}`,
    source_of_origin: 'upload',
    created_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    uploaded_by: 'user-1',
    tags: ['annotated', 'reviewed'],
    storage_profile: {
      id: 'profile-1',
      name: 'Primary Storage',
      backend: 's3',
    },
    download_url: `https://picsum.photos/seed/ready-${i}/800/600`,
    status: 'reviewed' as const,
    annotated: true,
    reviewed: true,
    marked_as_null: false,
    priority: 0,
    job_assignment_status: null,
    added_at: new Date().toISOString(),
    annotations: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, j) => ({
      id: `ann-ready-${i}-${j}`,
      annotation_uid: `uid-ready-${i}-${j}`,
      type: 'bbox',
      class_id: `class-${j % 3}`,
      class_name: ['person', 'car', 'truck'][j % 3],
      color: ['#22c55e', '#3b82f6', '#f59e0b'][j % 3],
      data: [0,1,0,1],
      source: 'manual',
      confidence: 0.95,
      reviewed: true,
      is_active: true,
      created_at: new Date().toISOString(),
      created_by: 'user-1',
    })),
  }));
};

export function SelectImagesStep({ images, onComplete }: SelectImagesStepProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // const [images] = useState<ProjectImage[]>(generateMockImages());
  
  const { toast } = useToast();
  const { mutate: finalizeImages, isLoading } = useBatchFinalizeImages();

  const filteredImages = useMemo(() => {
    if (!searchText.trim()) return images;
    const query = searchText.toLowerCase();
    return images.filter(img => img.name.toLowerCase().includes(query));
  }, [images, searchText]);

  const handleToggleImage = (imageId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedIds(newSelected);
  };

  console.log(selectedIds)
  const handleToggleAll = () => {
    if (selectedIds.size === filteredImages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredImages.map(img => img.id)));
    }
  };

  const handleFinalize = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select at least one image to finalize.",
        variant: "destructive",
      });

      return;
    }

    try {
      const imageIds = Array.from(selectedIds).map(id => parseInt(id.split('-')[1]));
      const response = await finalizeImages(imageIds);
      
      if (response.invalid_ids.length > 0) {
        toast({
          title: "Some Images Skipped",
          description: `${response.finalized_count} images finalized. ${response.invalid_ids.length} images were not annotated or reviewed.`,
        });
      } else {
        toast({
          title: "Images Finalized",
          description: `Successfully finalized ${response.finalized_count} images for dataset.`,
        });
      }
      
      onComplete(imageIds, response.finalized_count);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to finalize images. Please try again.",
        variant: "destructive",
      });
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
          onClick={handleToggleAll}
          disabled={filteredImages.length === 0}
        >
          {selectedIds.size === filteredImages.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

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
                  selectedIds.has(image.id) ? 'border-primary shadow-md' : 'border-border'
                }`}
                onClick={() => handleToggleImage(image.id)}
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
                    checked={selectedIds.has(image.id)}
                    onCheckedChange={() => handleToggleImage(image.id)}
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
          {selectedIds.size} image(s) selected
        </span>
        <Button onClick={handleFinalize} disabled={isLoading || selectedIds.size === 0} size="lg">
          {isLoading ? 'Finalizing...' : 'Finalize & Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
