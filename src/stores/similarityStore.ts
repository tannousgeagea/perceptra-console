import { create } from 'zustand';
import type { SimilarityCluster, ScanJob, ScanConfig, ScanFilters, ScanFilter, ScanSort } from '@/types/similarity';

interface LightboxState {
  open: boolean;
  clusterId: string;
  imageIndex: number;
}

interface SimilarityState {
  // Upload surface
  uploadClusters: SimilarityCluster[];
  uploadThreshold: number;
  uploadAnalysisStatus: 'idle' | 'running' | 'done' | 'error';
  selectedUploadImageIds: Set<string>;

  // Datalake surface
  scanDrawerOpen: boolean;
  scanConfig: ScanConfig;
  activeScan: ScanJob | null;
  scanResults: SimilarityCluster[];
  scanTotalClusters: number;
  scanTotalDuplicates: number;
  scanTotalPages: number;
  scanFilters: ScanFilters;
  reviewedClusterIds: Set<string>;
  selectedClusterIds: Set<string>;
  resultsOpen: boolean;

  // Shared
  lightbox: LightboxState;

  // Upload actions
  setUploadClusters: (clusters: SimilarityCluster[]) => void;
  setUploadThreshold: (t: number) => void;
  setUploadAnalysisStatus: (s: 'idle' | 'running' | 'done' | 'error') => void;
  toggleUploadImage: (id: string) => void;
  setUploadImageSelected: (id: string, selected: boolean) => void;
  selectAllRepresentatives: () => void;
  selectAllUploadImages: () => void;
  getSelectedUploadCount: () => number;

  // Datalake actions
  setScanDrawerOpen: (open: boolean) => void;
  setScanConfig: (config: Partial<ScanConfig>) => void;
  setActiveScan: (scan: ScanJob | null) => void;
  setScanResults: (clusters: SimilarityCluster[], total: number, dupes: number, pages: number) => void;
  setScanFilter: (filter: ScanFilter) => void;
  setScanSort: (sort: ScanSort) => void;
  setScanPage: (page: number) => void;
  toggleClusterSelection: (id: string) => void;
  selectAllClusters: () => void;
  clearClusterSelection: () => void;
  removeCluster: (id: string) => void;
  markClusterReviewed: (id: string) => void;
  setRepresentative: (clusterId: string, imageId: string) => void;
  setResultsOpen: (open: boolean) => void;

  // Shared actions
  openLightbox: (clusterId: string, imageIndex: number) => void;
  closeLightbox: () => void;
  resetUpload: () => void;
  resetScan: () => void;
}

