import { useState, useCallback } from 'react';
import { ProjectImage } from '@/components/project-dataset/types';

interface JobImagesData {
  total: number;
  unannotated: number;
  annotated: number;
  reviewed: number;
  images: ProjectImage[];
}

// Mock data generator
const generateMockJobImages = (): ProjectImage[] => {
  const statuses: ('unannotated' | 'annotated' | 'reviewed')[] = ['unannotated', 'annotated', 'reviewed'];
  
  return Array.from({ length: 30 }, (_, i) => {
    const status = statuses[i % 3];
    const hasAnnotations = status !== 'unannotated';
    
    return {
      id: `job-img-${i + 1}`,
      image_id: `img-${i + 1}`,
      name: `000${String(i).padStart(2, '0')}${i % 2 === 0 ? '20' : '19'}.jpg`,
      original_filename: `IMG_${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}.jpg`,
      width: 1920,
      height: 1080,
      aspect_ratio: 16 / 9,
      file_format: 'jpg',
      file_size: 2048000,
      file_size_mb: 2.0,
      megapixels: 2.1,
      storage_key: `storage/images/job-${i + 1}.jpg`,
      checksum: `md5-${i}`,
      source_of_origin: 'upload',
      created_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      uploaded_by: 'user-1',
      tags: [],
      storage_profile: {
        id: 'profile-1',
        name: 'Primary Storage',
        backend: 's3',
      },
      download_url: `https://picsum.photos/seed/job-${i}/800/600`,
      status,
      annotated: hasAnnotations,
      reviewed: status === 'reviewed',
      marked_as_null: false,
      priority: 0,
      job_assignment_status: 'assigned',
      added_at: new Date().toISOString(),
      annotations: hasAnnotations ? Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
        id: `ann-${i}-${j}`,
        annotation_uid: `uid-${i}-${j}`,
        type: 'bbox',
        class_id: `class-${j % 3}`,
        class_name: ['person', 'car', 'truck'][j % 3],
        color: ['#22c55e', '#3b82f6', '#f59e0b'][j % 3],
        data: {},
        source: 'manual',
        confidence: 0.95,
        reviewed: status === 'reviewed',
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: 'user-1',
      })) : [],
    };
  });
};

export function useJobImages() {
  const [images, setImages] = useState<ProjectImage[]>(generateMockJobImages());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const data: JobImagesData = {
    total: images.length,
    unannotated: images.filter(img => img.status === 'unannotated').length,
    annotated: images.filter(img => img.status === 'annotated').length,
    reviewed: images.filter(img => img.status === 'reviewed').length,
    images,
  };

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setImages(generateMockJobImages());
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateImageStatus = useCallback(async (
    imageId: string,
    newStatus: 'unannotated' | 'annotated' | 'reviewed'
  ) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        return {
          ...img,
          status: newStatus,
          annotated: newStatus !== 'unannotated',
          reviewed: newStatus === 'reviewed',
          annotations: newStatus === 'unannotated' ? [] : (
            img.annotations.length > 0 ? img.annotations : [
              {
                id: `ann-${imageId}-1`,
                annotation_uid: `uid-${imageId}-1`,
                type: 'bbox',
                class_id: 'class-0',
                class_name: 'person',
                color: '#22c55e',
                data: {},
                source: 'manual',
                confidence: 0.95,
                reviewed: newStatus === 'reviewed',
                is_active: true,
                created_at: new Date().toISOString(),
                created_by: 'user-1',
              }
            ]
          ),
        };
      }
      return img;
    }));

    console.log(`Updated image ${imageId} to status: ${newStatus}`);
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
    updateImageStatus,
  };
}
