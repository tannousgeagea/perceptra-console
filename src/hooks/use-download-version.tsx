import { useState } from "react";
import axios, { AxiosError } from "axios";
import { baseURL } from "@/components/api/base";

interface ErrorResponse {
  detail: string;
}

export const useDownloadVersion = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const downloadVersion = async (projectId: string, versionId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<{ download_url: string }>(
        `${baseURL}/api/v1/projects/${projectId}/versions/${versionId}/download`,
      );

      if (response.data.download_url) {
        // Redirect the user to the file URL (stored in Azure)
        window.location.href = response.data.download_url;
      } else {
        throw new Error("No download URL received.");
      }

    } catch (err) {
      const errorResponse = err as AxiosError<ErrorResponse>;
      setError(errorResponse.response?.data?.detail || "Failed to download version.");
    } finally {
      setLoading(false);
    }
  };

  return { downloadVersion, loading, error };
};