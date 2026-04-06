import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { UploadedImage } from '@/types/upload';

const CHUNK_SIZE = 20;

export function useFileIngestion(
  onAdd: (files: UploadedImage[]) => void
) {
  const [isAdding, setIsAdding] = useState(false);
  const [progress, setProgress] = useState(0);

  const ingestFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;

    setIsAdding(true);
    setProgress(0);

    const batchId = `batch-${Date.now()}`;

    try {
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);

        const mapped: UploadedImage[] = chunk.map((file) => ({
          id: uuidv4(),
          file,
          previewUrl: URL.createObjectURL(file),
          tasks: [],
          uploadedAt: new Date(),
          progress: 0,
          status: 'pending',
          batchId,
        }));

        onAdd(mapped);

        const done = Math.min(i + chunk.length, files.length);
        setProgress(Math.round((done / files.length) * 100));

        // yield to UI
        await new Promise((r) => requestAnimationFrame(r));
      }
    } finally {
      setIsAdding(false);
      setTimeout(() => setProgress(0), 300);
    }
  }, [onAdd]);

  return {
    ingestFiles,
    isAdding,
    progress,
  };
}