import { useState } from "react";
import { baseURL } from "@/components/api/base";

// interface Annotation {
//     id: number;
//     project_image_id: number;
//     annotation_type: string;
//     annotation_class: string;
//     data: Array<{ x: number; y: number; width: number; height: number, label:string }>;
//     created_at: string;
//     created_by?: string;
//     reviewed: boolean;
//     is_active: boolean;
//   }

const useFetchAnnotations = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnnotations = async (imageID: string, projectId: string) => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${baseURL}/api/v1/annotations/${projectId}/${imageID}`);
          if (!response.ok) {
            throw new Error('Failed to fetch annotations');
          }
          const data = await response.json()
          setLoading(false);
          return data;
        } catch (err) {
          setError((err as Error).message || 'An error occurred');
        };
      };


    return { fetchAnnotations, loading, error, refetch: fetchAnnotations };
}

export default useFetchAnnotations;