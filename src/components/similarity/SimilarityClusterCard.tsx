import { useState } from 'react';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Button } from '@/components/ui/ui/button';
import { SimilarityBadge } from './SimilarityBadge';
import { ClusterActionMenu } from './ClusterActionMenu';
import { cn } from '@/lib/utils';
import type { SimilarityCluster } from '@/types/similarity';
import { ChevronDown, ChevronRight, ImageIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/ui/tooltip';

interface SimilarityClusterCardProps {
  cluster: SimilarityCluster;
  index: number;
  context: 'upload' | 'datalake';
  selectedImageIds?: Set<string>;
  clusterSelected?: boolean;
  onToggleImage?: (imageId: string) => void;
  onToggleCluster?: () => void;
  onImageClick?: (imageIndex: number) => void;
  onKeepRepresentative?: () => void;
  onKeepAll?: () => void;
  onDiscardAll?: () => void;
  onArchiveDuplicates?: () => void;
  onDeleteDuplicates?: () => void;
  onMarkReviewed?: () => void;
  onSetRepresentative?: (imageId: string) => void;
}

export function SimilarityClusterCard({
  cluster,
  index,
  context,
  selectedImageIds = new Set(),
  clusterSelected = false,
  onToggleImage,
  onToggleCluster,
  onImageClick,
  onKeepRepresentative,
  onKeepAll,
  onDiscardAll,
  onArchiveDuplicates,
  onDeleteDuplicates,
  onMarkReviewed,
  onSetRepresentative,
}: SimilarityClusterCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const avgPct = Math.round(cluster.avg_similarity * 100);
  const selectedCount = cluster.images.filter((img) => selectedImageIds.has(img.id)).length;

  return (
    <div
      className={cn(
        'rounded-lg border bg-card transition-colors',
        clusterSelected && 'ring-2 ring-primary/50',
        cluster.status === 'reviewed' && 'opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        {context === 'datalake' && onToggleCluster && (
          <Checkbox
            checked={clusterSelected}
            onCheckedChange={onToggleCluster}
            aria-label={`Select cluster ${index + 1}`}
          />
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={collapsed ? 'Expand cluster' : 'Collapse cluster'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium">Group {index + 1}</span>
          <span className="text-xs text-muted-foreground">
            {cluster.images.length} similar images · ~{avgPct}% match
          </span>
          {cluster.status === 'reviewed' && (
            <span className="text-[10px] font-medium text-success bg-success/10 rounded-full px-2 py-0.5">
              Reviewed
            </span>
          )}
        </div>

        {selectedCount > 0 && context === 'upload' && (
          <span className="text-xs text-muted-foreground">
            Keep {selectedCount} of {cluster.images.length}
          </span>
        )}

        <ClusterActionMenu
          context={context}
          onKeepRepresentative={onKeepRepresentative}
          onKeepAll={onKeepAll}
          onDiscardAll={onDiscardAll}
          onArchiveDuplicates={onArchiveDuplicates}
          onDeleteDuplicates={onDeleteDuplicates}
          onMarkReviewed={onMarkReviewed}
        />
      </div>

      {/* Image strip */}
      {!collapsed && (
        <div className="p-3 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {cluster.images.map((image, imgIdx) => {
              const isSelected = selectedImageIds.has(image.id);
              return (
                <TooltipProvider key={image.id} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'relative flex-shrink-0 rounded-md overflow-hidden cursor-pointer group transition-transform hover:scale-[1.03]',
                          'w-[180px] h-[140px]',
                          context === 'upload' && !isSelected && 'opacity-40'
                        )}
                        onClick={() => onImageClick?.(imgIdx)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${image.filename}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onImageClick?.(imgIdx);
                          }
                        }}
                      >
                        <img
                          src={image.thumbnail_url}
                          alt={image.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center hidden">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>

                        {/* Checkbox overlay */}
                        <div
                          className="absolute top-1.5 left-1.5 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleImage?.(image.id);
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            aria-label={`Select ${image.filename}`}
                            className="bg-background/80 backdrop-blur-sm"
                          />
                        </div>

                        {/* Similarity badge */}
                        <div className="absolute bottom-1.5 right-1.5 z-10">
                          <SimilarityBadge
                            score={image.similarity_score}
                            isRepresentative={image.is_representative}
                          />
                        </div>

                        {/* Dataset badges (datalake context) */}
                        {context === 'datalake' && image.datasets.length > 0 && (
                          <div className="absolute bottom-1.5 left-1.5 z-10">
                            <span className="text-[9px] font-medium bg-background/80 backdrop-blur-sm text-foreground rounded px-1.5 py-0.5">
                              {image.datasets.length === 1
                                ? image.datasets[0].name
                                : `In ${image.datasets.length} datasets`}
                            </span>
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p className="font-medium">{image.filename}</p>
                      <p className="text-muted-foreground">
                        {(image.file_size / 1024 / 1024).toFixed(2)} MB
                        {image.width > 0 && ` · ${image.width}×${image.height}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            {context === 'upload' && (
              <>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onKeepRepresentative}>
                  Keep only representative
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onKeepAll}>
                  Keep all
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={onDiscardAll}>
                  Discard all
                </Button>
              </>
            )}
            {context === 'datalake' && (
              <>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onArchiveDuplicates}>
                  Archive duplicates
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onMarkReviewed}>
                  Mark as reviewed
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={onDeleteDuplicates}>
                  Delete duplicates
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
