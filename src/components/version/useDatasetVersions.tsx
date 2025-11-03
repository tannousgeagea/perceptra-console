import { useState, useMemo } from 'react';
import { DatasetVersion, DatasetVersionsResponse, VersionStatistics } from '@/types/version';

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