import { useState } from 'react';
import { baseURL } from '../../components/api/base';

const useDeleteAnnotation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const deleteAnnotation = async (annotationID: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${baseURL}/api/v1/annotations/${annotationID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to save annotation: ${response.statusText}`);
      }

      setSuccess(true);
      console.log(`Annotation ${annotationID} deleted successfully!`);
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
      console.error('Error saving annotation:', err);
    } finally {
      setLoading(false);
    }
  };

  return { deleteAnnotation, loading, error, success };
};

export default useDeleteAnnotation;
