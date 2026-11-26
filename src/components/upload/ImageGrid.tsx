import React from 'react';
import { useUploadContext } from '@/contexts/UploadContext';
import { ImageCard } from './ImageCard';
import { Button } from '@/components/ui/ui/button';
import { Upload, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface ImageGridProps {
  tags?: string[];
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
// Same shape as ImageCard, so a card replaces it without the grid moving.
const SkeletonCard: React.FC<{ index: number }> = ({ index }) => (
  <div
    className="aspect-square rounded-lg bg-muted motion-safe:animate-pulse"
    style={{ animationDelay: `${(index % 8) * 60}ms` }}
    aria-hidden
  />
);

// Drawing thousands of placeholders costs more than it says; the rest is a count.
const MAX_SKELETONS = 48;

// ─── Component ────────────────────────────────────────────────────────────────
export const ImageGrid: React.FC<ImageGridProps> = ({ tags = [] }) => {
  const { removeImage, uploadedImages, submitUpload, isUploading, isProcessing, pendingCount } = useUploadContext();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const isInProject = Boolean(projectId);

  const imageCount = uploadedImages.length;
  // Skeleton placeholders = total selected − already-rendered cards
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

  const failed = uploadedImages.filter((img) => img.status === 'error').length;
  const uploaded = uploadedImages.filter((img) => img.status === 'success').length;
  const toSend = imageCount - uploaded;

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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">
        {uploadedImages.map((image) => (
          <div key={image.id} className="motion-safe:animate-[fadeInUp_0.25s_ease-out_both]">
            <ImageCard file={image} onRemove={removeImage} />
          </div>
        ))}

        {/* Placeholders for files whose previews are still being made */}
        {Array.from({ length: Math.min(skeletonCount, MAX_SKELETONS) }).map((_, i) => (
          <SkeletonCard key={`skel-${i}`} index={i} />
        ))}
      </div>

      {/* ── Footer row ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            {imageCount} {imageCount === 1 ? 'image' : 'images'}
            {skeletonCount > 0 && (
              <span className="text-gray-400 dark:text-gray-500">, {skeletonCount} more on the way</span>
            )}
            {uploaded > 0 && <span>, {uploaded} uploaded</span>}
            {failed > 0 && <span className="text-destructive">, {failed} failed</span>}
          </span>
        </div>

        <Button
          onClick={handleUpload}
          disabled={isUploading || isProcessing || toSend === 0}
          title={isProcessing ? 'Wait for the previews to finish' : undefined}
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
              {failed > 0 && failed === toSend
                ? `Retry ${failed} failed`
                : `Upload ${toSend} ${toSend === 1 ? 'image' : 'images'}`}
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