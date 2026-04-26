import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/services/apiClient';

export interface ProgressData {
  percentage: number;
  status: string;
  message?: string;
  isComplete: boolean;
  error?: string;
}

interface UseProgressOptions {
  taskId: string;
  pollingInterval?: number;
  onComplete?: () => void;
  baseUrl?: string;
  enabled?: boolean;
}

export const useProgress = ({
  taskId,
  pollingInterval = 5000,
  onComplete,
  baseUrl = '/api/v1/progress',
  enabled = true,
}: UseProgressOptions) => {
  const [progress, setProgress] = useState<ProgressData>({
    percentage: 0,
    status: 'Initializing...',
    isComplete: false,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async (): Promise<boolean> => {
    if (!taskId) return false;

    try {
      const response = await apiFetch(`${baseUrl}/${taskId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      const progressData: ProgressData = {
        percentage: data.percentage ?? 0,
        status: data.status ?? 'running',
        message: data.message,
        isComplete: data.isComplete ?? data.percentage >= 100,
        error: data.error,
      };

      setProgress(progressData);

      if (progressData.isComplete && onComplete) {
        onComplete();
      }

      return progressData.isComplete;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [taskId, baseUrl, onComplete]);

  useEffect(() => {
    if (!enabled || !taskId) return;

    let timeoutId: number;
    let isMounted = true;

    const poll = async () => {
      if (!isMounted) return;
      const isComplete = await fetchProgress();
      if (!isComplete && isMounted) {
        timeoutId = window.setTimeout(poll, pollingInterval);
      }
    };

    poll();

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [fetchProgress, pollingInterval, enabled, taskId]);

  return { progress, error };
};
