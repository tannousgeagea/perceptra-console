import { useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/ui/dialog';
import { Button } from '@/components/ui/ui/button';
import { SimilarityBadge } from './SimilarityBadge';
import { cn } from '@/lib/utils';
import type { SimilarityImage } from '@/types/similarity';
import { ChevronLeft, ChevronRight, Star, X } from 'lucide-react';

interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: SimilarityImage[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onSetRepresentative?: (imageId: string) => void;
}

export function ImageLightbox({
  open,
  onOpenChange,
  images,
  currentIndex,
  onIndexChange,
  onSetRepresentative,
}: ImageLightboxProps) {
  const image = images[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) onIndexChange(currentIndex + 1);
  }, [currentIndex, images.length, onIndexChange]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onIndexChange(currentIndex - 1);
  }, [currentIndex, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, goNext, goPrev, onOpenChange]);

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-md">
        <div className="flex h-[90vh]">
          {/* Main image area */}
          <div className="relative flex-1 flex items-center justify-center min-w-0 bg-muted/30">
            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-10 bg-background/50 backdrop-blur-sm"
              onClick={() => onOpenChange(false)}
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Nav arrows */}
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-background/50 backdrop-blur-sm"
                onClick={goPrev}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}
            {currentIndex < images.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-background/50 backdrop-blur-sm"
                onClick={goNext}
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}

            <img
              src={image.url}
              alt={image.filename}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Metadata sidebar */}
          <div className="w-72 border-l bg-card flex flex-col overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <h3 className="font-medium text-sm truncate">{image.filename}</h3>
                <SimilarityBadge
                  score={image.similarity_score}
                  isRepresentative={image.is_representative}
                />
              </div>

              <div className="space-y-2 text-xs">
                <MetaRow label="Dimensions" value={image.width > 0 ? `${image.width} × ${image.height}` : '—'} />
                <MetaRow label="File size" value={`${(image.file_size / 1024 / 1024).toFixed(2)} MB`} />
                <MetaRow label="Uploaded" value={new Date(image.upload_date).toLocaleDateString()} />
                {image.uploader && <MetaRow label="Uploader" value={image.uploader} />}
                <MetaRow label="Similarity" value={`${Math.round(image.similarity_score * 100)}%`} />
                {image.hash && <MetaRow label="Hash" value={image.hash} />}
              </div>

              {image.datasets.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Datasets</p>
                  <div className="flex flex-wrap gap-1">
                    {image.datasets.map((d) => (
                      <span
                        key={d.id}
                        className="text-[10px] rounded-full bg-secondary px-2 py-0.5 font-medium"
                      >
                        {d.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {onSetRepresentative && !image.is_representative && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs"
                  onClick={() => onSetRepresentative(image.id)}
                >
                  <Star className="w-3.5 h-3.5" />
                  Set as representative
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground truncate ml-2 max-w-[140px]">{value}</span>
    </div>
  );
}
