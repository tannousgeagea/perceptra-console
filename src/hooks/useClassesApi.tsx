import { useState } from 'react';
import { classesApi } from '@/components/classes/api';
import { AnnotationClass } from '@/contexts/ClassesContext';

export const useClassesApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchClasses = async (projectId: string): Promise<AnnotationClass[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const classes = await classesApi.getClasses(projectId);
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
    
    try {
      const newClass = await classesApi.createClass(projectId, {
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
    id: string, 
    updates: Partial<AnnotationClass>
  ): Promise<AnnotationClass | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedClass = await classesApi.updateClass(id, updates);
      return updatedClass;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update class';
      setError(new Error(errorMessage));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClass = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await classesApi.deleteClass(id);
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