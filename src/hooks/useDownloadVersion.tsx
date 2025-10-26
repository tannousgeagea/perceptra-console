import { useState, useCallback } from 'react';
import { baseURL } from '@/components/api/base';

interface UseDownloadVersionResult {
  downloadVersion: (versionId: number, format?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  taskId: string | null;
}

export const useDownloadVersion = (): UseDownloadVersionResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const downloadVersion = useCallback(async (versionId: number, format: string = 'yolo', requestId?: string) => {
    setLoading(true);
    setError(null);
    const generatedId = requestId || `download-${Date.now()}`;
    setTaskId(generatedId);

    try {
      // Construct the URL
      const url = `${baseURL}/api/v1/versions/${versionId}/download?format=${format}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-request-id': generatedId,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download version: ${response.statusText}`);
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.url) {
          // Azure file - redirect or trigger download
          const link = document.createElement("a");
          link.href = data.url;
          link.download = `version_${versionId}.${format}.zip`; // optional
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        } else {
          throw new Error("Download URL not found in response.");
        }
      }

      // Get the response as a blob
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `version_${versionId}.${format}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      setError(err.message || 'Error downloading version');
    } finally {
      setLoading(false);
    }
  }, []);

  return { downloadVersion, loading, error, taskId };
};
