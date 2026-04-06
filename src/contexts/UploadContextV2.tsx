import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import { useFileIngestion } from '@/hooks/useFileIngestion';
import { useUploadQueue } from '@/hooks/useUploadQueue';
import { UploadedImage } from '@/types/upload';
import { baseURL } from "@/components/api/base";

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';


interface UploadContextType {
  files: UploadedImage[];

  isUploading: boolean;
  uploadProgress: number;

  isAddingFiles: boolean;
  addProgress: number;

  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  clearFiles: () => void;

  updateFile: (id: string, patch: Partial<UploadedImage>) => void;

  upload: (ids?: string[]) => Promise<void>;
}

const UploadContext = createContext<UploadContextType | null>(null);

export const useUploadContext = () => {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('UploadContext missing');
  return ctx;
};

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * 🔥 CORE STORE (Map for O(1))
   */
  const [filesMap, setFilesMap] = useState<Map<string, UploadedImage>>(new Map());

  /**
   * Derived array for UI
   */
  const files = useMemo(() => Array.from(filesMap.values()), [filesMap]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * 🔥 Track all preview URLs centrally
   */
  const previewUrls = useRef<Set<string>>(new Set());

  const safeRevoke = (url?: string) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    previewUrls.current.delete(url);
  };

  /**
   * -----------------------
   * Add Files (O(k))
   * -----------------------
   */
  const appendFiles = useCallback((newFiles: UploadedImage[]) => {
    setFilesMap((prev) => {
      const next = new Map(prev);

      newFiles.forEach((file) => {
        next.set(file.id, file);
        previewUrls.current.add(file.previewUrl);
      });

      return next;
    });
  }, []);

  const { ingestFiles, isAdding, progress: addProgress } =
    useFileIngestion(appendFiles);

  /**
   * -----------------------
   * Update (O(1))
   * -----------------------
   */
  const updateFile = useCallback((id: string, patch: Partial<UploadedImage>) => {
    setFilesMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (!existing) return prev;

      next.set(id, { ...existing, ...patch });
      return next;
    });
  }, []);

  /**
   * -----------------------
   * Remove (O(1))
   * -----------------------
   */
  const removeFile = useCallback((id: string) => {
    setFilesMap((prev) => {
      const next = new Map(prev);
      const file = next.get(id);

      if (file) {
        safeRevoke(file.previewUrl);
        next.delete(id);
      }

      return next;
    });
  }, []);

  /**
   * -----------------------
   * Clear All (optimized)
   * -----------------------
   */
  const clearFiles = useCallback(() => {
    // 🔥 Fast cleanup using Set (no iteration over map needed)
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();

    setFilesMap(new Map());
  }, []);

  /**
   * -----------------------
   * Upload Engine
   * -----------------------
   */
  const uploadFn = useCallback(
    (file: UploadedImage, onProgress: (p: number) => void) => {
      return new Promise<boolean>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          onProgress((e.loaded / e.total) * 100);
        };

        xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
        xhr.onerror = reject;

        const form = new FormData();
        form.append('file', file.file);

        xhr.open('POST', `${baseURL}/api/v1/images/upload`);
        xhr.send(form);
      });
    },
    []
  );

  const { runQueue } = useUploadQueue({
    concurrency: 3,
    uploadFn,
    onUpdate: updateFile,
    onProgress: setUploadProgress,
  });

  /**
   * -----------------------
   * Upload Orchestrator
   * -----------------------
   */
  const upload = useCallback(
    async (ids?: string[]) => {
      const target = ids?.length
        ? ids.map((id) => filesMap.get(id)).filter(Boolean) as UploadedImage[]
        : files.filter((f) => f.status === 'pending');

      if (!target.length) return;

      setIsUploading(true);
      setUploadProgress(0);

      await runQueue(target);

      setIsUploading(false);
    },
    [files, filesMap, runQueue]
  );

  return (
    <UploadContext.Provider
      value={{
        files,
        isUploading,
        uploadProgress,

        isAddingFiles: isAdding,
        addProgress,

        addFiles: ingestFiles,
        removeFile,
        clearFiles,
        updateFile,

        upload,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};