// Perceptual hashes from greyscale pixels (shared by the preview worker).
// Same definitions as hooks/useSimilarityAnalysis: aHash = 8×8, bit = pixel ≥ mean;
// dHash = 9×8, bit = pixel > right neighbour.

export const HASH_SIZE = 8;

/** RGBA → greyscale (ITU-R BT.601), like the similarity hook. */
export function toGrey(rgba: Uint8ClampedArray): Uint8ClampedArray {
  const grey = new Uint8ClampedArray(rgba.length / 4);
  for (let i = 0; i < grey.length; i++) {
    const b = i * 4;
    grey[i] = Math.round(0.299 * rgba[b] + 0.587 * rgba[b + 1] + 0.114 * rgba[b + 2]);
  }
  return grey;
}

export function aHashOf(grey8x8: Uint8ClampedArray): bigint {
  const mean = grey8x8.reduce((s, v) => s + v, 0) / grey8x8.length;
  let hash = 0n;
  for (let i = 0; i < grey8x8.length; i++) hash = (hash << 1n) | (grey8x8[i] >= mean ? 1n : 0n);
  return hash;
}

export function dHashOf(grey9x8: Uint8ClampedArray): bigint {
  const w = HASH_SIZE + 1;
  let hash = 0n;
  for (let row = 0; row < HASH_SIZE; row++) {
    for (let col = 0; col < HASH_SIZE; col++) {
      const i = row * w + col;
      hash = (hash << 1n) | (grey9x8[i] > grey9x8[i + 1] ? 1n : 0n);
    }
  }
  return hash;
}
