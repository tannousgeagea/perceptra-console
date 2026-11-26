// One selected image: a square preview that fades in once decoded, its name and
// size on hover, a small status badge, and a progress line while it uploads.
// Memoised: adding cards to a large grid doesn't redraw the ones already there.
import React, { memo, useState } from 'react';
import { AlertCircle, Check, ImageOff, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UploadedImage, UploadOutcome } from '@/types/upload';

interface ImageCardProps {
  file: UploadedImage;
  onRemove: (id: string) => void;
}

// What the server did, when it's worth saying (a plain new image needs no label).
const OUTCOME: Record<UploadOutcome, string | null> = {
  new: null,
  added_to_project: 'From data lake',
  already_in_project: 'Already in project',
  already_in_datalake: 'Already in data lake',
};

const size = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function ImageCardBase({ file, onRemove }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  const outcome = file.outcome ? OUTCOME[file.outcome] : null;
  const ext = file.file.name.split('.').pop()?.toUpperCase() ?? '';

  return (
    <figure
      className={cn(
        'group relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-black/5 dark:ring-white/10',
        'transition-shadow duration-200 hover:shadow-md focus-within:shadow-md',
        file.status === 'error' && 'ring-2 ring-destructive/70',
      )}
    >
      {!broken ? (
        <img
          src={file.previewUrl}
          alt={file.file.name}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
          className={cn(
            'h-full w-full object-cover transition duration-500 ease-out',
            loaded ? 'opacity-100' : 'opacity-0',
            'group-hover:scale-[1.04]',
            file.status === 'uploading' && 'brightness-90',
          )}
        />
      ) : (
        // TIFF and other formats the browser can't show: still uploaded as is.
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
          <ImageOff className="h-5 w-5" aria-hidden />
          <span className="text-[11px] font-medium">{ext || 'No preview'}</span>
        </div>
      )}

      {/* Status badge */}
      {file.status !== 'pending' && (
        <span
          className={cn(
            'absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full shadow-sm',
            file.status === 'uploading' && 'bg-background/90 text-foreground',
            file.status === 'success' && 'bg-emerald-500 text-white',
            file.status === 'error' && 'bg-destructive text-destructive-foreground',
          )}
          aria-label={file.status === 'uploading' ? 'Uploading' : file.status === 'success' ? 'Uploaded' : 'Upload failed'}
        >
          {file.status === 'uploading' && <Loader2 className="h-3 w-3 animate-spin" aria-hidden />}
          {file.status === 'success' && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}
          {file.status === 'error' && <AlertCircle className="h-3 w-3" aria-hidden />}
        </span>
      )}

      {/* Remove (before upload only) */}
      {file.status === 'pending' && (
        <button
          type="button"
          onClick={() => onRemove(file.id)}
          aria-label={`Remove ${file.file.name}`}
          className={cn(
            'absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm',
            'opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-destructive',
          )}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}

      {/* Name and size on hover; a failure's reason or the server's note stays visible */}
      <figcaption
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-2 pb-1.5 pt-6 text-white',
          'transition-opacity duration-150',
          file.status === 'error' || outcome ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        {file.status === 'error' && file.error ? (
          <p className="line-clamp-2 text-[11px] font-medium leading-tight">{file.error}</p>
        ) : (
          <>
            {outcome && <p className="mb-0.5 text-[11px] font-semibold text-white">{outcome}</p>}
            <p className="truncate text-[11px] font-medium leading-tight" title={file.file.name}>{file.file.name}</p>
            <p className="text-[10px] text-white/75 tabular-nums">{size(file.file.size)}</p>
          </>
        )}
      </figcaption>

      {/* Upload progress along the bottom edge */}
      {file.status === 'uploading' && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/30" aria-hidden>
          <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${file.progress}%` }} />
        </div>
      )}
    </figure>
  );
}

export const ImageCard = memo(ImageCardBase);
