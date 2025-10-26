import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { baseURL } from "@/components/api/base";

const useFetchData = (url: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseURL}${url}`);
      setData(response.data);
    } catch (err) {
      setError((err as Error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetchData;