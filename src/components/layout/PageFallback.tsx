import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { loadingFinished, loadingStarted } from '@/lib/bootSplash';

/**
 * Shown while a page's code or the session is loading. Full screen at app
 * start; inside layouts it fills only the content area, so the sidebar and
 * header stay put while the next page loads.
 */
export const PageFallback = ({ fullScreen = false }: { fullScreen?: boolean }) => {
  // While any of these is on screen, the start-up splash stays up (lib/bootSplash).
  useEffect(() => {
    loadingStarted();
    return loadingFinished;
  }, []);

  return (
  <div
    role="status"
    className={cn(
      'flex w-full items-center justify-center bg-background',
      fullScreen ? 'min-h-screen' : 'min-h-[50vh]'
    )}
  >
    <span
      aria-hidden
      className="h-7 w-7 rounded-full border-[3px] border-[var(--mtx-primary)]/20 border-t-[var(--mtx-primary)] motion-safe:animate-spin"
    />
    <span className="sr-only">Loading</span>
  </div>
  );
};
