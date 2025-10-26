import { useState, useEffect, useCallback } from 'react';
import { baseURL } from '@/components/api/base';
export interface ProgressData {
  percentage: number;
  status: string;
  message?:string;
  isComplete: boolean;
  error?: string;
}

interface UseProgressOptions {
  taskId: string;
  pollingInterval?: number;
  onComplete?: () => void;
  baseUrl?: string;
}

// Mock data for demonstration
const mockTasks: Record<string, ProgressData[]> = {
  'task-1': [
    { percentage: 0, status: 'Starting file upload...', isComplete: false },
    { percentage: 10, status: 'Preparing file...', isComplete: false },
    { percentage: 20, status: 'Checking file integrity...', isComplete: false },
    { percentage: 30, status: 'Uploading file...', isComplete: false },
    { percentage: 40, status: 'Uploading file...', isComplete: false },
    { percentage: 50, status: 'Uploading file...', isComplete: false },
    { percentage: 60, status: 'Processing file...', isComplete: false },
    { percentage: 70, status: 'Validating upload...', isComplete: false },
    { percentage: 80, status: 'Running security checks...', isComplete: false },
    { percentage: 90, status: 'Finalizing upload...', isComplete: false },
    { percentage: 100, status: 'Upload complete!', isComplete: true }
  ],
  'task-2': [
    { percentage: 0, status: 'Initializing data processing...', isComplete: false },
    { percentage: 10, status: 'Loading data...', isComplete: false },
    { percentage: 20, status: 'Validating data format...', isComplete: false },
    { percentage: 25, status: 'Processing batch 1/8...', isComplete: false },
    { percentage: 35, status: 'Processing batch 2/8...', isComplete: false },
    { percentage: 45, status: 'Processing batch 3/8...', isComplete: false },
    { percentage: 55, status: 'Processing batch 4/8...', isComplete: false },
    { percentage: 65, status: 'Processing batch 5/8...', isComplete: false },
    { percentage: 75, status: 'Processing batch 6/8...', isComplete: false },
    { percentage: 85, status: 'Processing batch 7/8...', isComplete: false },
    { percentage: 95, status: 'Processing batch 8/8...', isComplete: false },
    { percentage: 100, status: 'Processing complete!', isComplete: true }
  ]
};

export const useProgress = ({
  taskId,
  pollingInterval = 5000,
  onComplete,
  baseUrl = '/api/v1/progress'
}: UseProgressOptions) => {
  const [progress, setProgress] = useState<ProgressData>({
    percentage: 0,
    status: 'Initializing...',
    isComplete: false
  });
  const [error, setError] = useState<string | null>(null);
  const [mockIndex, setMockIndex] = useState(0);
  let currentIndex = 0
  
  const fetchProgress = useCallback(async () => {
    // For demo purposes, use mock data instead of actual API call
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      const mockProgressSteps = mockTasks[taskId];
      
      if (!mockProgressSteps) {
        setError('Task not found');
        return true;
      }

      const currentProgress = mockProgressSteps[currentIndex];

      console.log(Date.now(), "Percentage: ", currentProgress.percentage)
      console.log(currentIndex)

      if (currentProgress) {
        setProgress(currentProgress);
        
        if (currentProgress.isComplete && onComplete) {
          onComplete();
        }
        
        currentIndex++;
        setMockIndex(prev => Math.min(prev + 1, mockProgressSteps.length - 1));
        return currentProgress.isComplete;
      }
      
      return true;
    }

    // Real API call for production
    try {
      const response = await fetch(`${baseURL}${baseUrl}/${taskId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      
      const data: ProgressData = await response.json();
      setProgress(data);
      
      if (data.isComplete && onComplete) {
        onComplete();
      }
      
      return data.isComplete;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return true;
    }
  }, [taskId, baseUrl, onComplete, mockIndex]);

  useEffect(() => {
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
  }, [fetchProgress, pollingInterval]);

  return { progress, error };
};