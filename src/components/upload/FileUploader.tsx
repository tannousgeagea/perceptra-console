import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FolderUp, FileUp, X, ScanSearch, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/ui/progress';
import { Button } from '@/components/ui/ui/button';
import { useUploadContext } from '@/contexts/UploadContext';
import UploadProgress from './UploadProgress/UploadProgress';
import { useSimilarityAnalysis } from '@/hooks/useSimilarityAnalysis';
import { SimilarityReviewModal } from '@/components/similarity/SimilarityReviewModal';

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
  }
}

// ─── constants ──────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = /\.(jpg|jpeg|png|gif|webp)$/i;
const CHUNK_SIZE = 50; // files processed per animation frame

// ─── helpers ─────────────────────────────────────────────────────────────────
function filterImageFiles(files: File[]): File[] {
  // return files.filter(
  //   (f) => f.type.startsWith('image/') || ACCEPTED_TYPES.test(f.name)
  // );
  return files;
}

/**
 * Chunk a large file array and yield control back to the browser between
 * chunks so the UI never freezes. Calls onChunk with each batch and
 * onProgress with 0-100 as chunks complete.
 */
async function processInChunks(
  files: File[],
  onChunk: (chunk: File[]) => void,
  onProgress: (pct: number) => void
): Promise<void> {
  const total = files.length;
  let processed = 0;

  for (let i = 0; i < total; i += CHUNK_SIZE) {
    const chunk = files.slice(i, i + CHUNK_SIZE);
    onChunk(chunk);
    processed += chunk.length;
    onProgress(Math.round((processed / total) * 100));
    // Yield to browser between chunks
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  }
}

