/**
 * useSimilarityAnalysis — production perceptual hashing for the Upload surface.
 *
 * Hash strategy:
 *   • aHash (average hash, 8×8 = 64 bits): fast, catches exact/near-exact duplicates.
 *   • dHash (difference hash, 8×8 → 64 bits): catches crops, slight rotations, flips.
 *   Both hashes are computed from a canvas downsample of each image.
 *
 * Similarity score derivation:
 *   hamming distance d ∈ [0, 64]
 *   score = 1 − (d / 64)
 *   threshold slider (0.7–1.0) maps directly: images are "similar" when score ≥ threshold.
 *
 * Performance budget:
 *   ~2–5 ms per image (canvas draw + pixel read), runs in a single rAF-yielding loop
 *   so it never blocks paint. For > 500 images, hash computation is streamed in chunks.
 */

import { useCallback, useRef } from 'react';
import { useSimilarityStore } from '@/stores/similarityStore';
import type { SimilarityCluster, SimilarityImage } from '@/types/similarity';

// ─── constants ────────────────────────────────────────────────────────────────
const HASH_SIZE = 8;          // 8×8 grid → 64-bit hash
const HASH_CHUNK = 30;        // images hashed per animation frame
const CLUSTER_CHUNK = 200;    // images compared per rAF during O(n²) clustering

// ─── canvas hash primitives ───────────────────────────────────────────────────

/**
 * Draw a File's image into an offscreen canvas and return its greyscale
 * pixel array at the requested dimensions.
 */
function loadGreyscalePixels(
  file: File,
  width: number,
  height: number
): Promise<Uint8ClampedArray> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, width, height);
        const { data } = ctx.getImageData(0, 0, width, height);

        // Convert RGBA → greyscale (ITU-R BT.601)
        const grey = new Uint8ClampedArray(width * height);
        for (let i = 0; i < grey.length; i++) {
          const base = i * 4;
          grey[i] = Math.round(
            0.299 * data[base] + 0.587 * data[base + 1] + 0.114 * data[base + 2]
          );
        }
        resolve(grey);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * aHash (average hash).
 * 1. Downsample to HASH_SIZE × HASH_SIZE greyscale.
 * 2. Compute mean.
 * 3. Each bit = pixel > mean.
 */
async function aHash(file: File): Promise<bigint> {
  const pixels = await loadGreyscalePixels(file, HASH_SIZE, HASH_SIZE);
  const mean = pixels.reduce((s, v) => s + v, 0) / pixels.length;
  let hash = 0n;
  for (let i = 0; i < pixels.length; i++) {
    hash = (hash << 1n) | (pixels[i] >= mean ? 1n : 0n);
  }
  return hash;
}

/**
 * dHash (difference hash).
 * 1. Downsample to (HASH_SIZE+1) × HASH_SIZE greyscale.
 * 2. Each bit = pixel[x] > pixel[x+1] per row (horizontal gradient).
 */
async function dHash(file: File): Promise<bigint> {
  const w = HASH_SIZE + 1;
  const h = HASH_SIZE;
  const pixels = await loadGreyscalePixels(file, w, h);
  let hash = 0n;
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < HASH_SIZE; col++) {
      const idx = row * w + col;
      hash = (hash << 1n) | (pixels[idx] > pixels[idx + 1] ? 1n : 0n);
    }
  }
  return hash;
}

/** Hamming distance between two 64-bit hashes. */
function hammingDistance(a: bigint, b: bigint): number {
  let xor = a ^ b;
  let count = 0;
  while (xor) {
    count += Number(xor & 1n);
    xor >>= 1n;
  }
  return count;
}

/**
 * Combined similarity score [0, 1] using the minimum hamming distance
 * across aHash and dHash. Using the min means two images only need to
 * be close on ONE metric to be flagged — better recall at the cost of
 * marginal false-positive rate, which the user can tune via the threshold.
 */
function combinedSimilarity(
  a: { ahash: bigint; dhash: bigint },
  b: { ahash: bigint; dhash: bigint }
): number {
  const da = hammingDistance(a.ahash, b.ahash);
  const dd = hammingDistance(a.dhash, b.dhash);
  const minD = Math.min(da, dd);
  return 1 - minD / 64;
}

// ─── types ────────────────────────────────────────────────────────────────────
interface HashedFile {
  index: number;
  file: File;
  ahash: bigint;
  dhash: bigint;
  objectUrl: string; // stable URL created once, reused for the cluster card
}

// ─── yield helper ─────────────────────────────────────────────────────────────
const yieldFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

