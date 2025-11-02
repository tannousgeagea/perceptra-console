
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import {v4 as uuidv4} from 'uuid';

export type TaskType = 'segmentation' | 'detection' | 'classification';
export type ProjectSection = 'upload' | 'annotate' | 'dataset' | 'versions' | 'analytics';

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
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
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

interface UploadContextType {
  currentSection: ProjectSection;
  uploadedImages: UploadedImage[];
  annotationFiles: AnnotationFile[];
  uploadProgress: number;
  isUploading: boolean;
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  addAnnotationFile: (file: File, taskType: TaskType) => void;
  removeAnnotationFile: (id: string) => void;
  setCurrentSection: (section: ProjectSection) => void;
  clearAllImages: () => void;
  submitUpload: (
    navigate: (path: string) => void,
    options?: {
      projectId?: string;
      tags?: string[];
      source_of_origin?: string;
      storage_profile_id?: string;
      redirect?: boolean;
    }
  ) => Promise<void>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUploadContext = () => {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUploadContext must be used within an UploadProvider');
  }
  return context;
};

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for project context
  const { currentOrganization } = useCurrentOrganization();
  const [currentSection, setCurrentSection] = useState<ProjectSection>('upload');
  
  // State for uploaded files
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [annotationFiles, setAnnotationFiles] = useState<AnnotationFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const addImages = (files: File[]) => {
    
    const batchId = `batch-${Date.now()}`;
    const newImages = files.map(file => ({
      id: uuidv4(),
      file,
      previewUrl: URL.createObjectURL(file),
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
    const newAnnotation = {
      id: Math.random().toString(36).substring(2, 9),
      file,
      taskType,
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

  const uploadImageToAPI = async (
    image: UploadedImage, 
    progress: (percent: number) => void,
    options?: {
      projectId?: string;
      tags?: string[];
      source_of_origin?: string;
      storage_profile_id?: string;
    }
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('file', image.file);
    
      if (image.id) formData.append('image_id', image.id);
      if (image.batchId) formData.append('batch_id', image.batchId);
      if (options?.projectId) formData.append('project_id', options.projectId);
      if (options?.tags?.length) formData.append('tags', options.tags.join(','));
      if (options?.source_of_origin) formData.append('source_of_origin', options.source_of_origin);
      if (options?.storage_profile_id) formData.append('storage_profile_id', options.storage_profile_id);


      // Authentication
      const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      const organizationId = currentOrganization?.id;

      if (!token || !organizationId) {
        throw new Error("Missing authentication or organization context");
      }

      const xhr = new XMLHttpRequest();
      const url = `${baseURL}/api/v1/images/upload`;
      
      xhr.open('POST', url, true);
      xhr.setRequestHeader('accept', 'application/json');
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("X-Organization-ID", currentOrganization.id);

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

  const submitUpload = async ( 
    navigate: (path: string) => void,
    options?: {
      projectId?: string,
      tags?: string[];
      source_of_origin?: string;
      storage_profile_id?: string;
      redirect?: boolean;
    }
  ) => {
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
  
        const success = await uploadImageToAPI(
          image,
          (percentForCurrentImage) => {
            updateFileStatus(image.id, 'uploading', percentForCurrentImage);
          },
          {
            projectId: options?.projectId,
            tags: options?.tags,
            source_of_origin: options?.source_of_origin,
            storage_profile_id: options?.storage_profile_id,
          }
        );
  
        if (success) {
          updateFileStatus(image.id, 'success', 100);
        } else {
          updateFileStatus(image.id, 'error', 0, 'Upload failed');
        }
  
        overallProgress += progressIncrement;
        setUploadProgress(Math.min(Math.round(overallProgress), 100));
      };
  
      await Promise.all(uploadedImages.map((image) => uploadImageAsync(image)));
      
      if (options?.redirect !== false && options?.projectId) {
        setTimeout(() => navigate(`/projects/${options.projectId}/annotate`), 2000);
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
    currentSection,
    uploadedImages,
    annotationFiles,
    uploadProgress,
    isUploading,
    addImages,
    removeImage,
    addAnnotationFile,
    removeAnnotationFile,
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
