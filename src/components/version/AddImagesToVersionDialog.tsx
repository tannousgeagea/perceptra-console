import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/ui/dialog';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/ui/radio-group';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { ScrollArea } from '@/components/ui/ui/scroll-area';
import { Badge } from '@/components/ui/ui/badge';
import { Search, Plus } from 'lucide-react';
import { useProjectImages } from '@/hooks/useProjectImages';
import { useSearchParser } from '@/hooks/useSearchParser';
import { buildImageQuery } from '@/hooks/useImages';
import { useAddImagesToVersion } from '@/hooks/useDatasetVersions';
import { useToast } from '@/hooks/use-toast';

interface AddImagesToVersionDialogProps {
  projectId:string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versionId: string;
  versionName: string;
}

export function AddImagesToVersionDialog({
  projectId,
  open,
  onOpenChange,
  versionId,
  versionName,
}: AddImagesToVersionDialogProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [split, setSplit] = useState<'train' | 'val' | 'test'>('train');

  const { toast } = useToast();

  const parsedQuery = useSearchParser(searchText);
  const _query = buildImageQuery(parsedQuery);
  const { data: availableImages, isLoading, error, refetch } = useProjectImages(projectId!, {
    q: _query,
  });
  const { mutate: addImages, isPending: isAdding } = useAddImagesToVersion(projectId, versionId);

  const handleToggleImage = (imageId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedIds(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedIds.size === availableImages?.images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableImages?.images.map(img => img.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select at least one image to add.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addImages({
        project_image_ids: Array.from(selectedIds).map(id => parseInt(id)),
        split,
      });
      
      toast({
        title: "Images Added",
        description: `Successfully added ${selectedIds.size} image(s) to ${versionName}.`,
      });
      
      setSelectedIds(new Set());
      setSearchText('');
      setSplit('train');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add images. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Images to {versionName}</DialogTitle>
          <DialogDescription>
            Select images from your project to add to this dataset version.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search available images..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleAll}
              disabled={isLoading || availableImages?.images.length === 0}
            >
              {selectedIds.size === availableImages?.images.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Target Split</Label>
            <RadioGroup value={split} onValueChange={(v) => setSplit(v as 'train' | 'val' | 'test')}>
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="train" id="train" />
                  <Label htmlFor="train" className="font-normal cursor-pointer text-success">
                    Train
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="val" id="val" />
                  <Label htmlFor="val" className="font-normal cursor-pointer text-primary">
                    Validation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="test" id="test" />
                  <Label htmlFor="test" className="font-normal cursor-pointer text-warning">
                    Test
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading available images...</div>
          ) : availableImages?.images.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No available images found. All project images may already be in this version.
            </div>
          ) : (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableImages?.images.map((image) => (
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
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                      />
                    </div>
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedIds.has(image.id)}
                        onCheckedChange={() => handleToggleImage(image.id)}
                        className="bg-background"
                      />
                    </div>
                    <div className="p-2 bg-background/95 backdrop-blur">
                      <p className="text-xs font-medium truncate">{image.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="text-xs">
                          {image.annotations.length} annotations
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {image.width}×{image.height}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} image(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isAdding || selectedIds.size === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add to {split.charAt(0).toUpperCase() + split.slice(1)}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
