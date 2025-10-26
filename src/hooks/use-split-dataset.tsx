import { useState } from 'react';
import axios from 'axios';
import { baseURL } from '@/components/api/base';
import { AxiosError } from 'axios';

interface ErrorResponse {
    detail: string;
}

export const useSplitDataset = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const splitDataset = async (projectId: string, trainRatio: number = 0.7): Promise<any> => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                `${baseURL}/api/v1/projects/${projectId}/split?train_ratio=${trainRatio}`,
                {}
            );
            setLoading(false);
            return response.data;
        } catch (err) {
      const errorResponse = err as AxiosError<ErrorResponse>;
      setError(errorResponse.response?.data?.detail || "An error occurred");
            throw err;
        }
    };

    return { splitDataset, loading, error };
};