
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectImages } from '@/hooks/useProjectImages';
import { ProjectDatasetHeader } from '@/components/dataset/ProjectDatasetHeader';
import { ProjectDatasetFilters } from '@/components/dataset/ProjectDatasetFilters';
import { ProjectImageGrid } from '@/components/dataset/ProjectImageGrid';
import { ProjectImageTable } from '@/components/dataset/ProjectImageTable';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useSearchParser } from '@/hooks/useSearchParser';
import { buildImageQuery } from '@/hooks/useImages';

export default function ProjectDataset() {
  
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAnnotations, setShowAnnotations] = useState(true);

  const parsedQuery = useSearchParser(searchText);
  const _query = buildImageQuery(parsedQuery)

  const { data, isLoading, error, refetch } = useProjectImages(projectId!, {
    q: _query,
    limit: 100,
  });

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="p-6 space-y-6">
        <ProjectDatasetHeader
          projectId={projectId!}
          total={data?.total || 0}
          annotated={data?.annotated || 0}
          unannotated={data?.unannotated || 0}
          reviewed={data?.reviewed || 0}
          selectedCount={selectedIds.size}
          onRefresh={handleRefresh}
          onUpload={() => navigate(`/projects/${projectId}/upload`)}
        />

        <ProjectDatasetFilters
          searchText={searchText}
          onSearchChange={setSearchText}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showAnnotations={showAnnotations}
          onShowAnnotationsChange={setShowAnnotations}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load project images. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : data?.images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No images found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <ProjectImageGrid
            images={data?.images || []}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            showAnnotations={showAnnotations}
          />
        ) : (
          <ProjectImageTable
            images={data?.images || []}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={(checked) => {
              if (checked) {
                setSelectedIds(new Set(data?.images.map(img => img.id) || []));
              } else {
                setSelectedIds(new Set());
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
