import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/ui/dialog';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/ui/radio-group';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { ScrollArea } from '@/components/ui/ui/scroll-area';
import { Badge } from '@/components/ui/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Search, Plus, CheckSquare, Square, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useProjectImages } from '@/hooks/useProjectImages';
import { useSearchParser } from '@/hooks/useSearchParser';
import { buildImageQuery } from '@/hooks/useImages';
import { useAddImagesToVersion } from '@/hooks/useDatasetVersions';
import { useToast } from '@/hooks/use-toast';
import { string } from 'zod';

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);

  const { toast } = useToast();
  const parsedQuery = useSearchParser(searchText);
  const _query = buildImageQuery(parsedQuery);
  const { data: availableImages, isLoading, error, refetch } = useProjectImages(projectId!, {
    q: _query,
    skip: (page - 1) * pageSize,
    limit: pageSize,
  });
  const { mutate: addImages, isPending: isAdding } = useAddImagesToVersion(projectId, versionId);

  const skip = (page - 1) * pageSize;
  const totalPages = availableImages ? Math.max(1, Math.ceil(availableImages.total / pageSize)) : 1;


  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);
    setPage(1);
    setAllMatchingSelected(false);
  }, []);

  const handlePageSizeChange = useCallback((value: string) => {
    setPageSize(Number(value));
    setPage(1);
  }, []);

  const handleToggleImage = useCallback((imageId: string) => {
    setAllMatchingSelected(false);
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  }, []);

  const handleTogglePageAll = useCallback(() => {
    if (!availableImages) return;
    const pageIds = availableImages.images.map(img => img.id);
    const allPageSelected = pageIds.every(id => selectedIds.has(id));

    setAllMatchingSelected(false);
    if (allPageSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [availableImages, selectedIds]);

  const handleSelectAllMatching = useCallback(() => {
    if (!availableImages?.image_ids?.length) return;

    setAllMatchingSelected(true);

    setSelectedIds(prev => {
      const next = new Set(prev);
      availableImages.image_ids.forEach(id => next.add(String(id)));
      return next;
    });
  }, [availableImages?.image_ids]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  }, []);

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

  const pageIds = availableImages?.images.map(img => img.id) || [];
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
  const effectiveSelectedCount = allMatchingSelected ? (availableImages?.total || 0) : selectedIds.size;

  // Show "select all matching" banner when user selected full page but there are more
  const showSelectAllBanner = allPageSelected && !allMatchingSelected && (availableImages?.total || 0) > pageSize;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Images to {versionName}</DialogTitle>
          <DialogDescription>
            Select images from your project to add to this availableImagesset version.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search available images..."
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
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

          {/* Selection toolbar */}
          <div className="flex items-center justify-between py-2 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2"
                onClick={handleTogglePageAll}
                disabled={isLoading || !availableImages?.images.length}
              >
                {allPageSelected ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {allPageSelected ? 'Deselect Page' : 'Select Page'}
              </Button>

              {selectedIds.size > 0 && (
                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={handleClearSelection}>
                  Clear selection
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={effectiveSelectedCount > 0 ? 'default' : 'outline'} className="font-mono">
                {
              } selected
              </Badge>
              <span>of {availableImages?.total || 0} available</span>
            </div>
          </div>

          {/* Select all matching banner */}
          {showSelectAllBanner && (
            <div className="flex items-center justify-center gap-2 py-2 bg-primary/5 border-b border-primary/20 text-sm shrink-0">
              <span className="text-muted-foreground">
                All {pageSize} images on this page are selected.
              </span>
              <Button variant="link" size="sm" className="h-auto p-0 text-primary font-medium" onClick={handleSelectAllMatching}>
                Select all {availableImages?.total} matching images
              </Button>
            </div>
          )}

          {allMatchingSelected && (
            <div className="flex items-center justify-center gap-2 py-2 bg-primary/10 border-b border-primary/20 text-sm shrink-0">
              <span className="font-medium text-primary">
                All {availableImages?.total} matching images are selected.
              </span>
              <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground" onClick={handleClearSelection}>
                Clear selection
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading available images...</div>
          ) : availableImages?.images.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              No available images found. All project images may already be in this version.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto py-4">
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
            </div>
          )}

          {/* Pagination */}
          {availableImages && totalPages > 0 && (
            <div className="flex items-center justify-between py-3 border-t border-border shrink-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[12, 20, 40, 60, 100, 200].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>
                  {Math.min(skip -1, availableImages.total)}–{Math.min(skip + pageSize, availableImages.total)} of {availableImages.total}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(1)}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-3 text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
