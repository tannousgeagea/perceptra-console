import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/ui/button';
import { ScrollArea } from '@/components/ui/ui/scroll-area';
import { SimilarityClusterCard } from './SimilarityClusterCard';
import { ImageLightbox } from './ImageLightbox';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Badge } from '@/components/ui/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/ui/alert-dialog';
import { Input } from '@/components/ui/ui/input';
import { cn } from '@/lib/utils';
import type { SimilarityCluster, ScanJob, ScanFilter, ScanSort } from '@/types/similarity';
import { X, Shield, Trash2, CheckCircle, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScanResultsPanelProps {
  open: boolean;
  onClose: () => void;
  scan: ScanJob;
  clusters: SimilarityCluster[];
  totalClusters: number;
  totalDuplicates: number;
  selectedClusterIds: Set<string>;
  reviewedClusterIds: Set<string>;
  filter: ScanFilter;
  sort: ScanSort;
  onFilterChange: (filter: ScanFilter) => void;
  onSortChange: (sort: ScanSort) => void;
  onToggleCluster: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onArchiveDuplicates: (clusterId: string) => void;
  onDeleteDuplicates: (clusterId: string) => void;
  onMarkReviewed: (clusterId: string) => void;
  onSetRepresentative: (clusterId: string, imageId: string) => void;
  onBulkAction: (action: 'archive_duplicates' | 'delete_duplicates' | 'mark_reviewed') => void;
  onRerunScan: () => void;
}

export function ScanResultsPanel({
  open,
  onClose,
  scan,
  clusters,
  totalClusters,
  totalDuplicates,
  selectedClusterIds,
  reviewedClusterIds,
  filter,
  sort,
  onFilterChange,
  onSortChange,
  onToggleCluster,
  onSelectAll,
  onClearSelection,
  onArchiveDuplicates,
  onDeleteDuplicates,
  onMarkReviewed,
  onSetRepresentative,
  onBulkAction,
  onRerunScan,
}: ScanResultsPanelProps) {
  const { toast } = useToast();
  const [lightboxCluster, setLightboxCluster] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk'; clusterId?: string; count: number } | null>(null);
  const [confirmInput, setConfirmInput] = useState('');

  const handleImageClick = useCallback((clusterId: string, imageIndex: number) => {
    setLightboxCluster(clusterId);
    setLightboxIndex(imageIndex);
  }, []);

  const handleDeleteRequest = useCallback(
    (type: 'single' | 'bulk', clusterId?: string) => {
      let count = 0;
      if (type === 'single' && clusterId) {
        const cluster = clusters.find((c) => c.id === clusterId);
        count = cluster ? cluster.images.filter((i) => !i.is_representative).length : 0;
      } else {
        clusters
          .filter((c) => selectedClusterIds.has(c.id))
          .forEach((c) => {
            count += c.images.filter((i) => !i.is_representative).length;
          });
      }
      setDeleteConfirm({ type, clusterId, count });
      setConfirmInput('');
    },
    [clusters, selectedClusterIds]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
    if (deleteConfirm.count > 50 && confirmInput !== 'delete') return;

    if (deleteConfirm.type === 'single' && deleteConfirm.clusterId) {
      onDeleteDuplicates(deleteConfirm.clusterId);
      toast({ title: 'Duplicates deleted', description: `${deleteConfirm.count} images removed.` });
    } else {
      onBulkAction('delete_duplicates');
      toast({ title: 'Bulk delete complete', description: `${deleteConfirm.count} duplicate images removed.` });
    }
    setDeleteConfirm(null);
  }, [deleteConfirm, confirmInput, onDeleteDuplicates, onBulkAction, toast]);

  const handleArchive = useCallback(
    (clusterId: string) => {
      onArchiveDuplicates(clusterId);
      toast({
        title: 'Duplicates archived',
        description: 'Non-representative images have been archived.',
      });
    },
    [onArchiveDuplicates, toast]
  );

  const filteredClusters = clusters.filter((c) => {
    if (filter === 'large') return c.images.length >= 5;
    if (filter === 'reviewed') return c.status === 'reviewed';
    if (filter === 'actioned') return false; // removed clusters are gone
    return true;
  });

  const filterCounts = {
    all: clusters.length,
    large: clusters.filter((c) => c.images.length >= 5).length,
    reviewed: clusters.filter((c) => c.status === 'reviewed').length,
    actioned: 0,
  };

  const lightboxClusterData = clusters.find((c) => c.id === lightboxCluster);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-card border-t rounded-t-xl shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{ height: '85vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-muted" />
        </div>

        {/* Header */}
        <div className="px-6 py-3 border-b space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Similarity Results</h2>
              <p className="text-xs text-muted-foreground">
                {scan.total_images.toLocaleString()} images scanned · {totalClusters} groups · {totalDuplicates} duplicates · Threshold: {Math.round(scan.progress > 0 ? (useScanThreshold(scan)) : 80)}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={onRerunScan}>
                <Settings2 className="w-3.5 h-3.5" />
                Re-run with different settings
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close results">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Filters & Sort */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(['all', 'large', 'reviewed', 'actioned'] as ScanFilter[]).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => onFilterChange(f)}
                >
                  {f === 'all' && 'All groups'}
                  {f === 'large' && 'Large groups (5+)'}
                  {f === 'reviewed' && 'Reviewed'}
                  {f === 'actioned' && 'Actioned'}
                  <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1.5 rounded-full">
                    {filterCounts[f]}
                  </Badge>
                </Button>
              ))}
            </div>

            <Select value={sort} onValueChange={(v) => onSortChange(v as ScanSort)}>
              <SelectTrigger className="w-[200px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="size_desc">Largest group first</SelectItem>
                <SelectItem value="similarity_desc">Highest similarity first</SelectItem>
                <SelectItem value="date_added">Date added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedClusterIds.size > 0 && (
          <div className="px-6 py-2 bg-primary/5 border-b flex items-center gap-3">
            <Checkbox
              checked={selectedClusterIds.size === filteredClusters.length}
              onCheckedChange={(checked) => checked ? onSelectAll() : onClearSelection()}
              aria-label="Select all clusters"
            />
            <span className="text-sm font-medium">
              {selectedClusterIds.size} {selectedClusterIds.size === 1 ? 'group' : 'groups'} selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onBulkAction('archive_duplicates')}>
                <Shield className="w-3.5 h-3.5" />
                Archive duplicates
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onBulkAction('mark_reviewed')}>
                <CheckCircle className="w-3.5 h-3.5" />
                Mark reviewed
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 text-destructive hover:text-destructive border-destructive/30"
                onClick={() => handleDeleteRequest('bulk')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete duplicates
              </Button>
            </div>
          </div>
        )}

        {/* Results grid */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-4">
            {filteredClusters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-medium">No duplicates found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  {filter !== 'all'
                    ? 'No groups match the current filter. Try selecting "All groups".'
                    : 'No duplicates found at this threshold. Try lowering it.'}
                </p>
              </div>
            ) : (
              filteredClusters.map((cluster, idx) => (
                <SimilarityClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  index={idx}
                  context="datalake"
                  clusterSelected={selectedClusterIds.has(cluster.id)}
                  onToggleCluster={() => onToggleCluster(cluster.id)}
                  onImageClick={(imgIdx) => handleImageClick(cluster.id, imgIdx)}
                  onArchiveDuplicates={() => handleArchive(cluster.id)}
                  onDeleteDuplicates={() => handleDeleteRequest('single', cluster.id)}
                  onMarkReviewed={() => {
                    onMarkReviewed(cluster.id);
                    toast({ title: 'Marked as reviewed' });
                  }}
                  onSetRepresentative={(imgId) => onSetRepresentative(cluster.id, imgId)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Lightbox */}
      {lightboxClusterData && (
        <ImageLightbox
          open={!!lightboxCluster}
          onOpenChange={(o) => !o && setLightboxCluster(null)}
          images={lightboxClusterData.images}
          currentIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onSetRepresentative={(imgId) => onSetRepresentative(lightboxClusterData.id, imgId)}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete {deleteConfirm?.count} duplicate images?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteConfirm?.count} images from your datalake. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteConfirm && deleteConfirm.count > 50 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Type <span className="font-mono font-bold text-foreground">delete</span> to confirm:
              </p>
              <Input
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="delete"
                className="font-mono"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={deleteConfirm ? deleteConfirm.count > 50 && confirmInput !== 'delete' : true}
            >
              Delete {deleteConfirm?.count} images
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper — in production, the threshold would come from the scan config
function useScanThreshold(_scan: ScanJob): number {
  return 80;
}
