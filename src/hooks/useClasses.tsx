import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { classesApi } from '@/components/classes/api';
import { useCurrentOrganization } from './useAuthHelpers';
import { AnnotationClass } from '@/types/classes';

export const useClassesApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { currentOrganization } = useCurrentOrganization();

  const fetchClasses = async (projectId: string): Promise<AnnotationClass[] | null> => {
    setIsLoading(true);
    setError(null);
    
    if (!currentOrganization) throw new Error("No organization selected");

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const classes = await classesApi.getClasses(currentOrganization.id, projectId);
      return classes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch classes';
      setError(new Error(errorMessage));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createClass = async (
    projectId: string,
    className: string, 
    color: string,
  ): Promise<AnnotationClass | null> => {
    setIsLoading(true);
    setError(null);
    
    if (!currentOrganization) throw new Error("No organization selected");

    try {
      const newClass = await classesApi.createClass(currentOrganization?.id, projectId, {
        name: className,
        color,
        count: 0
      });
      return newClass;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create class';
      setError(new Error(errorMessage));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateClass = async (
    projectId: string,
    class_id: string, 
    updates: Partial<AnnotationClass>
  ): Promise<AnnotationClass | null> => {
    setIsLoading(true);
    setError(null);
    
    if (!currentOrganization) throw new Error("No organization selected");
    try {
      const updatedClass = await classesApi.updateClass(
        currentOrganization.id,
        projectId,
        class_id,
        updates
      );

      return updatedClass;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update class';
      setError(new Error(errorMessage));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClass = async (projectId: string, id: string, hard_delete:boolean=false): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    if (!currentOrganization) throw new Error("No organization selected");

    try {
      await classesApi.deleteClass(
        currentOrganization?.id,
        projectId,
        id,
        hard_delete,
      );
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete class';
      setError(new Error(errorMessage));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    isLoading,
    error
  };
};

export const useClasses = (projectId?: string) => {
  const { fetchClasses } = useClassesApi();
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ["annotationClasses", projectId, currentOrganization?.id],
    queryFn: () => {
      if (!currentOrganization || !projectId) {
        throw new Error("Missing organization or project ID");
      }
      return fetchClasses(projectId);
    },
    enabled: !!projectId && !!currentOrganization,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};