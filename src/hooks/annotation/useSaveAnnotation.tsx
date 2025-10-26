import { useState } from 'react';
import { baseURL } from '../../components/api/base';

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

const useSaveAnnotation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const saveAnnotation = async (annotation: Annotation, projectID: string, imageID: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${baseURL}/api/v1/annotations/${projectID}/${imageID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(annotation),
      });

      if (!response.ok) {
        throw new Error(`Failed to save annotation: ${response.statusText}`);
      }

      setSuccess(true);
      console.log(`Annotation ${annotation.id} saved successfully!`);
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
      console.error('Error saving annotation:', err);
    } finally {
      setLoading(false);
    }
  };

  return { saveAnnotation, loading, error, success };
};

export default useSaveAnnotation;
