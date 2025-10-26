import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useClassesApi } from '@/hooks/useClassesApi';
import { toast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { useProject } from './ProjectContext';

export interface AnnotationClass {
  id: string;
  classId?: number;
  name: string;
  color: string;
  count: number;
}

interface ClassesContextType {
  classes: AnnotationClass[];
  addClass: (className: string, color?: string) => void;
  updateClass: (id: string, updates: Partial<AnnotationClass>) => void;
  deleteClass: (id: string) => void;
  getClassById: (id: string) => AnnotationClass | undefined;
  getClassByName: (name: string) => AnnotationClass | undefined;
  classesLocked: boolean;
  setClassesLocked: (locked: boolean) => void;
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
  const [classesLocked, setClassesLocked] = useState<boolean>(false);
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
    if (classesLocked) {
      toast({
        title: "Classes are locked",
        description: "Unlock classes to make changes.",
        variant: "destructive"
      });
      return;
    }
    
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
    if (classesLocked) {
      toast({
        title: "Classes are locked",
        description: "Unlock classes to make changes.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updatedClass = await apiUpdateClass(id, updates);
      if (updatedClass) {
        const updatedClasses = classes.map(c => 
          c.id === id ? { ...c, ...updatedClass } : c
        );
        setClasses(updatedClasses);
        // Update localStorage
        localStorage.setItem('annotationClasses', JSON.stringify(updatedClasses));
      }
    } catch (error) {
      console.error("Error updating class:", error);
      toast({
        title: "Error updating class",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  // Delete a class
  const deleteClass = async (id: string) => {
    if (classesLocked) {
      toast({
        title: "Classes are locked",
        description: "Unlock classes to make changes.",
        variant: "destructive"
      });
      return;
    }
    
    const classToDelete = classes.find(c => c.id === id);
    if (!classToDelete) return;
    
    try {
      await apiDeleteClass(id);
      const updatedClasses = classes.filter(c => c.id !== id);
      setClasses(updatedClasses);
      // Update localStorage
      localStorage.setItem('annotationClasses', JSON.stringify(updatedClasses));
      
      toast({
        title: "Class deleted",
        description: `${classToDelete.name} has been removed`,
      });
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error deleting class",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
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
        classesLocked,
        setClassesLocked,
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
