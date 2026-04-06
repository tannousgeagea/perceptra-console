import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
import { UploadedImage, AnnotationFile, Project, TaskType, ProjectSection } from '@/types/upload';


interface UploadContextType {
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
  addImages: (files: File[], batchId?: string) => void;
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

  // ── addImages ──────────────────────────────────────────────────────────────
  // Accepts a chunk (or all) of files. Called repeatedly by FileUploader
  // as it iterates through chunks, so each call appends — never replaces.
  const addImages = useCallback((files: File[], batchId?: string) => {
    if (files.length === 0) return;

    if (!batchId) {
      batchId = `batch-${Date.now()}`;
    }
    const newImages: UploadedImage[] = files.map((file) => ({
      id: uuidv4(),
      file,
      // createObjectURL is synchronous and fast; safe to call per-chunk
      previewUrl: URL.createObjectURL(file),
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
  }, []);

  // ── updateFileStatus ───────────────────────────────────────────────────────
  const updateFileStatus = useCallback(
    (id: string, status: UploadedImage['status'], progress = 0, error?: string) => {
      setUploadedImages((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status, progress: progress || f.progress, error: error ?? f.error }
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
    ): Promise<boolean> => {
      try {
        const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        const organizationId = currentOrganization?.id;

        if (!token || !organizationId) {
          throw new Error('Missing authentication or organization context');
        }

        const formData = new FormData();
        formData.append('file', image.file);
        formData.append('image_id', image.id);
        if (image.batchId) formData.append('batch_id', image.batchId);
        if (options?.projectId) formData.append('project_id', options.projectId);
        if (options?.tags?.length) formData.append('tags', options.tags.join(','));
        if (options?.source_of_origin) formData.append('source_of_origin', options.source_of_origin);
        if (options?.storage_profile_id) formData.append('storage_profile_id', options.storage_profile_id);

        return await new Promise<boolean>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${baseURL}/api/v1/images/upload`, true);
          xhr.setRequestHeader('accept', 'application/json');
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.setRequestHeader('X-Organization-ID', organizationId);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              onProgress(Math.round((e.loaded / e.total) * 100));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(true);
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          };
          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.send(formData);
        });
      } catch (err) {
        console.error('Error uploading image:', err);
        return false;
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
      if (uploadedImages.length === 0) return;

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const total = uploadedImages.length;
        const perImage = 100 / total;
        let overall = 0;

        await Promise.all(
          uploadedImages.map(async (image) => {
            updateFileStatus(image.id, 'uploading', 0);

            const success = await uploadImageToAPI(
              image,
              (pct) => updateFileStatus(image.id, 'uploading', pct),
              {
                projectId: options?.projectId,
                tags: options?.tags,
                source_of_origin: options?.source_of_origin,
                storage_profile_id: options?.storage_profile_id,
              }
            );

            updateFileStatus(image.id, success ? 'success' : 'error', success ? 100 : 0, success ? undefined : 'Upload failed');
            overall += perImage;
            setUploadProgress(Math.min(Math.round(overall), 100));
          })
        );

        // Invalidate relevant query caches
        queryClient.invalidateQueries({ queryKey: ['jobs', options?.projectId, currentOrganization?.id] });
        queryClient.invalidateQueries({ queryKey: ['images', options?.projectId, currentOrganization?.id] });

        if (options?.jobId) {
          queryClient.invalidateQueries({ queryKey: ['job', options.jobId, currentOrganization?.id] });
          queryClient.invalidateQueries({ queryKey: ['images', options.projectId, options.jobId, currentOrganization?.id] });
        }

        if (options?.redirect !== false && options?.projectId) {
          setTimeout(() => navigate(`/projects/${options.projectId}/annotate`), 2000);
        }
      } catch (err) {
        console.error('Upload error:', err);
        uploadedImages.forEach((img) => updateFileStatus(img.id, 'error', 0, 'Upload interrupted'));
      } finally {
        setTimeout(() => setIsUploading(false), 2000);
      }
    },
    [uploadedImages, uploadImageToAPI, updateFileStatus, queryClient, currentOrganization]
  );

  const value: UploadContextType = {
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