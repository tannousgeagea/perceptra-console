import { useState } from "react";
import axios, { AxiosError } from "axios";
import { baseURL } from "@/components/api/base";

interface ErrorResponse {
  detail: string;
}

export const useRequestFeedback = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const requestFeedback = async (projectName: string, imageId: string | null = null): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${baseURL}/api/v1/projects/${projectName}/feedback`,
        {
          params: { image_id: imageId },
        }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorResponse = err as AxiosError<ErrorResponse>;
      setError(errorResponse.response?.data?.detail || "An error occurred");
      throw err;
    }
  };

  return { requestFeedback, loading, error };
};