import { useState, useCallback, useRef, useEffect } from 'react';
import { ProjectImage } from '@/types/dataset';
import {
  AIModel,
  LabelConfig,
  AutoAnnotateSession,
  GeneratedAnnotation,
  ActivityLogEntry,
  AutoAnnotateStep,
} from '@/types/auto-annotate';

// ── Mock AI Models ──
const MOCK_MODELS: AIModel[] = [
  {
    id: 'model-yolov8',
    name: 'YOLOv8-X',
    version: 'v8.1.0',
    supportedTypes: ['bounding-box', 'segmentation'],
    description: 'State-of-the-art real-time object detection and segmentation.',
    accuracy: 92.4,
  },
  {
    id: 'model-detr',
    name: 'DETR',
    version: 'v2.0',
    supportedTypes: ['bounding-box'],
    description: 'Transformer-based detection. Excellent on complex scenes.',
    accuracy: 89.1,
  },
  {
    id: 'model-sam',
    name: 'SAM 2',
    version: 'v2.1',
    supportedTypes: ['segmentation', 'polygon'],
    description: 'Segment Anything Model. Best-in-class zero-shot segmentation.',
    accuracy: 94.7,
  },
  {
    id: 'model-clip',
    name: 'CLIP Classifier',
    version: 'v3.0',
    supportedTypes: ['classification'],
    description: 'Zero-shot image classification using natural language prompts.',
    accuracy: 87.3,
  },
];

const LABEL_PRESETS: LabelConfig[] = [
  { name: 'person', color: '#22c55e' },
  { name: 'car', color: '#3b82f6' },
  { name: 'truck', color: '#f59e0b' },
  { name: 'bicycle', color: '#8b5cf6' },
  { name: 'motorcycle', color: '#ec4899' },
  { name: 'bus', color: '#14b8a6' },
  { name: 'traffic light', color: '#ef4444' },
  { name: 'stop sign', color: '#f97316' },
  { name: 'dog', color: '#06b6d4' },
  { name: 'cat', color: '#a855f7' },
];

// ── Mock images for selection ──
function generateSelectableImages(): ProjectImage[] {
  const tags = ['training', 'validation', 'test', 'urban', 'highway', 'night', 'rain'];
  return Array.from({ length: 60 }, (_, i) => ({
    id: `auto-img-${i}`,
    image_id: `img-${i}`,
    name: `IMG_${String(i).padStart(4, '0')}.jpg`,
    original_filename: `IMG_${String(i).padStart(4, '0')}.jpg`,
    width: 1920,
    height: 1080,
    aspect_ratio: 16 / 9,
    file_format: 'JPEG',
    file_size: 2048000 + i * 5000,
    file_size_mb: +(2.0 + i * 0.005).toFixed(3),
    megapixels: 2.07,
    storage_key: `images/auto-${i}.jpg`,
    checksum: `chk-${i}`,
    source_of_origin: 'upload',
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 43200000).toISOString(),
    uploaded_by: i % 3 === 0 ? 'user-1' : 'user-2',
    tags: [tags[i % tags.length], ...(i % 4 === 0 ? [tags[(i + 2) % tags.length]] : [])],
    storage_profile: { id: 'profile-1', name: 'Primary', backend: 's3' },
    download_url: `https://picsum.photos/seed/auto-${i}/400/300`,
    status: i % 3 === 0 ? 'unannotated' as const : i % 3 === 1 ? 'annotated' as const : 'reviewed' as const,
    annotated: i % 3 !== 0,
    reviewed: i % 3 === 2,
    marked_as_null: false,
    priority: Math.floor(Math.random() * 100),
    job_assignment_status: i % 2 === 0 ? 'assigned' as const : 'waiting' as const,
    added_at: new Date(Date.now() - i * 86400000).toISOString(),
    annotations: [],
  }));
}

const MOCK_ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: 'log-1',
    sessionId: 'session-old-1',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    user: 'alice@team.com',
    modelName: 'YOLOv8-X v8.1.0',
    imageCount: 50,
    annotationsCreated: 234,
    successRate: 96,
    status: 'completed',
  },
  {
    id: 'log-2',
    sessionId: 'session-old-2',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    user: 'bob@team.com',
    modelName: 'SAM 2 v2.1',
    imageCount: 120,
    annotationsCreated: 587,
    successRate: 92,
    status: 'completed',
  },
  {
    id: 'log-3',
    sessionId: 'session-old-3',
    date: new Date(Date.now() - 8 * 86400000).toISOString(),
    user: 'alice@team.com',
    modelName: 'CLIP Classifier v3.0',
    imageCount: 30,
    annotationsCreated: 0,
    successRate: 0,
    status: 'failed',
  },
];

