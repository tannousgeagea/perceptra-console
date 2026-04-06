import React, { useMemo } from 'react';
import { useUploadContext } from '@/contexts/UploadContext';
import { ImageCard } from './ImageCard';
import { Button } from '@/components/ui/ui/button';
import { Upload, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ImageGridProps {
  tags?: string[];
  /** Total number of images that will eventually be rendered (including those still processing) */
  pendingCount?: number;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard: React.FC<{ index: number }> = ({ index }) => (
  <div
    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    style={{ animationDelay: `${(index % 10) * 40}ms` }}
  >
    <div className="aspect-square bg-gray-100 dark:bg-gray-700 animate-pulse" />
    <div className="p-3 space-y-2">
      <div className="h-2.5 w-3/4 rounded bg-gray-200 dark:bg-gray-600 animate-pulse" />
      <div className="h-2 w-1/2 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
export const ImageGrid: React.FC<ImageGridProps> = ({ tags = [], pendingCount = 0 }) => {
  const { removeImage, uploadedImages, submitUpload, isUploading } = useUploadContext();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const isInProject = Boolean(projectId);

  const imageCount = uploadedImages.length;
  // Number of skeleton placeholders to show (files still being processed)
  const skeletonCount = Math.max(0, pendingCount - imageCount);

  const handleUpload = async () => {
    if (imageCount === 0) return;
    await submitUpload(navigate, {
      projectId: projectId || undefined,
      source_of_origin: 'upload',
      tags,
      redirect: isInProject,
    });
  };

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (imageCount === 0 && skeletonCount === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
        <Upload className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">No images selected</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Drag & drop or select files above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Grid ──────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {uploadedImages.map((image, i) => (
          <div
            key={image.id}
            className={cn(
              'transition-all duration-300',
              image.status === 'success' && 'ring-2 ring-green-400/60 rounded-lg'
            )}
            style={{
              animation: 'fadeInUp 0.2s ease both',
              animationDelay: `${Math.min(i, 20) * 20}ms`,
            }}
          >
            <ImageCard key={image.id} file={image} onRemove={removeImage} />
          </div>
        ))}

        {/* Skeleton placeholders for files still being processed */}
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={`skel-${i}`} index={i} />
        ))}
      </div>

      {/* ── Footer row ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {imageCount} {imageCount === 1 ? 'image' : 'images'}
            {skeletonCount > 0 && (
              <span className="text-gray-400 dark:text-gray-500">
                {' '}· processing {skeletonCount} more…
              </span>
            )}
          </span>
        </div>

        <Button
          onClick={handleUpload}
          disabled={isUploading || imageCount === 0}
          size="sm"
          className="relative overflow-hidden"
        >
          {isUploading ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload to Project
            </>
          )}
        </Button>
      </div>

      {/* ── Large-batch warning ────────────────────────────────────────────────── */}
      {imageCount > 100 && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            You've selected <strong>{imageCount}</strong> images. Consider reviewing your
            selection to remove duplicates or irrelevant files before uploading.
          </p>
        </div>
      )}

      {/* ── Keyframe ─────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};