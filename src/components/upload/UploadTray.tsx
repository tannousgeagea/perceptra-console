// A small card in the corner while a selection exists and you're on another
// page: what's happening to it (preparing, waiting, uploading, done) and a way back.
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ImageUp, Loader2, X } from 'lucide-react';
import { useUploadContext } from '@/contexts/UploadContext';
import { Progress } from '@/components/ui/ui/progress';
import { cn } from '@/lib/utils';

const plural = (n: number) => `${n.toLocaleString()} image${n === 1 ? '' : 's'}`;

export function UploadTray() {
  const { target, uploadedImages, isUploading, isProcessing, pendingCount, clearAllImages } = useUploadContext();
  const { pathname } = useLocation();
  const [hiddenFor, setHiddenFor] = useState<string | null>(null);

  const total = uploadedImages.length;
  if (!target || (total === 0 && !isProcessing) || pathname === target.path) return null;

  const sent = uploadedImages.filter((i) => i.status === 'success').length;
  const failed = uploadedImages.filter((i) => i.status === 'error').length;
  const finished = !isUploading && !isProcessing && sent + failed === total && sent + failed > 0;
  // Dismissing a finished batch hides it until something new happens.
  const key = `${total}-${sent}-${failed}`;
  if (finished && hiddenFor === key) return null;

  let icon = <ImageUp className="h-4 w-4 text-primary" aria-hidden />;
  let title: string;
  let progress: number | null = null;
  if (isProcessing) {
    icon = <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />;
    title = `Preparing ${plural(Math.max(pendingCount, total))}`;
    progress = pendingCount ? (total / pendingCount) * 100 : null;
  } else if (isUploading) {
    icon = <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />;
    title = `Uploading ${sent + failed} of ${plural(total)}`;
    progress = total ? ((sent + failed) / total) * 100 : 0;
  } else if (finished) {
    icon = failed
      ? <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
      : <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />;
    title = failed ? `${sent} uploaded, ${failed} failed` : `${plural(sent)} uploaded`;
  } else {
    title = `${plural(total - sent)} waiting to upload`;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-4 right-4 z-40 w-72 rounded-xl border bg-popover/95 p-3 text-popover-foreground shadow-lg backdrop-blur',
        'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2',
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-5">{title}</p>
          <p className="truncate text-xs text-muted-foreground">to {target.label}</p>
        </div>
        {finished && (
          <button
            type="button"
            onClick={() => (failed ? setHiddenFor(key) : clearAllImages())}
            className="-mr-1 -mt-1 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {progress !== null && <Progress value={progress} className="mt-2.5 h-1" />}
      <div className="mt-2 flex justify-end">
        <Link to={target.path} className="text-xs font-medium text-primary hover:underline">
          {finished && failed ? 'Review failed' : isUploading || isProcessing ? 'Open' : finished ? 'Open' : 'Open and upload'}
        </Link>
      </div>
    </aside>
  );
}
