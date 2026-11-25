import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useClassesApi } from '@/hooks/useClasses';
import { toast } from '@/hooks/use-toast';
import { useProject } from './ProjectContext';
import { AnnotationClass } from '@/types/classes';
import type { DeleteClassChoice } from '@/components/classes/api';
export type { AnnotationClass };

interface ClassesContextType {
  classes: AnnotationClass[];
  addClass: (className: string, color?: string) => void;
  /** Resolves once the server saved it; rejects (after a toast) otherwise. */
  updateClass: (id: string, updates: Partial<AnnotationClass>) => Promise<void>;
  /** Resolves once the server deleted it; rejects (after a toast) otherwise. */
  deleteClass: (id: string, choice?: DeleteClassChoice) => Promise<void>;
  getClassById: (id: string) => AnnotationClass | undefined;
  getClassByName: (name: string) => AnnotationClass | undefined;
  isLoading: boolean;
  error: Error | null;
  refreshClasses: () => Promise<void>;
}

const ClassesContext = createContext<ClassesContextType | undefined>(undefined);

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#FACC15', // yellow
  '#2DD4BF', // teal
  '#F97316', // orange
  '#8B5CF6', // purple
  '#EF4444', // red
  '#A3E635', // lime
];

export const ClassesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { projectId } = useProject();
  const [classes, setClasses] = useState<AnnotationClass[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const { 
    fetchClasses, 
    createClass, 
    updateClass: apiUpdateClass, 
    deleteClass: apiDeleteClass,
    isLoading,
    error
  } = useClassesApi();
  
  // Load classes from the API only once at initialization
  const loadClasses = useCallback(async (projectId: string) => {
    if (isInitialized) return;
    
    try {
      const fetchedClasses = await fetchClasses(projectId);
      if (fetchedClasses) {
        setClasses(fetchedClasses);
        // Also save to localStorage as a backup
        localStorage.setItem('annotationClasses', JSON.stringify(fetchedClasses));
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading classes:", error);
      // Try to load from localStorage as fallback
      const savedClasses = localStorage.getItem('annotationClasses');
      if (savedClasses) {
        try {
          const parsedClasses = JSON.parse(savedClasses);
          setClasses(parsedClasses);
          toast({
            title: "Using cached classes",
            description: "Could not connect to server, using locally saved classes.",
            variant: "default"
          });
        } catch (e) {
          console.error("Error parsing saved classes:", e);
        }
      }
      setIsInitialized(true);
    }
  }, [fetchClasses, isInitialized]);
  
  // Load classes on initial mount only
  useEffect(() => {
    if (!isInitialized) {
      loadClasses(projectId || '');
    }
  }, [loadClasses, isInitialized, projectId]);
  
  // Get the next color from the color palette
  const getNextColor = (): string => {
    const usedColors = classes.map(c => c.color);
    const availableColors = DEFAULT_COLORS.filter(c => !usedColors.includes(c));
    
    if (availableColors.length > 0) {
      return availableColors[0];
    }
    
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  };
  
  // Add a new class
  const addClass = async (className: string, color: string = getNextColor()) => {
    try {
      const newClass = await createClass(projectId, className, color);
      if (newClass) {
        setClasses(prev => [...prev, newClass]);
        // Update localStorage
        localStorage.setItem('annotationClasses', JSON.stringify([...classes, newClass]));
      }
    } catch (error) {
      console.error("Error adding class:", error);
      toast({
        title: "Error adding class",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  // Update an existing class
  const updateClass = async (id: string, updates: Partial<AnnotationClass>) => {
    try {
      const updatedClass = await apiUpdateClass(
        projectId,
        id, 
        updates
      );
      if (updatedClass) {
        const updatedClasses = classes.map(c => 
          String(c.classId) === id ? { ...c, ...updatedClass } : c
        );
        setClasses(updatedClasses);
        // Update localStorage
        localStorage.setItem('annotationClasses', JSON.stringify(updatedClasses));
      }
    } catch (error) {
      toast({
        title: "Couldn't update the class",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Delete a class
  const deleteClass = async (id: string, choice?: DeleteClassChoice) => {
    const classToDelete = classes.find(c => String(c.classId) === id);
    if (!classToDelete) return;

    try {
      const result = await apiDeleteClass(projectId, id, choice);
      const updatedClasses = classes.filter(c => String(c.classId) !== id);
      setClasses(updatedClasses);
      localStorage.setItem('annotationClasses', JSON.stringify(updatedClasses));
      toast({ title: "Class deleted", description: result.message });
      // Moved annotations change the receiving class's count: reload from the server.
      if (result.moved > 0) {
        setIsInitialized(false);
      }
    } catch (error) {
      toast({
        title: `Couldn't delete ${classToDelete.name}`,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Force refresh of classes from the server
  const refreshClasses = async () => {
    setIsInitialized(false);
    await loadClasses(projectId || '');
  };
  
  // Helper functions
  const getClassById = (id: string) => classes.find(c => c.id === id);
  const getClassByName = (name: string) => classes.find(c => c.name === name);
  
  return (
    <ClassesContext.Provider
      value={{
        classes,
        addClass,
        updateClass,
        deleteClass,
        getClassById,
        getClassByName,
        isLoading,
        error,
        refreshClasses
      }}
    >
      {children}
    </ClassesContext.Provider>
  );
};

export const useClasses = () => {
  const context = useContext(ClassesContext);
  if (context === undefined) {
    throw new Error('useClasses must be used within a ClassesProvider');
  }
  return context;
};
