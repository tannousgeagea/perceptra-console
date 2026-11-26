// Small previews for the upload grid, made by a few background workers (one
// decode per photo gives the preview and its duplicate-check hashes). Showing
// the original files would make the browser decode every full-size photo on
// the page's thread; this keeps the page responsive while the grid fills in.
import type { PreviewReply, PreviewRequest } from './previewWorker';

const THUMB_WIDTH = 320;

export interface PreviewInfo {
  url: string;
  /** Perceptual hashes (undefined when made by the fallback path). */
  ahash?: bigint;
  dhash?: bigint;
}

/** Per file: its preview URL and hashes. The similarity check reads the hashes from here. */
export const previewInfo = new WeakMap<File, PreviewInfo>();

/** An object URL of a small preview on the page's thread; the file itself if it can't be decoded. */
export async function makeThumbnail(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file, { resizeWidth: THUMB_WIDTH, resizeQuality: 'medium' });
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    if (blob) return URL.createObjectURL(blob);
  } catch {
    // Not decodable here (TIFF in most browsers): fall back to the file itself.
  }
  return URL.createObjectURL(file);
}

/** Run `work` over `items`, at most `limit` at a time, in order of start. */
export async function runPool<T>(items: T[], limit: number, work: (item: T, index: number) => Promise<void>): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      await work(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

const workerCount = () => Math.max(2, Math.min(6, (navigator.hardwareConcurrency || 4) - 2));

function spawn(): Worker | null {
  try {
    return new Worker(new URL('./previewWorker.ts', import.meta.url), { type: 'module' });
  } catch {
    return null;
  }
}

/**
 * Make a preview for every file; `onReady(i)` fires as each one is done (any order).
 * Workers when the browser has them, else the page's thread (4 at a time).
 */
export async function makePreviews(files: File[], onReady: (index: number, info: PreviewInfo) => void): Promise<void> {
  type Reply = PreviewReply | { id: number; ok: false; crashed: true };
  const ask = (w: Worker, req: PreviewRequest) => new Promise<Reply>((resolve) => {
    const finish = (reply: Reply) => {
      w.removeEventListener('message', done);
      w.removeEventListener('error', failed);
      resolve(reply);
    };
    const done = (e: MessageEvent<PreviewReply>) => finish(e.data);
    // A worker that can't start (or crashes) answers nothing: use the fallback for this file.
    const failed = (e: Event) => { e.preventDefault(); finish({ id: req.id, ok: false, crashed: true }); };
    w.addEventListener('message', done);
    w.addEventListener('error', failed);
    w.postMessage(req);
  });
  const fallback = async (file: File, i: number) => {
    const info = { url: await makeThumbnail(file) };
    previewInfo.set(file, info);
    onReady(i, info);
  };

  const workers = files.length > 0 ? Array.from({ length: workerCount() }, spawn).filter((w): w is Worker => w !== null) : [];
  if (workers.length === 0) {
    await runPool(files, 4, fallback);
    return;
  }
  let next = 0;
  try {
    await Promise.all(workers.map(async (w) => {
      let alive = true;
      while (next < files.length) {
        const i = next++;
        const reply: Reply | null = alive ? await ask(w, { id: i, file: files[i], width: THUMB_WIDTH }) : null;
        if (reply && 'crashed' in reply) alive = false;   // its remaining files go the fallback way
        if (reply?.ok) {
          const info = { url: URL.createObjectURL(reply.blob), ahash: reply.ahash, dhash: reply.dhash };
          previewInfo.set(files[i], info);
          onReady(i, info);
        } else {
          await fallback(files[i], i);
        }
      }
    }));
  } finally {
    workers.forEach((w) => w.terminate());
  }
}

// What the server takes (GIF is refused there; TIFF is taken but browsers can't preview it).
const ACCEPTED = /\.(jpe?g|png|webp|bmp|tiff?)$/i;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff']);

/** Keep the files the server accepts; the rest are reported back by name. */
export function splitImages(files: File[]): { images: File[]; skipped: File[] } {
  const images: File[] = [];
  const skipped: File[] = [];
  for (const f of files) {
    (ACCEPTED_TYPES.has(f.type) || ACCEPTED.test(f.name) ? images : skipped).push(f);
  }
  return { images, skipped };
}
