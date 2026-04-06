import { useCallback } from 'react';
import type { UploadedImage } from '@/types/upload';

interface UploadQueueOptions {
  concurrency?: number;
  uploadFn: (
    file: UploadedImage,
    onProgress: (p: number) => void
  ) => Promise<boolean>;
  onUpdate: (id: string, patch: Partial<UploadedImage>) => void;
  onProgress: (progress: number) => void;
}

export function useUploadQueue({
  concurrency = 3,
  uploadFn,
  onUpdate,
  onProgress,
}: UploadQueueOptions) {

  const runQueue = useCallback(async (files: UploadedImage[]) => {
    let completed = 0;
    const total = files.length;

    const queue = [...files];

    const worker = async () => {
      while (queue.length) {
        const file = queue.shift();
        if (!file) return;

        onUpdate(file.id, { status: 'uploading', progress: 0 });

        try {
          const success = await uploadFn(file, (p) => {
            onUpdate(file.id, { progress: p });
          });

          if (success) {
            onUpdate(file.id, { status: 'success', progress: 100 });
          } else {
            onUpdate(file.id, { status: 'error', progress: 0 });
          }
        } catch (e) {
          onUpdate(file.id, {
            status: 'error',
            progress: 0,
            error: e instanceof Error ? e.message : 'Upload failed',
          });
        }

        completed++;
        onProgress(Math.round((completed / total) * 100));
      }
    };

    const workers = Array(Math.min(concurrency, files.length))
      .fill(null)
      .map(worker);

    await Promise.all(workers);
  }, [uploadFn, onUpdate, onProgress, concurrency]);

  return { runQueue };
}