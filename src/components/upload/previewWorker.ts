// Runs off the page's thread: one decode per photo gives its small preview and
// the two duplicate-check hashes. Several of these run side by side.
import { aHashOf, dHashOf, HASH_SIZE, toGrey } from './imageHash';

export interface PreviewRequest { id: number; file: File; width: number }
export type PreviewReply =
  | { id: number; ok: true; blob: Blob; ahash: bigint; dhash: bigint }
  | { id: number; ok: false };

type Scope = { onmessage: ((e: MessageEvent<PreviewRequest>) => void) | null; postMessage: (m: PreviewReply) => void };
const scope = self as unknown as Scope;

function greyAt(bitmap: ImageBitmap, w: number, h: number): Uint8ClampedArray {
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return toGrey(ctx.getImageData(0, 0, w, h).data);
}

scope.onmessage = async (e) => {
  const { id, file, width } = e.data;
  try {
    const bitmap = await createImageBitmap(file, { resizeWidth: width, resizeQuality: 'medium' });
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    (canvas.getContext('2d') as OffscreenCanvasRenderingContext2D).drawImage(bitmap, 0, 0);
    const ahash = aHashOf(greyAt(bitmap, HASH_SIZE, HASH_SIZE));
    const dhash = dHashOf(greyAt(bitmap, HASH_SIZE + 1, HASH_SIZE));
    bitmap.close();
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.82 });
    scope.postMessage({ id, ok: true, blob, ahash, dhash });
  } catch {
    scope.postMessage({ id, ok: false });   // the page falls back for this file
  }
};
