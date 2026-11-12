/**
 * The start-up splash lives in index.html (plain HTML/CSS), so it shows while
 * the JavaScript downloads, which is the real wait. It goes away as soon as
 * the first screen has rendered with no loading spinner left on it.
 *
 * PageFallback (the shared spinner) reports when it mounts and unmounts; the
 * App reports its first render. When both say "nothing is loading", the
 * splash fades out. No minimum display time.
 */

let loading = 0;
let appRendered = false;
let hidden = false;

export function hideBootSplash(): void {
  if (hidden) return;
  hidden = true;
  const el = document.getElementById('boot-splash');
  if (!el) return;
  el.classList.add('bs-hide');
  // Matches the 200 ms fade in index.html; remove it so it can't catch clicks.
  window.setTimeout(() => el.remove(), 250);
}

function hideIfIdle(): void {
  // After the current commit: a nested Suspense may mount its own spinner in the same render.
  window.setTimeout(() => {
    if (appRendered && loading === 0) hideBootSplash();
  }, 0);
}

export function loadingStarted(): void {
  loading += 1;
}

export function loadingFinished(): void {
  loading = Math.max(0, loading - 1);
  hideIfIdle();
}

export function appFirstRender(): void {
  appRendered = true;
  hideIfIdle();
}