// ─── hook ─────────────────────────────────────────────────────────────────────
export function useSimilarityAnalysis() {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<boolean>(false); // signals in-flight analysis to stop

  const {
    uploadThreshold,
    uploadAnalysisStatus,
    uploadClusters,
    selectedUploadImageIds,
    setUploadClusters,
    setUploadThreshold,
    setUploadAnalysisStatus,
    toggleUploadImage,
    setUploadImageSelected,
    selectAllRepresentatives,
    selectAllUploadImages,
    resetUpload,
  } = useSimilarityStore();

  // ── core analysis ────────────────────────────────────────────────────────────
  const analyzeFiles = useCallback(
    (files: File[], threshold?: number) => {
      if (files.length < 2) {
        setUploadClusters([]);
        setUploadAnalysisStatus('done');
        return;
      }

      // Cancel any in-flight analysis
      abortRef.current = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);

      setUploadAnalysisStatus('running');

      debounceRef.current = setTimeout(async () => {
        abortRef.current = false;
        const activeThreshold = threshold ?? uploadThreshold;

        // ── Phase 1: hash all files in rAF-yielding chunks ──────────────────
        const hashed: HashedFile[] = [];

        for (let i = 0; i < files.length; i += HASH_CHUNK) {
          if (abortRef.current) return;

          const chunk = files.slice(i, i + HASH_CHUNK);

          const results = await Promise.allSettled(
            chunk.map(async (file, offset) => {
              const [a, d] = await Promise.all([aHash(file), dHash(file)]);
              return {
                index: i + offset,
                file,
                ahash: a,
                dhash: d,
                // We create ONE object URL per file here and reuse it in the
                // cluster card — avoids double-URL leaks vs. the previous mock.
                objectUrl: URL.createObjectURL(file),
              } satisfies HashedFile;
            })
          );

          for (const r of results) {
            if (r.status === 'fulfilled') hashed.push(r.value);
            // Silently skip corrupted files — they won't appear in any cluster.
          }

          await yieldFrame();
        }

        if (abortRef.current) return;

        // ── Phase 2: O(n²) clustering with rAF yields every CLUSTER_CHUNK rows ─
        //    Union-Find would scale better for n > 5000, but for typical upload
        //    batches (≤ 2000 images) the flat loop is simpler and fast enough.
        const clusters: SimilarityCluster[] = [];
        const assigned = new Set<number>(); // indices into `hashed`

        for (let i = 0; i < hashed.length; i++) {
          if (assigned.has(i)) continue;
          if (i % CLUSTER_CHUNK === 0) {
            if (abortRef.current) return;
            await yieldFrame();
          }

          const group: { hf: HashedFile; score: number }[] = [
            { hf: hashed[i], score: 1.0 },
          ];

          for (let j = i + 1; j < hashed.length; j++) {
            if (assigned.has(j)) continue;
            const score = combinedSimilarity(hashed[i], hashed[j]);
            if (score >= activeThreshold) {
              group.push({ hf: hashed[j], score });
              assigned.add(j);
            }
          }

          if (group.length > 1) {
            assigned.add(i);

            // Sort descending by score so the "representative" (index 0 after sort)
            // is the image most similar to itself (always score 1.0 = the reference).
            // Keep the reference first, then sort the rest by score desc.
            const [rep, ...rest] = group;
            rest.sort((a, b) => b.score - a.score);
            const ordered = [rep, ...rest];

            const images: SimilarityImage[] = ordered.map(({ hf, score }, pos) => ({
              id: `upload-${hf.index}-${hf.file.name}`,
              filename: hf.file.name,
              url: hf.objectUrl,
              thumbnail_url: hf.objectUrl,
              width: 0,
              height: 0,
              file_size: hf.file.size,
              upload_date: new Date().toISOString(),
              similarity_score: score,
              is_representative: pos === 0,
              datasets: [],
            }));

            clusters.push({
              id: `cluster-${hashed[i].index}`,
              images,
              avg_similarity:
                images.reduce((s, img) => s + img.similarity_score, 0) / images.length,
              status: 'unreviewed',
            });
          }
        }

        if (abortRef.current) return;

        setUploadClusters(clusters);
        setUploadAnalysisStatus('done');

        // Auto-select representatives so the user starts with a clean default.
        clusters.forEach((c) => {
          c.images.forEach((img) => {
            useSimilarityStore.getState().setUploadImageSelected(img.id, img.is_representative);
          });
        });
      }, 400);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setUploadClusters, setUploadAnalysisStatus, setUploadImageSelected, uploadThreshold]
  );

  // ── threshold change — re-run analysis immediately ───────────────────────────
  const changeThreshold = useCallback(
    (threshold: number, files: File[]) => {
      setUploadThreshold(threshold);
      analyzeFiles(files, threshold);
    },
    [setUploadThreshold, analyzeFiles]
  );

  return {
    clusters: uploadClusters,
    threshold: uploadThreshold,
    status: uploadAnalysisStatus,
    selectedIds: selectedUploadImageIds,
    analyzeFiles,
    changeThreshold,
    toggleImage: toggleUploadImage,
    setImageSelected: setUploadImageSelected,
    selectAllRepresentatives,
    selectAllImages: selectAllUploadImages,
    reset: resetUpload,
  };
}