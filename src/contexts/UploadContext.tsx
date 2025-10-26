
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { baseURL } from '@/components/api/base';
import { useProject } from './ProjectContext';

export type TaskType = 'segmentation' | 'detection' | 'classification';
export type ProjectSection = 'upload' | 'annotate' | 'dataset' | 'versions' | 'analytics';

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  projectId: string;
  tasks: TaskType[];
  uploadedAt: Date;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  batchId?: string;
}

export interface AnnotationFile {
  id: string;
  file: File;
  taskType: TaskType;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

interface UploadContextType {
  currentProject: Project | null;
  currentSection: ProjectSection;
  uploadedImages: UploadedImage[];
  annotationFiles: AnnotationFile[];
  uploadProgress: number;
  isUploading: boolean;
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  addAnnotationFile: (file: File, taskType: TaskType) => void;
  removeAnnotationFile: (id: string) => void;
  setCurrentProject: (project: Project) => void;
  setCurrentSection: (section: ProjectSection) => void;
  clearAllImages: () => void;
  submitUpload: (projectId: string, navigate: (path: string) => void) => Promise<void>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUploadContext = () => {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUploadContext must be used within an UploadProvider');
  }
  return context;
};

// Mock project data - in a real app, this would come from an API
const MOCK_PROJECT: Project = {
  id: 'project-1',
  name: 'Wildlife Classification',
  description: 'Image classification project for wildlife species',
  createdAt: new Date()
};

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for project context
  const { projectId } = useProject();
  const [currentProject, setCurrentProject] = useState<Project | null>({
    id: projectId,
    name: projectId,
    description: '',
    createdAt: new Date(), // or new Date(0)
  });
  const [currentSection, setCurrentSection] = useState<ProjectSection>('upload');
  
  // State for uploaded files
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [annotationFiles, setAnnotationFiles] = useState<AnnotationFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const addImages = (files: File[]) => {
    if (!currentProject) return;
    
    const batchId = `batch-${Date.now()}`;
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      projectId: currentProject.id,
      tasks: [] as TaskType[],
      uploadedAt: new Date(),
      progress: 0,
      status: 'pending' as const,
      batchId: batchId
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
  };;

  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const addAnnotationFile = (file: File, taskType: TaskType) => {
    if (!currentProject) return;
    
    const newAnnotation = {
      id: Math.random().toString(36).substring(2, 9),
      file,
      taskType,
      projectId: currentProject.id,
    };

    setAnnotationFiles(prev => [...prev, newAnnotation]);
  };

  const removeAnnotationFile = (id: string) => {
    setAnnotationFiles(prev => prev.filter(anno => anno.id !== id));
  };

  const clearAllImages = () => {
    // Clean up object URLs to prevent memory leaks
    uploadedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setUploadedImages([]);
  };

  const updateFileStatus = useCallback(
    (id: string, status: UploadedImage['status'], progress = 0, error?: string) => {
      setUploadedImages((prevFiles) =>
        prevFiles.map((file) =>
          file.id === id
            ? {
                ...file,
                status,
                progress: progress || file.progress,
                error: error || file.error,
              }
            : file
        )
      );
    },
    []
  );

  const uploadImageToAPI = async (image: UploadedImage, progress: (percent: number) => void): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('files', image.file);
    
      console.log(image)
      const url = `${baseURL}/api/v1/images?image_id=${image.id}&project_id=${image.projectId}&batch_id=${image.batchId}`;  
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', url, true);
      xhr.setRequestHeader('accept', 'application/json');
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          progress(percentComplete);
        }
      };
      
      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(true);
          } else {
            console.error('Upload failed:', xhr.statusText);
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = () => {
          console.error('Network error during upload');
          reject(new Error('Network error during upload'));
        };
        
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return false;
    }
  };

  const submitUpload = async (projectId: string, navigate: (path: string) => void) => {
    if (uploadedImages.length === 0) return;
  
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalImages = uploadedImages.length;
      const progressIncrement = 100 / totalImages;
      let overallProgress = 0;
  
      const uploadImageAsync = async (image: UploadedImage) => {
        updateFileStatus(image.id, 'uploading', 0);
  
        await new Promise((resolve) => {
          let currentProgress = 0;
          const interval = setInterval(() => {
            currentProgress += 10;
            if (currentProgress >= 90) {
              clearInterval(interval);
              resolve(null);
            }
            updateFileStatus(image.id, 'uploading', currentProgress);
          }, 150);
        });
  
        const success = await uploadImageToAPI(image, (percentForCurrentImage) => {
          updateFileStatus(image.id, 'uploading', percentForCurrentImage);
        });
  
        if (success) {
          updateFileStatus(image.id, 'success', 100);
        } else {
          updateFileStatus(image.id, 'error', 0, 'Upload failed');
        }
  
        overallProgress += progressIncrement;
        setUploadProgress(Math.min(Math.round(overallProgress), 100));
      };
  
      await Promise.all(uploadedImages.map((image) => uploadImageAsync(image)));
      console.log('All images uploaded successfully for project:', currentProject?.name);
      
      if (projectId) {
        setTimeout(() => navigate(`/projects/${projectId}/annotate`), 2000);
      }

    } catch (error) {
      console.error('Error during upload:', error);
  
      // Mark all remaining images as failed
      uploadedImages.forEach(image => {
        updateFileStatus(image.id, 'error', 0, 'Upload interrupted');
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 2000);
    }
  };

  const value = {
    currentProject,
    currentSection,
    uploadedImages,
    annotationFiles,
    uploadProgress,
    isUploading,
    addImages,
    removeImage,
    addAnnotationFile,
    removeAnnotationFile,
    setCurrentProject,
    setCurrentSection,
    clearAllImages,
    submitUpload
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
};
