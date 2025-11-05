import { useState, useMemo } from 'react';
import { DatasetVersion, DatasetVersionsResponse, VersionStatistics, VersionCreate, VersionUpdate, VersionImageAdd } from '@/types/version';
import { ProjectImage } from '@/types/dataset';

// Mock data generator
const generateMockVersions = (): DatasetVersion[] => {
  const formats = ['yolo', 'coco', 'pascal_voc', 'tfrecord'];
  const statuses: Array<'pending' | 'processing' | 'completed' | 'failed'> = ['completed', 'completed', 'processing', 'completed', 'pending'];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `version-${i + 1}`,
    version_id: `v${i + 1}`,
    version_name: `v${i + 1}.${i % 3}-${['alpha', 'beta', 'release', 'prod'][i % 4]}`,
    version_number: i + 1,
    description: i % 2 === 0 ? `Training dataset for model iteration ${i + 1}` : null,
    export_format: formats[i % formats.length],
    export_status: statuses[i % statuses.length],
    total_images: 500 + i * 100,
    total_annotations: 2500 + i * 500,
    train_count: 350 + i * 70,
    val_count: 100 + i * 20,
    test_count: 50 + i * 10,
    file_size: statuses[i % statuses.length] === 'completed' ? 1024 * 1024 * (50 + i * 10) : null,
    is_ready: statuses[i % statuses.length] === 'completed',
    created_at: new Date(Date.now() - i * 86400000 * 7).toISOString(),
    exported_at: statuses[i % statuses.length] === 'completed' ? new Date(Date.now() - i * 86400000 * 6).toISOString() : null,
    created_by: ['admin', 'ml-engineer', 'data-scientist'][i % 3],
  }));
};

export const useDatasetVersions = (searchText: string = '') => {
  const [versions] = useState<DatasetVersion[]>(generateMockVersions());
  const [isLoading] = useState(false);

  const filteredVersions = useMemo(() => {
    if (!searchText.trim()) return versions;
    
    const query = searchText.toLowerCase();
    return versions.filter(v => 
      v.version_name.toLowerCase().includes(query) ||
      v.description?.toLowerCase().includes(query) ||
      v.export_format.toLowerCase().includes(query)
    );
  }, [versions, searchText]);

  return {
    data: {
      total: filteredVersions.length,
      versions: filteredVersions,
    } as DatasetVersionsResponse,
    isLoading,
    error: null,
  };
};

export const useVersionStatistics = (versionId: string) => {
  const [isLoading] = useState(false);
  
  const statistics = useMemo((): VersionStatistics => {
    // Mock statistics for the version
    return {
      total_images: 650,
      total_annotations: 3250,
      splits: {
        train: 455,
        val: 130,
        test: 65,
      },
      class_distribution: {
        'person': 1200,
        'car': 850,
        'truck': 450,
        'bicycle': 350,
        'motorcycle': 250,
        'bus': 150,
      },
      average_annotations_per_image: 5.0,
    };
  }, [versionId]);

  return {
    data: statistics,
    isLoading,
    error: null,
  };
};

// Mock mutation hooks
export const useCreateProjectVersion = () => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (data: VersionCreate) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    
    // In real implementation, this would create the version via API
    console.log('Creating version:', data);
    
    return {
      id: `version-${Date.now()}`,
      version_id: `v-${Date.now()}`,
      version_name: data.version_name,
      description: data.description,
      export_format: data.export_format,
    };
  };

  return {
    mutate,
    isLoading,
    error: null,
  };
};

export const useUpdateProjectVersion = (versionId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (data: VersionUpdate) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    
    // In real implementation, this would update the version via API
    console.log('Updating version:', versionId, data);
    
    return {
      id: versionId,
      ...data,
    };
  };

  return {
    mutate,
    isLoading,
    error: null,
  };
};

// Mock version images data
interface VersionImage extends ProjectImage {
  split: 'train' | 'val' | 'test';
  added_at: string;
  annotation_count: number;
}