export const useSimilarityStore = create<SimilarityState>((set, get) => ({
  // Upload state
  uploadClusters: [],
  uploadThreshold: 0.8,
  uploadAnalysisStatus: 'idle',
  selectedUploadImageIds: new Set<string>(),

  // Datalake state
  scanDrawerOpen: false,
  scanConfig: { scope: 'datalake', threshold: 0.8, algorithm: 'ahash' },
  activeScan: null,
  scanResults: [],
  scanTotalClusters: 0,
  scanTotalDuplicates: 0,
  scanTotalPages: 0,
  scanFilters: { filter: 'all', sort: 'size_desc', page: 1, per_page: 20 },
  reviewedClusterIds: new Set<string>(),
  selectedClusterIds: new Set<string>(),
  resultsOpen: false,

  // Shared
  lightbox: { open: false, clusterId: '', imageIndex: 0 },

  // Upload actions
  setUploadClusters: (clusters) => set({ uploadClusters: clusters }),
  setUploadThreshold: (t) => set({ uploadThreshold: t }),
  setUploadAnalysisStatus: (s) => set({ uploadAnalysisStatus: s }),

  toggleUploadImage: (id) => set((state) => {
    const next = new Set(state.selectedUploadImageIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    return { selectedUploadImageIds: next };
  }),

  setUploadImageSelected: (id, selected) => set((state) => {
    const next = new Set(state.selectedUploadImageIds);
    if (selected) next.add(id); else next.delete(id);
    return { selectedUploadImageIds: next };
  }),

  selectAllRepresentatives: () => set((state) => {
    const ids = new Set<string>();
    state.uploadClusters.forEach((c) => {
      const rep = c.images.find((i) => i.is_representative);
      if (rep) ids.add(rep.id);
    });
    return { selectedUploadImageIds: ids };
  }),

  selectAllUploadImages: () => set((state) => {
    const ids = new Set<string>();
    state.uploadClusters.forEach((c) => c.images.forEach((i) => ids.add(i.id)));
    return { selectedUploadImageIds: ids };
  }),

  getSelectedUploadCount: () => get().selectedUploadImageIds.size,

  // Datalake actions
  setScanDrawerOpen: (open) => set({ scanDrawerOpen: open }),
  setScanConfig: (config) => set((s) => ({ scanConfig: { ...s.scanConfig, ...config } })),
  setActiveScan: (scan) => set({ activeScan: scan }),
  setScanResults: (clusters, total, dupes, pages) => set({
    scanResults: clusters, scanTotalClusters: total, scanTotalDuplicates: dupes, scanTotalPages: pages,
  }),
  setScanFilter: (filter) => set((s) => ({ scanFilters: { ...s.scanFilters, filter, page: 1 } })),
  setScanSort: (sort) => set((s) => ({ scanFilters: { ...s.scanFilters, sort, page: 1 } })),
  setScanPage: (page) => set((s) => ({ scanFilters: { ...s.scanFilters, page } })),

  toggleClusterSelection: (id) => set((s) => {
    const next = new Set(s.selectedClusterIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    return { selectedClusterIds: next };
  }),

  selectAllClusters: () => set((s) => ({
    selectedClusterIds: new Set(s.scanResults.map((c) => c.id)),
  })),

  clearClusterSelection: () => set({ selectedClusterIds: new Set<string>() }),

  removeCluster: (id) => set((s) => {
    const next = s.scanResults.filter((c) => c.id !== id);
    const sel = new Set(s.selectedClusterIds);
    sel.delete(id);
    return { scanResults: next, selectedClusterIds: sel, scanTotalClusters: s.scanTotalClusters - 1 };
  }),

  markClusterReviewed: (id) => set((s) => {
    const reviewed = new Set(s.reviewedClusterIds);
    reviewed.add(id);
    const results = s.scanResults.map((c) =>
      c.id === id ? { ...c, status: 'reviewed' as const } : c
    );
    return { reviewedClusterIds: reviewed, scanResults: results };
  }),

  setRepresentative: (clusterId, imageId) => set((s) => ({
    scanResults: s.scanResults.map((c) =>
      c.id === clusterId
        ? {
            ...c,
            images: c.images.map((img) => ({
              ...img,
              is_representative: img.id === imageId,
              similarity_score: img.id === imageId ? 1.0 : img.similarity_score,
            })),
          }
        : c
    ),
  })),

  setResultsOpen: (open) => set({ resultsOpen: open }),

  // Shared
  openLightbox: (clusterId, imageIndex) => set({ lightbox: { open: true, clusterId, imageIndex } }),
  closeLightbox: () => set({ lightbox: { open: false, clusterId: '', imageIndex: 0 } }),

  resetUpload: () => set({
    uploadClusters: [],
    uploadThreshold: 0.8,
    uploadAnalysisStatus: 'idle',
    selectedUploadImageIds: new Set<string>(),
  }),

  resetScan: () => set({
    activeScan: null,
    scanResults: [],
    scanTotalClusters: 0,
    scanTotalDuplicates: 0,
    scanTotalPages: 0,
    scanFilters: { filter: 'all', sort: 'size_desc', page: 1, per_page: 20 },
    reviewedClusterIds: new Set<string>(),
    selectedClusterIds: new Set<string>(),
    resultsOpen: false,
  }),
}));
