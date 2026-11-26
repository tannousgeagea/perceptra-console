import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { apiUpload } from "@/services/apiClient";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
import { UploadedImage, AnnotationFile, TaskType, ProjectSection, UploadOutcome, UploadTarget } from '@/types/upload';
import { runPool } from '@/components/upload/thumbnails';

const UPLOAD_CONCURRENCY = 4;

/** "38 new, 9 added from the data lake, 3 were already in the project" */
function summarize(outcomes: Partial<Record<UploadOutcome, number>>): string | undefined {
  const parts: string[] = [];
  if (outcomes.new) parts.push(`${outcomes.new} new`);
  if (outcomes.added_to_project) parts.push(`${outcomes.added_to_project} already in the data lake, now added to the project`);
  if (outcomes.already_in_project) parts.push(`${outcomes.already_in_project} already in the project`);
  if (outcomes.already_in_datalake) parts.push(`${outcomes.already_in_datalake} already in the data lake`);
  // All new: nothing worth explaining.
  if (parts.length === 1 && outcomes.new) return undefined;
  return parts.length ? parts.join(', ') + '.' : undefined;
}


// Lives above the routes (App.tsx): a selection and its uploads survive moving
// to another page; the upload tray shows them while you're elsewhere.
interface UploadContextType {
  /** Where the current selection goes (null when nothing is selected). */
  target: UploadTarget | null;
  setTarget: (target: UploadTarget | null) => void;
  currentSection: ProjectSection;
  uploadedImages: UploadedImage[];
  annotationFiles: AnnotationFile[];
  uploadProgress: number;
  isUploading: boolean;
  /** Total images selected by the user, including those still being processed into the grid. */
  pendingCount: number;
  setPendingCount: (n: number) => void;
  isProcessing: boolean;
  setIsProcessing: (b: boolean) => void;
  /** previews[i] (optional) is a ready thumbnail URL for files[i]; it is revoked with the card. */
  addImages: (files: File[], batchId?: string, previews?: string[]) => void;
  removeImage: (id: string) => void;
  addAnnotationFile: (file: File, taskType: TaskType) => void;
  removeAnnotationFile: (id: string) => void;
  setCurrentSection: (section: ProjectSection) => void;
  clearAllImages: () => void;
  submitUpload: (
    navigate: (path: string) => void,
    options?: {
      projectId?: string;
      tags?: string[];
      source_of_origin?: string;
      storage_profile_id?: string;
      redirect?: boolean;
    }
  ) => Promise<void>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUploadContext = () => {
  const context = useContext(UploadContext);
  if (!context) throw new Error('useUploadContext must be used within an UploadProvider');
  return context;
};

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentOrganization } = useCurrentOrganization();
  const queryClient = useQueryClient();

  const [currentSection, setCurrentSection] = useState<ProjectSection>('upload');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [annotationFiles, setAnnotationFiles] = useState<AnnotationFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [target, setTarget] = useState<UploadTarget | null>(null);

  // Anything not on the server yet (selected, being prepared, or uploading)?
  const unsent = isUploading || isProcessing || uploadedImages.some((img) => img.status !== 'success');

  // Closing or reloading the browser tab would lose it: the browser asks first.
  useEffect(() => {
    if (!unsent) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unsent]);

  // ── addImages ──────────────────────────────────────────────────────────────
  // Accepts a chunk (or all) of files. Called repeatedly by FileUploader
  // as it iterates through chunks, so each call appends — never replaces.
  const addImages = useCallback((files: File[], batchId?: string, previews?: string[]) => {
    if (files.length === 0) return;

    if (!batchId) {
      batchId = `batch-${Date.now()}`;
    }
    const newImages: UploadedImage[] = files.map((file, i) => ({
      id: uuidv4(),
      file,
      previewUrl: previews?.[i] ?? URL.createObjectURL(file),
      tasks: [],
      uploadedAt: new Date(),
      progress: 0,
      status: 'pending',
      batchId,
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);
  }, []);

  // ── removeImage ────────────────────────────────────────────────────────────
  const removeImage = useCallback((id: string) => {
    setUploadedImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  // ── annotation files ───────────────────────────────────────────────────────
  const addAnnotationFile = useCallback((file: File, taskType: TaskType) => {
    setAnnotationFiles((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), file, taskType },
    ]);
  }, []);

  const removeAnnotationFile = useCallback((id: string) => {
    setAnnotationFiles((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ── clearAllImages ─────────────────────────────────────────────────────────
  const clearAllImages = useCallback(() => {
    setUploadedImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      return [];
    });
    setTarget(null);
  }, []);

  // A selection belongs to one organisation: switching drops it.
  const orgId = currentOrganization?.id;
  const firstOrg = useRef(orgId);
  useEffect(() => {
    if (firstOrg.current === orgId) return;
    firstOrg.current = orgId;
    clearAllImages();
  }, [orgId, clearAllImages]);

  // ── updateFileStatus ───────────────────────────────────────────────────────
  const updateFileStatus = useCallback(
    (id: string, status: UploadedImage['status'], progress = 0, error?: string, outcome?: UploadOutcome) => {
      setUploadedImages((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f, status, progress: progress || f.progress,
                // a new attempt starts clean; a failure keeps its message
                error: status === 'error' ? (error ?? f.error) : undefined,
                outcome: outcome ?? f.outcome,
              }
            : f
        )
      );
    },
    []
  );

  // ── uploadImageToAPI ───────────────────────────────────────────────────────
  const uploadImageToAPI = useCallback(
    async (
      image: UploadedImage,
      onProgress: (pct: number) => void,
      options?: {
        projectId?: string;
        tags?: string[];
        source_of_origin?: string;
        storage_profile_id?: string;
      }
    ): Promise<{ message: string; retry: boolean } | { outcome: UploadOutcome }> => {
      // On success what the server did with it; otherwise the message to show on the
      // image, and whether trying again could help (network or server trouble, not a refusal).
      const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      const organizationId = currentOrganization?.id;
      if (!token || !organizationId) {
        return { message: 'Sign in again to upload', retry: false };
      }
      try {

        const formData = new FormData();
        formData.append('file', image.file);
        formData.append('image_id', image.id);
        if (image.batchId) formData.append('batch_id', image.batchId);
        if (options?.projectId) formData.append('project_id', options.projectId);
        if (options?.tags?.length) formData.append('tags', options.tags.join(','));
        if (options?.source_of_origin) formData.append('source_of_origin', options.source_of_origin);
        if (options?.storage_profile_id) formData.append('storage_profile_id', options.storage_profile_id);

        const result = await apiUpload('/api/v1/images/upload', formData, onProgress);
        let parsed: { detail?: unknown; outcome?: UploadOutcome } | null = null;
        try {
          parsed = JSON.parse(result.body);
        } catch {
          // not JSON
        }
        if (result.ok) return { outcome: parsed?.outcome ?? 'new' };
        if (result.status === 403) return { message: "You don't have permission to upload here", retry: false };
        const detail = typeof parsed?.detail === 'string' ? parsed.detail : '';
        return { message: detail || `Upload failed (${result.status})`, retry: result.status >= 500 };
      } catch {
        return { message: 'Network error during upload', retry: true };
      }
    },
    [currentOrganization]
  );

  // ── submitUpload ───────────────────────────────────────────────────────────
  const submitUpload = useCallback(
    async (
      navigate: (path: string) => void,
      options?: {
        projectId?: string;
        jobId?: string;
        tags?: string[];
        source_of_origin?: string;
        storage_profile_id?: string;
        redirect?: boolean;
      }
    ) => {
      // Already uploaded images are never sent twice ("Retry failed" sends the rest).
      const todo = uploadedImages.filter((img) => img.status !== 'success');
      if (todo.length === 0) return;

      setIsUploading(true);
      setUploadProgress(0);

      let failed = 0;
      const outcomes: Partial<Record<UploadOutcome, number>> = {};
      // Where the person was when they pressed Upload: only send them on if they're still there.
      const startedOn = window.location.pathname;
      try {
        let done = 0;
        const upload = (image: UploadedImage) => uploadImageToAPI(
          image,
          (pct) => updateFileStatus(image.id, 'uploading', pct),
          {
            projectId: options?.projectId,
            tags: options?.tags,
            source_of_origin: options?.source_of_origin,
            storage_profile_id: options?.storage_profile_id,
          }
        );

        // A few at a time: steady progress, no hundred requests racing each other.
        await runPool(todo, UPLOAD_CONCURRENCY, async (image) => {
          updateFileStatus(image.id, 'uploading', 0);
          let result = await upload(image);
          if ('retry' in result && result.retry) {
            await new Promise((r) => setTimeout(r, 1500));
            result = await upload(image);
          }
          if ('message' in result) {
            failed += 1;
            updateFileStatus(image.id, 'error', 0, result.message);
          } else {
            outcomes[result.outcome] = (outcomes[result.outcome] ?? 0) + 1;
            updateFileStatus(image.id, 'success', 100, undefined, result.outcome);
          }
          done += 1;
          setUploadProgress(Math.round((done / todo.length) * 100));
        });

        // Invalidate relevant query caches
        queryClient.invalidateQueries({ queryKey: ['jobs', options?.projectId, currentOrganization?.id] });
        queryClient.invalidateQueries({ queryKey: ['images', options?.projectId, currentOrganization?.id] });
        // The overview and home counts ("7 images") change too.
        queryClient.invalidateQueries({ queryKey: ['project-overview', currentOrganization?.id] });
        queryClient.invalidateQueries({ queryKey: ['organization-home', currentOrganization?.id] });

        if (options?.jobId) {
          queryClient.invalidateQueries({ queryKey: ['job', options.jobId, currentOrganization?.id] });
          queryClient.invalidateQueries({ queryKey: ['images', options.projectId, options.jobId, currentOrganization?.id] });
        }

        const allNew = (outcomes.new ?? 0) === done - failed;
        toast({
          title: failed > 0
            ? `${done - failed} of ${done} images uploaded, ${failed} failed`
            : allNew ? `${done} image${done === 1 ? '' : 's'} uploaded` : 'Upload finished',
          description: summarize(outcomes),
          variant: failed > 0 ? 'destructive' : undefined,
        });

        // Stay put while anything failed (so it can be retried) or when nothing new
        // joined the project, and never move someone who went on to another page
        // while this ran in the background.
        const joined = (outcomes.new ?? 0) + (outcomes.added_to_project ?? 0);
        if (failed === 0 && joined > 0 && options?.redirect !== false && options?.projectId && window.location.pathname === startedOn) {
          setTimeout(() => {
            if (window.location.pathname === startedOn) navigate(`/projects/${options.projectId}/annotate`);
          }, 2000);
        }
      } catch (err) {
        console.error('Upload error:', err);
        todo.forEach((img) => updateFileStatus(img.id, 'error', 0, 'Upload interrupted'));
      } finally {
        setTimeout(() => setIsUploading(false), 2000);
      }
    },
    [uploadedImages, uploadImageToAPI, updateFileStatus, queryClient, currentOrganization]
  );

  const value: UploadContextType = {
    target,
    setTarget,
    currentSection,
    uploadedImages,
    annotationFiles,
    uploadProgress,
    isUploading,
    pendingCount,
    setPendingCount,
    isProcessing,
    setIsProcessing,
    addImages,
    removeImage,
    addAnnotationFile,
    removeAnnotationFile,
    setCurrentSection,
    clearAllImages,
    submitUpload,
  };

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
};