import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AIModel,
  LabelConfig,
  AutoAnnotateSession,
  GeneratedAnnotation,
  ActivityLogEntry,
  AutoAnnotateStep,
  AnnotationType,
} from '@/types/auto-annotate';
import { useJobImages } from '@/hooks/useJobImages';
import { useProjectImages } from '@/hooks/useProjectImages';
import { useSearchParser } from '@/hooks/useSearchParser';
import { buildImageQuery } from '@/hooks/useImages';
import { useProgress } from '@/hooks/useProgress';
import { apiFetch } from '@/services/apiClient';

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

const taskToAnnotationTypes = (task: string): AnnotationType[] => {
  switch (task?.toLowerCase()) {
    case 'object-detection': return ['bounding-box'];
    case 'segmentation': return ['segmentation', 'polygon'];
    case 'classification': return ['classification'];
    default: return ['bounding-box'];
  }
};

export function useAutoAnnotate(projectId: string, jobId?: string) {
  const [step, setStep] = useState<AutoAnnotateStep>('select');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [session, setSession] = useState<AutoAnnotateSession | null>(null);
  const [generatedAnnotations] = useState<GeneratedAnnotation[]>([]);
  const [activityLog] = useState<ActivityLogEntry[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  // ── Real models from API ──────────────────────────────────────────────────
  const modelsQuery = useQuery({
    queryKey: ['project-models-deployed', projectId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/models/projects/${projectId}/models`);
      if (!res.ok) throw new Error('Failed to fetch models');
      return res.json() as Promise<any[]>;
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });

  const models: AIModel[] = (modelsQuery.data ?? [])
    .filter((m: any) => m.has_production_version)
    .map((m: any): AIModel => ({
      id: m.id,
      name: m.name,
      version: m.production_version_number ? `v${m.production_version_number}` : '',
      supportedTypes: taskToAnnotationTypes(m.task),
      description: m.description ?? '',
      accuracy: 0,
      productionVersionId: m.production_version_id,
    }));

  // ── Image queries ─────────────────────────────────────────────────────────
  const parsedQuery = useSearchParser(searchQuery);
  const _query = buildImageQuery(parsedQuery);

  const projectImagesQuery = useProjectImages(projectId, { q: _query, limit: 200 });
  const jobImagesQuery = useJobImages(projectId, jobId!, { q: _query, limit: 200 });

  const activeQuery = jobId ? jobImagesQuery : projectImagesQuery;
  const { data, isLoading, error, refetch } = activeQuery;

  const availableImages = data?.images || [];

  // ── Progress polling (only when a task is running) ────────────────────────
  const { progress: taskProgress } = useProgress({
    taskId: taskId ?? '',
    pollingInterval: 3000,
    enabled: !!taskId,
    onComplete: () => {
      setSession((s) =>
        s ? { ...s, status: 'completed', completedAt: new Date().toISOString() } : s
      );
      setStep('complete');
    },
  });

  // Sync progress percentage into session
  useEffect(() => {
    if (!taskId || !session) return;
    const processed = Math.round((taskProgress.percentage / 100) * session.totalImages);
    setSession((s) =>
      s
        ? {
            ...s,
            processedImages: processed,
            status: taskProgress.isComplete ? 'completed' : 'processing',
          }
        : s
    );
  }, [taskProgress.percentage, taskProgress.isComplete, taskId]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const allTags = Array.from(new Set(availableImages.flatMap((img) => img.tags)));

  const filteredImages = availableImages.filter((img) => {
    if (tagFilter.length > 0 && !tagFilter.some((t) => img.tags.includes(t))) return false;
    if (statusFilter !== 'all' && img.status !== statusFilter) return false;
    return true;
  });

  const selectedImages = availableImages.filter((img) => selectedIds.has(img.id));
  const totalSizeMb = selectedImages.reduce((s, img) => s + img.file_size_mb, 0);

  // ── Selection helpers ─────────────────────────────────────────────────────
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

  const deselectAll = useCallback(() => setSelectedIds(new Set()), []);

  // ── Label helpers ─────────────────────────────────────────────────────────
  const addLabel = useCallback(
    (label: string) => {
      const trimmed = label.trim().toLowerCase();
      if (trimmed && !labels.includes(trimmed)) {
        setLabels((prev) => [...prev, trimmed]);
      }
    },
    [labels]
  );

  const removeLabel = useCallback(
    (label: string) => setLabels((prev) => prev.filter((l) => l !== label)),
    []
  );

  // ── Start processing (real API) ───────────────────────────────────────────
  const startProcessing = useCallback(async () => {
    if (!selectedModel?.productionVersionId || labels.length === 0 || selectedIds.size === 0) return;

    const imageIds = availableImages
      .filter((img) => selectedIds.has(img.id))
      .map((img) => parseInt(img.id, 10))
      .filter((id) => !isNaN(id));

    if (imageIds.length === 0) return;

    const newSession: AutoAnnotateSession = {
      id: `session-${Date.now()}`,
      status: 'pending',
      modelId: selectedModel.id,
      modelName: `${selectedModel.name} ${selectedModel.version}`,
      labels,
      totalImages: imageIds.length,
      processedImages: 0,
      successCount: 0,
      failedCount: 0,
      totalAnnotationsCreated: 0,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      estimatedRemainingSeconds: imageIds.length * 2,
      initiatedBy: '',
    };

    setSession(newSession);
    setStep('processing');
    setStartError(null);

    try {
      const response = await apiFetch(`/api/v1/projects/${projectId}/auto-annotate`, {
        method: 'POST',
        body: JSON.stringify({
          model_version_id: selectedModel.productionVersionId,
          image_ids: imageIds,
          confidence_threshold: confidenceThreshold / 100,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to start auto-annotation');
      }

      const { task_id } = await response.json();
      setTaskId(task_id);
      setSession((s) => (s ? { ...s, id: task_id, status: 'processing' } : s));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setStartError(msg);
      setSession((s) => (s ? { ...s, status: 'failed' } : s));
      setStep('complete');
    }
  }, [selectedModel, labels, selectedIds, availableImages, confidenceThreshold, projectId]);

  const cancelProcessing = useCallback(() => {
    setTaskId(null);
    setSession((s) => (s ? { ...s, status: 'cancelled' } : s));
    setStep('complete');
  }, []);

  // Celery tasks do not support pause/resume — kept as no-ops for UI compatibility
  const pauseProcessing = useCallback(() => {}, []);
  const resumeProcessing = useCallback(() => {}, []);

  // ── Review helpers ────────────────────────────────────────────────────────
  const updateAnnotationStatus = useCallback(
    (_annotationId: string, _status: 'accepted' | 'rejected') => {
      // Annotations are persisted by the backend; no local state needed
    },
    []
  );

  const bulkAcceptAbove = useCallback((_threshold: number) => {}, []);
  const bulkRejectBelow = useCallback((_threshold: number) => {}, []);

  const reset = useCallback(() => {
    setStep('select');
    setSelectedIds(new Set());
    setSelectedModel(null);
    setLabels([]);
    setSession(null);
    setConfidenceThreshold(50);
    setTaskId(null);
    setStartError(null);
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
    modelsLoading: modelsQuery.isLoading,
    selectedModel,
    setSelectedModel,
    labels,
    labelPresets: LABEL_PRESETS,
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
    taskProgress,
    startProcessing,
    pauseProcessing,
    resumeProcessing,
    cancelProcessing,
    updateAnnotationStatus,
    bulkAcceptAbove,
    bulkRejectBelow,
    reset,
    startError,
    isLoading,
    error,
    refetch,
  };
}