const generateMockVersionImages = (versionId: string): VersionImage[] => {
  const splits: Array<'train' | 'val' | 'test'> = ['train', 'train', 'train', 'val', 'val', 'test'];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `img-${versionId}-${i + 1}`,
    image_id: `img-${i + 1}`,
    name: `image_${String(i + 1).padStart(4, '0')}.jpg`,
    original_filename: `IMG_${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}.jpg`,
    width: 1920,
    height: 1080,
    aspect_ratio: 16 / 9,
    file_format: 'jpg',
    file_size: 2048000 + Math.floor(Math.random() * 1024000),
    file_size_mb: 2.5,
    megapixels: 2.1,
    storage_key: `storage/images/img-${i + 1}.jpg`,
    checksum: `md5-${i}`,
    source_of_origin: 'upload',
    created_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    uploaded_by: 'user-1',
    tags: ['dataset-v1', splits[i % splits.length]],
    storage_profile: {
      id: 'profile-1',
      name: 'Primary Storage',
      backend: 's3',
    },
    download_url: `https://picsum.photos/seed/${versionId}-${i}/800/600`,
    status: 'annotated' as const,
    annotated: true,
    reviewed: Math.random() > 0.5,
    marked_as_null: false,
    priority: Math.floor(Math.random() * 5),
    job_assignment_status: null,
    added_at: new Date(Date.now() - Math.random() * 10 * 86400000).toISOString(),
    annotations: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
      id: `ann-${i}-${j}`,
      annotation_uid: `uid-${i}-${j}`,
      type: 'bbox',
      class_id: `class-${j % 3}`,
      class_name: ['person', 'car', 'truck'][j % 3],
      color: ['#22c55e', '#3b82f6', '#f59e0b'][j % 3],
      data: [0, 0, 1, 1],
      source: 'manual',
      confidence: 0.95,
      reviewed: true,
      is_active: true,
      created_at: new Date().toISOString(),
      created_by: 'user-1',
    })),
    split: splits[i % splits.length],
    annotation_count: Math.floor(Math.random() * 5) + 1,
  }));
};

export const useVersionImages = (versionId: string, searchText: string = '') => {
  const [images] = useState<VersionImage[]>(generateMockVersionImages(versionId));
  const [isLoading] = useState(false);

  const filteredImages = useMemo(() => {
    if (!searchText.trim()) return images;
    
    const query = searchText.toLowerCase();
    return images.filter(img => 
      img.name.toLowerCase().includes(query) ||
      img.split.toLowerCase().includes(query)
    );
  }, [images, searchText]);

  return {
    data: filteredImages,
    isLoading,
    error: null,
  };
};

export const useAvailableProjectImages = (versionId: string, searchText: string = '') => {
  const [images] = useState<ProjectImage[]>(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: `available-${i + 1}`,
      image_id: `avail-img-${i + 1}`,
      name: `available_image_${String(i + 1).padStart(4, '0')}.jpg`,
      original_filename: `IMG_${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}.jpg`,
      width: 1920,
      height: 1080,
      aspect_ratio: 16 / 9,
      file_format: 'jpg',
      file_size: 2048000,
      file_size_mb: 2.0,
      megapixels: 2.1,
      storage_key: `storage/images/avail-${i + 1}.jpg`,
      checksum: `md5-avail-${i}`,
      source_of_origin: 'upload',
      created_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      uploaded_by: 'user-1',
      tags: ['available'],
      storage_profile: {
        id: 'profile-1',
        name: 'Primary Storage',
        backend: 's3',
      },
      download_url: `https://picsum.photos/seed/avail-${i}/800/600`,
      status: 'annotated' as const,
      annotated: true,
      reviewed: false,
      marked_as_null: false,
      priority: 0,
      job_assignment_status: null,
      added_at: new Date().toISOString(),
      annotations: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
        id: `ann-avail-${i}-${j}`,
        annotation_uid: `uid-avail-${i}-${j}`,
        type: 'box',
        class_id: `class-${j % 3}`,
        class_name: ['person', 'car', 'truck'][j % 3],
        color: ['#22c55e', '#3b82f6', '#f59e0b'][j % 3],
        data: [0, 0, 1, 1],
        source: 'manual',
        confidence: 0.95,
        reviewed: true,
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: 'user-1',
      })),
    }))
  );
  const [isLoading] = useState(false);

  const filteredImages = useMemo(() => {
    if (!searchText.trim()) return images;
    
    const query = searchText.toLowerCase();
    return images.filter(img => img.name.toLowerCase().includes(query));
  }, [images, searchText]);

  return {
    data: filteredImages,
    isLoading,
    error: null,
  };
};

export const useAddImagesToVersion = (versionId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (data: VersionImageAdd) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    
    console.log('Adding images to version:', versionId, data);
    
    return { success: true };
  };

  return {
    mutate,
    isLoading,
    error: null,
  };
};

export const useRemoveImagesFromVersion = (versionId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (imageIds: string[]) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsLoading(false);
    
    console.log('Removing images from version:', versionId, imageIds);
    
    return { success: true };
  };

  return {
    mutate,
    isLoading,
    error: null,
  };
};