export function useAutoAnnotate() {
  const [step, setStep] = useState<AutoAnnotateStep>('select');
  const [availableImages] = useState<ProjectImage[]>(generateSelectableImages);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [session, setSession] = useState<AutoAnnotateSession | null>(null);
  const [generatedAnnotations, setGeneratedAnnotations] = useState<GeneratedAnnotation[]>([]);
  const [activityLog] = useState<ActivityLogEntry[]>(MOCK_ACTIVITY_LOG);
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const processingRef = useRef<NodeJS.Timeout | null>(null);
  const pausedRef = useRef(false);

  const models = MOCK_MODELS;
  const labelPresets = LABEL_PRESETS;

  // Derived
  const allTags = Array.from(new Set(availableImages.flatMap((img) => img.tags)));

  const filteredImages = availableImages.filter((img) => {
    if (searchQuery && !img.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (tagFilter.length > 0 && !tagFilter.some((t) => img.tags.includes(t))) return false;
    if (statusFilter !== 'all' && img.status !== statusFilter) return false;
    return true;
  });

  const selectedImages = availableImages.filter((img) => selectedIds.has(img.id));
  const totalSizeMb = selectedImages.reduce((s, img) => s + img.file_size_mb, 0);

  // Selection helpers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredImages.map((img) => img.id)));
  }, [filteredImages]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Label helpers
  const addLabel = useCallback((label: string) => {
    const trimmed = label.trim().toLowerCase();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels((prev) => [...prev, trimmed]);
    }
  }, [labels]);

  const removeLabel = useCallback((label: string) => {
    setLabels((prev) => prev.filter((l) => l !== label));
  }, []);

  // Processing simulation
  const startProcessing = useCallback(() => {
    if (!selectedModel || labels.length === 0 || selectedIds.size === 0) return;

    const imgs = availableImages.filter((img) => selectedIds.has(img.id));
    const newSession: AutoAnnotateSession = {
      id: `session-${Date.now()}`,
      status: 'processing',
      modelId: selectedModel.id,
      modelName: `${selectedModel.name} ${selectedModel.version}`,
      labels,
      totalImages: imgs.length,
      processedImages: 0,
      successCount: 0,
      failedCount: 0,
      totalAnnotationsCreated: 0,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      estimatedRemainingSeconds: imgs.length * 2,
      currentImageName: imgs[0]?.name,
      currentImageUrl: imgs[0]?.download_url,
      initiatedBy: 'current-user@team.com',
    };

    setSession(newSession);
    setGeneratedAnnotations([]);
    setStep('processing');
    pausedRef.current = false;

    let idx = 0;
    const tick = () => {
      if (pausedRef.current) return;

      if (idx >= imgs.length) {
        setSession((s) =>
          s
            ? {
                ...s,
                status: 'completed',
                completedAt: new Date().toISOString(),
                currentImageName: undefined,
                currentImageUrl: undefined,
                estimatedRemainingSeconds: 0,
              }
            : s
        );
        setStep('complete');
        return;
      }

      const img = imgs[idx];
      const annotCount = Math.floor(Math.random() * 4) + 1;
      const failed = Math.random() < 0.05;
      const newAnnots: GeneratedAnnotation[] = failed
        ? []
        : Array.from({ length: annotCount }, (_, j) => ({
            id: `ga-${img.id}-${j}`,
            imageId: img.id,
            imageName: img.name,
            imageUrl: img.download_url,
            label: labels[j % labels.length],
            type: selectedModel.supportedTypes[0],
            confidence: Math.round((60 + Math.random() * 40) * 10) / 10,
            reviewStatus: 'pending' as const,
            data: { x: Math.random() * 100, y: Math.random() * 100, w: 50, h: 50 },
            sessionId: newSession.id,
            createdAt: new Date().toISOString(),
          }));

      idx++;

      setGeneratedAnnotations((prev) => [...prev, ...newAnnots]);
      setSession((s) =>
        s
          ? {
              ...s,
              processedImages: idx,
              successCount: s.successCount + (failed ? 0 : 1),
              failedCount: s.failedCount + (failed ? 1 : 0),
              totalAnnotationsCreated: s.totalAnnotationsCreated + newAnnots.length,
              elapsedSeconds: idx * 2,
              estimatedRemainingSeconds: (imgs.length - idx) * 2,
              currentImageName: imgs[idx]?.name,
              currentImageUrl: imgs[idx]?.download_url,
            }
          : s
      );

      processingRef.current = setTimeout(tick, 800);
    };

    processingRef.current = setTimeout(tick, 800);
  }, [selectedModel, labels, selectedIds, availableImages]);

  const pauseProcessing = useCallback(() => {
    pausedRef.current = true;
    setSession((s) => (s ? { ...s, status: 'paused' } : s));
  }, []);

  const resumeProcessing = useCallback(() => {
    pausedRef.current = false;
    setSession((s) => (s ? { ...s, status: 'processing' } : s));
    // restart the tick
    if (session) {
      const imgs = availableImages.filter((img) => selectedIds.has(img.id));
      let idx = session.processedImages;

      const tick = () => {
        if (pausedRef.current) return;
        if (idx >= imgs.length) {
          setSession((s) =>
            s ? { ...s, status: 'completed', completedAt: new Date().toISOString(), estimatedRemainingSeconds: 0, currentImageName: undefined, currentImageUrl: undefined } : s
          );
          setStep('complete');
          return;
        }

        const img = imgs[idx];
        const annotCount = Math.floor(Math.random() * 4) + 1;
        const failed = Math.random() < 0.05;
        const newAnnots: GeneratedAnnotation[] = failed
          ? []
          : Array.from({ length: annotCount }, (_, j) => ({
              id: `ga-${img.id}-${j}`,
              imageId: img.id,
              imageName: img.name,
              imageUrl: img.download_url,
              label: labels[j % labels.length],
              type: selectedModel!.supportedTypes[0],
              confidence: Math.round((60 + Math.random() * 40) * 10) / 10,
              reviewStatus: 'pending' as const,
              data: {},
              sessionId: session!.id,
              createdAt: new Date().toISOString(),
            }));

        idx++;
        setGeneratedAnnotations((prev) => [...prev, ...newAnnots]);
        setSession((s) =>
          s
            ? {
                ...s,
                processedImages: idx,
                successCount: s.successCount + (failed ? 0 : 1),
                failedCount: s.failedCount + (failed ? 1 : 0),
                totalAnnotationsCreated: s.totalAnnotationsCreated + newAnnots.length,
                elapsedSeconds: idx * 2,
                estimatedRemainingSeconds: (imgs.length - idx) * 2,
                currentImageName: imgs[idx]?.name,
                currentImageUrl: imgs[idx]?.download_url,
              }
            : s
        );

        processingRef.current = setTimeout(tick, 800);
      };

      processingRef.current = setTimeout(tick, 800);
    }
  }, [session, availableImages, selectedIds, labels, selectedModel]);

  const cancelProcessing = useCallback(() => {
    if (processingRef.current) clearTimeout(processingRef.current);
    pausedRef.current = true;
    setSession((s) => (s ? { ...s, status: 'cancelled' } : s));
    setStep('complete');
  }, []);

  // Review helpers
  const updateAnnotationStatus = useCallback(
    (annotationId: string, status: 'accepted' | 'rejected') => {
      setGeneratedAnnotations((prev) =>
        prev.map((a) => (a.id === annotationId ? { ...a, reviewStatus: status } : a))
      );
    },
    []
  );

  const bulkAcceptAbove = useCallback(
    (threshold: number) => {
      setGeneratedAnnotations((prev) =>
        prev.map((a) => (a.confidence >= threshold ? { ...a, reviewStatus: 'accepted' } : a))
      );
    },
    []
  );

  const bulkRejectBelow = useCallback(
    (threshold: number) => {
      setGeneratedAnnotations((prev) =>
        prev.map((a) => (a.confidence < threshold ? { ...a, reviewStatus: 'rejected' } : a))
      );
    },
    []
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (processingRef.current) clearTimeout(processingRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    if (processingRef.current) clearTimeout(processingRef.current);
    setStep('select');
    setSelectedIds(new Set());
    setSelectedModel(null);
    setLabels([]);
    setSession(null);
    setGeneratedAnnotations([]);
    setConfidenceThreshold(50);
  }, []);

  return {
    step,
    setStep,
    availableImages,
    filteredImages,
    selectedIds,
    selectedImages,
    totalSizeMb,
    toggleSelect,
    selectAll,
    deselectAll,
    models,
    selectedModel,
    setSelectedModel,
    labels,
    labelPresets,
    addLabel,
    removeLabel,
    session,
    generatedAnnotations,
    activityLog,
    confidenceThreshold,
    setConfidenceThreshold,
    searchQuery,
    setSearchQuery,
    tagFilter,
    setTagFilter,
    statusFilter,
    setStatusFilter,
    allTags,
    startProcessing,
    pauseProcessing,
    resumeProcessing,
    cancelProcessing,
    updateAnnotationStatus,
    bulkAcceptAbove,
    bulkRejectBelow,
    reset,
  };
}