// ─── component ───────────────────────────────────────────────────────────────
export const FileUploader: React.FC = () => {
  const { uploadedImages, addImages, uploadProgress, isUploading, isProcessing, setIsProcessing, clearAllImages, setPendingCount } =
    useUploadContext();

  const similarity = useSimilarityAnalysis();

  const [isDragActive, setIsDragActive] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingCount, setProcessingCount] = useState({ total: 0, done: 0 });
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // All raw files staged for upload (kept in sync with uploadedImages)
  const stagedFilesRef = useRef<File[]>([]);

  // Keep stagedFilesRef in sync
  useEffect(() => {
    stagedFilesRef.current = uploadedImages.map((img) => img.file);
  }, [uploadedImages]);

  // ── Run similarity analysis whenever uploaded files change ─────────────────
  useEffect(() => {
    if (uploadedImages.length < 2) {
      similarity.reset();
      return;
    }
    similarity.analyzeFiles(uploadedImages.map((img) => img.file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedImages.length]);

  // ── Core file ingestion ────────────────────────────────────────────────────
  const ingestFiles = useCallback(
    async (raw: File[]) => {
      const imageFiles = filterImageFiles(raw);
      
      if (imageFiles.length === 0) {
        toast({
          title: 'No valid images',
          description: 'Select JPG, PNG, GIF or WEBP files.',
          variant: 'destructive',
        });
        return;
      }

      // ↓ Set these SYNCHRONOUSLY before any await so ImageGrid renders
      //   skeleton cards on the very next paint — zero perceived blank gap.
      setIsProcessing(true);
      setProcessingProgress(0);
      setProcessingCount({ total: imageFiles.length, done: 0 });
      setPendingCount(uploadedImages.length + imageFiles.length);

      const batchId = `batch-${Date.now()}`; // for potential future use in grouped uploads
      await processInChunks(
        imageFiles,
        (chunk) => {
          addImages(chunk, batchId);
          setProcessingCount((prev) => ({ ...prev, done: prev.done + chunk.length }));
        },
        setProcessingProgress
      );

      setIsProcessing(false);
      setProcessingProgress(0);
      setPendingCount(0);

      toast({
        title: `${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} added`,
        description:
          imageFiles.length > 1
            ? 'Similarity analysis running in the background.'
            : undefined,
      });
    },
    [addImages]
  );

  // ── Input handlers ─────────────────────────────────────────────────────────
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;

      if (!files || files.length === 0) return;
      ingestFiles(Array.from(files));
      event.target.value = '';
    },
    [ingestFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = () => setIsDragActive(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files?.length) {
      ingestFiles(Array.from(e.dataTransfer.files));
    }
  };

  // ── Similarity modal upload handlers ──────────────────────────────────────
  const handleUploadSelected = useCallback(() => {
    setShowReviewModal(false);
    // Filter staged files to only selected ones; UploadContext.submitUpload
    // is called by ImageGrid. Here we just close the modal so the user
    // can hit "Upload to Project" with the filtered selection.
    // For a fully wired integration, call submitUpload here with filtered ids.
  }, []);

  const handleUploadAll = useCallback(() => {
    setShowReviewModal(false);
  }, []);

  // ── Similarity banner visibility ───────────────────────────────────────────
  const hasClusters =
    similarity.status === 'done' && similarity.clusters.length > 0;
  const isAnalyzing = similarity.status === 'running';

  return (
    <div className="space-y-4">
      {/* ── Drop zone ──────────────────────────────────────────────────────── */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-10 transition-all duration-200
          ${isDragActive
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(handleFileChange)}
          accept=".png,.jpg,.jpeg,.gif,.webp"
          multiple
          className="hidden"
          disabled={isUploading}
        />
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFileChange}
          accept=".png,.jpg,.jpeg,.gif,.webp"
          multiple
          webkitdirectory=""
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-200
              ${isDragActive ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}
            `}
          >
            <Upload className="w-6 h-6" />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isDragActive ? 'Drop images here' : 'Drag & drop images'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              JPG · PNG · GIF · WEBP
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setIsProcessing(true); // 🔥 show instantly
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
            >
              <FileUp className="mr-1.5 h-3.5 w-3.5" />
              Select Files
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading}
            >
              <FolderUp className="mr-1.5 h-3.5 w-3.5" />
              Select Folder
            </Button>
          </div>
        </div>
      </div>

      {/* ── File processing progress (local, before upload) ─────────────────── */}
      {isProcessing && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing files…
            </span>
            <span>
              {processingCount.done} / {processingCount.total}
            </span>
          </div>
          <Progress value={processingProgress} className="h-1.5" />
        </div>
      )}

      {/* ── Upload progress (while uploading to server) ─────────────────────── */}
      {isUploading && (
        <div className="space-y-1.5">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Uploading… {uploadProgress}%
          </p>
        </div>
      )}

      {/* ── Similarity analysis banner ─────────────────────────────────────── */}
      {(isAnalyzing || hasClusters) && !isProcessing && (
        <div
          className={`
            flex items-center justify-between gap-3 rounded-lg px-4 py-3 border text-sm
            transition-all duration-300
            ${isAnalyzing
              ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
              : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
            }
          `}
        >
          <div className="flex items-center gap-2">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                <span>Analyzing images for duplicates…</span>
              </>
            ) : (
              <>
                <ScanSearch className="h-4 w-4 shrink-0" />
                <span>
                  <strong>{similarity.clusters.length}</strong>{' '}
                  {similarity.clusters.length === 1 ? 'group' : 'groups'} of similar
                  images detected.{' '}
                  <span className="opacity-75">Review before uploading.</span>
                </span>
              </>
            )}
          </div>

          {hasClusters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReviewModal(true)}
              className="shrink-0 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              Review
            </Button>
          )}
        </div>
      )}

      {/* ── Action row ────────────────────────────────────────────────────────── */}
      {uploadedImages.length > 0 && !isUploading && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllImages}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear all
          </Button>
        </div>
      )}

      {/* ── Per-file upload progress overlay ─────────────────────────────────── */}
      <UploadProgress files={uploadedImages} visible={isUploading} />

      {/* ── Similarity review modal ───────────────────────────────────────────── */}
      <SimilarityReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        clusters={similarity.clusters}
        threshold={similarity.threshold}
        status={similarity.status}
        selectedImageIds={similarity.selectedIds}
        stagedFiles={stagedFilesRef.current}
        onThresholdChange={(t) =>
          similarity.changeThreshold(t, stagedFilesRef.current)
        }
        onToggleImage={similarity.toggleImage}
        onSelectAllRepresentatives={similarity.selectAllRepresentatives}
        onSelectAllImages={similarity.selectAllImages}
        onUploadSelected={handleUploadSelected}
        onUploadAll={handleUploadAll}
      />
    </div>
  );
};