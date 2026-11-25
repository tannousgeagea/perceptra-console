// Small previews for the upload grid. Showing the original files means the
// browser decodes every full-size photo at once (the grid freezes, then
// everything appears together); a 320 px JPEG per card is cheap to draw.

const THUMB_WIDTH = 320;

/** An object URL of a small preview; the original file's URL if the browser can't decode it. */
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
    // Not decodable here (or resize options unsupported): fall back to the file itself.
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

const ACCEPTED = /\.(jpe?g|png|gif|webp|bmp)$/i;

/** Keep the image files; the rest are reported back by name. */
export function splitImages(files: File[]): { images: File[]; skipped: File[] } {
  const images: File[] = [];
  const skipped: File[] = [];
  for (const f of files) {
    (f.type.startsWith('image/') || ACCEPTED.test(f.name) ? images : skipped).push(f);
  }
  return { images, skipped };
}
