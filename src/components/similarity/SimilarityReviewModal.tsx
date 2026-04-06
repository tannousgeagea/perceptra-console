import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/ui/dialog';
import { Button } from '@/components/ui/ui/button';
import { SimilarityThresholdSelector } from './SimilarityThresholdSelector';
import { SimilarityClusterCard } from './SimilarityClusterCard';
import { ImageLightbox } from './ImageLightbox';
import { ScrollArea } from '@/components/ui/ui/scroll-area';
import type { SimilarityCluster } from '@/types/similarity';
import { Sparkles, Upload, ImageIcon } from 'lucide-react';

interface SimilarityReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clusters: SimilarityCluster[];
  threshold: number;
  status: 'idle' | 'running' | 'done' | 'error';
  selectedImageIds: Set<string>;
  stagedFiles: File[];
  onThresholdChange: (threshold: number) => void;
  onToggleImage: (imageId: string) => void;
  onSelectAllRepresentatives: () => void;
  onSelectAllImages: () => void;
  onUploadSelected: () => void;
  onUploadAll: () => void;
}

export function SimilarityReviewModal({
  open,
  onOpenChange,
  clusters,
  threshold,
  status,
  selectedImageIds,
  stagedFiles,
  onThresholdChange,
  onToggleImage,
  onSelectAllRepresentatives,
  onSelectAllImages,
  onUploadSelected,
  onUploadAll,
}: SimilarityReviewModalProps) {
  const [lightboxCluster, setLightboxCluster] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const totalImages = clusters.reduce((s, c) => s + c.images.length, 0);
  const totalDuplicates = totalImages - clusters.length;

  const handleImageClick = useCallback((clusterId: string, imageIndex: number) => {
    setLightboxCluster(clusterId);
    setLightboxIndex(imageIndex);
  }, []);

  const handleKeepRepresentative = useCallback(
    (cluster: SimilarityCluster) => {
      cluster.images.forEach((img) => {
        const shouldSelect = img.is_representative;
        if (shouldSelect !== selectedImageIds.has(img.id)) {
          onToggleImage(img.id);
        }
      });
    },
    [selectedImageIds, onToggleImage]
  );

  const handleKeepAll = useCallback(
    (cluster: SimilarityCluster) => {
      cluster.images.forEach((img) => {
        if (!selectedImageIds.has(img.id)) onToggleImage(img.id);
      });
    },
    [selectedImageIds, onToggleImage]
  );

  const handleDiscardAll = useCallback(
    (cluster: SimilarityCluster) => {
      cluster.images.forEach((img) => {
        if (selectedImageIds.has(img.id)) onToggleImage(img.id);
      });
    },
    [selectedImageIds, onToggleImage]
  );

  const lightboxClusterData = clusters.find((c) => c.id === lightboxCluster);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] flex flex-col p-0 gap-0">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Review Similar Images
              </DialogTitle>
              <DialogDescription>
                {clusters.length} {clusters.length === 1 ? 'group' : 'groups'} · {totalImages} images · {totalDuplicates} potential duplicates
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between gap-4">
              <SimilarityThresholdSelector
                value={threshold}
                onChange={(t) => onThresholdChange(t)}
                status={status}
                clustersFound={clusters.length}
                compact
                className="flex-1"
              />

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={onSelectAllRepresentatives}>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Select All Unique
                </Button>
              </div>
            </div>
          </div>

          {/* Cluster Grid */}
          <div className="flex-1 min-h-0 overflow-scroll">
            <div className="p-6 space-y-4">
              {clusters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium">All images are unique</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No similar images were found at the current threshold.
                  </p>
                </div>
              ) : (
                clusters.map((cluster, idx) => (
                  <SimilarityClusterCard
                    key={cluster.id}
                    cluster={cluster}
                    index={idx}
                    context="upload"
                    selectedImageIds={selectedImageIds}
                    onToggleImage={onToggleImage}
                    onImageClick={(imgIdx) => handleImageClick(cluster.id, imgIdx)}
                    onKeepRepresentative={() => handleKeepRepresentative(cluster)}
                    onKeepAll={() => handleKeepAll(cluster)}
                    onDiscardAll={() => handleDiscardAll(cluster)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onUploadAll}>
                Upload All ({stagedFiles.length})
              </Button>
              <Button onClick={onUploadSelected}>
                <Upload className="w-4 h-4 mr-1.5" />
                Upload Selected ({selectedImageIds.size})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxClusterData && (
        <ImageLightbox
          open={!!lightboxCluster}
          onOpenChange={(open) => !open && setLightboxCluster(null)}
          images={lightboxClusterData.images}
          currentIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  );
}
