import { useCallback, useRef } from 'react';
import { useSimilarityStore } from '@/stores/similarityStore';
import type { SimilarityCluster, SimilarityImage } from '@/types/similarity';

/**
 * Client-side similarity analysis for the Upload surface.
 * In production, replace the mock clustering with a WASM perceptual hasher
 * or a lightweight API call that accepts pre-computed hashes.
 */
export function useSimilarityAnalysis() {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
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

  const analyzeFiles = useCallback(
    (files: File[]) => {
      if (files.length < 2) {
        setUploadClusters([]);
        setUploadAnalysisStatus('done');
        return;
      }

      setUploadAnalysisStatus('running');

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        // --- Mock clustering logic ---
        // In production: hash each file (WASM), group by hamming distance < threshold
        const clusters: SimilarityCluster[] = [];
        const used = new Set<number>();

        for (let i = 0; i < files.length; i++) {
          if (used.has(i)) continue;

          const groupIndices = [i];
          for (let j = i + 1; j < files.length; j++) {
            if (used.has(j)) continue;
            // Mock: cluster files with similar sizes (within 20%)
            const ratio = files[i].size / files[j].size;
            if (ratio > 0.8 && ratio < 1.2) {
              groupIndices.push(j);
              used.add(j);
            }
          }

          if (groupIndices.length > 1) {
            used.add(i);
            const images: SimilarityImage[] = groupIndices.map((idx, pos) => ({
              id: `upload-${idx}-${files[idx].name}`,
              filename: files[idx].name,
              url: URL.createObjectURL(files[idx]),
              thumbnail_url: URL.createObjectURL(files[idx]),
              width: 0,
              height: 0,
              file_size: files[idx].size,
              upload_date: new Date().toISOString(),
              similarity_score: pos === 0 ? 1.0 : 0.75 + Math.random() * 0.2,
              is_representative: pos === 0,
              datasets: [],
            }));

            clusters.push({
              id: `cluster-${i}`,
              images,
              avg_similarity: images.reduce((s, img) => s + img.similarity_score, 0) / images.length,
              status: 'unreviewed',
            });
          }
        }

        setUploadClusters(clusters);
        setUploadAnalysisStatus(clusters.length > 0 ? 'done' : 'done');

        // Auto-select representatives
        const repIds = new Set<string>();
        clusters.forEach((c) => {
          const rep = c.images.find((img) => img.is_representative);
          if (rep) repIds.add(rep.id);
        });
        // Also select all images NOT in any cluster (unique images)
        // For now, just select representatives
        clusters.forEach((c) => {
          c.images.forEach((img) => {
            if (img.is_representative) {
              useSimilarityStore.getState().setUploadImageSelected(img.id, true);
            }
          });
        });
      }, 400);
    },
    [setUploadClusters, setUploadAnalysisStatus, setUploadImageSelected]
  );

  const changeThreshold = useCallback(
    (threshold: number, files: File[]) => {
      setUploadThreshold(threshold);
      analyzeFiles(files);
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
