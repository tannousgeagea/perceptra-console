import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { baseURL } from '../components/api/base';

interface ErrorDetail {
  type: string;
  loc: any;
  msg: string;
  input: any;
}

interface ErrorResponse {
  detail: string | ErrorDetail[]; // Can be a string or an array of objects
}

const useAddToDataset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const addToDataset = async (projectId: string, imageId: string | null = null) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(`${baseURL}/api/v1/projects/${projectId}/add-image`,
        {
          params: {
            image_id: imageId
          }
        }
      );

      if (response.status === 200) {
        setSuccess(true);
      }
    } catch (err) {
      const errorResponse = err as AxiosError<ErrorResponse>;
      let errorMessage = "An error occurred";
      if (errorResponse.response?.data?.detail) {
        if (typeof errorResponse.response.data.detail === "string") {
          errorMessage = errorResponse.response.data.detail;
        } else if (Array.isArray(errorResponse.response.data.detail)) {
          errorMessage = errorResponse.response.data.detail.map(e => e.msg).join(", ");
        }
      }
      setError(errorMessage || "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addToDataset, loading, error, success };
};

export default useAddToDataset;
