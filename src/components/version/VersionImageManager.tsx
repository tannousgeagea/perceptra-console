import { useState } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Card } from '@/components/ui/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import { Search, Plus, Trash2, Grid3X3, Table as TableIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AddImagesToVersionDialog } from './AddImagesToVersionDialog';
import { useVersionImages } from '@/hooks/useDatasetVersions';
import { useRemoveImagesFromVersion } from '@/hooks/useDatasetVersions';
import { toast } from 'sonner';
import { useSearchParser } from '@/hooks/useSearchParser';
import { buildImageQuery } from '@/hooks/useImages';
import { getModeBadge } from '@/utils/split';

interface VersionImagesManagerProps {
  versionId: string;
  projectId: string;
  versionName: string;
}

export function VersionImagesManager({ versionId, projectId, versionName }: VersionImagesManagerProps) {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [removeImageId, setRemoveImageId] = useState<string | null>(null);

  const parsedQuery = useSearchParser(searchText);
  const _query = buildImageQuery(parsedQuery)
  const { data, isLoading } = useVersionImages(projectId, versionId, {
    q: _query
  });
  const { mutateAsync: removeImages, isPending: isRemoving } = useRemoveImagesFromVersion(projectId, versionId);

  const handleRemove = async () => {
    if (!removeImageId) return;
    
    try {
      await removeImages([Number(removeImageId)]);
      toast("Image has been removed from the version.");
      setRemoveImageId(null);
    } catch (error) {
      toast(`Failed to remove image. ${error}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'table')}>
            <TabsList>
              <TabsTrigger value="grid" className="gap-2">
                <Grid3X3 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2">
                <TableIcon className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Images
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading images...</div>
      ) : data?.images.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No images in this version yet.</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Images
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.images.map((image) => (
            <Card key={image.id} className="p-4 hover:shadow-lg transition-all">
              <div className="aspect-video relative mb-3 rounded-lg overflow-hidden bg-accent/50">
                <img
                  src={image.download_url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold truncate flex-1">{image.name}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setRemoveImageId(image.project_image_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  {getModeBadge(image.split)}
                  <span className="text-xs text-muted-foreground">
                    {image.annotation_count} annotations
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Added {formatDistanceToNow(new Date(image.added_at), { addSuffix: true })}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Thumbnail</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Split</TableHead>
                <TableHead>Annotations</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.images.map((image) => (
                <TableRow key={image.id}>
                  <TableCell>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent/50">
                      <img
                        src={image.download_url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{image.name}</TableCell>
                  <TableCell>
                    {getModeBadge(image.split)}
                  </TableCell>
                  <TableCell>{image.annotation_count}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(image.added_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setRemoveImageId(image.project_image_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddImagesToVersionDialog
        projectId={projectId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        versionId={versionId}
        versionName={versionName}
      />

      <AlertDialog open={!!removeImageId} onOpenChange={() => setRemoveImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Image from Version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the image from this dataset version. The image will still exist in your project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={isRemoving}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
