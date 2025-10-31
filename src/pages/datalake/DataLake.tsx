
import React, { useState, useCallback } from "react";
import { toast } from "@/components/ui/ui/use-toast";
import { useImages, buildImageQuery } from "@/hooks/useImages";
import { ImageGrid } from "@/components/datalake/ImageGrid";
import { ImageTable } from "@/components/datalake/ImageTable";
import { Loader2 } from "lucide-react";
import { ViewMode, ImagesParams } from "@/types/image";
import { useAddImagesToProject } from '@/hooks/useAddImagesToProject';
import { useSearchParser } from '@/hooks/useSearchParser';
import { DataLakeHeader } from '@/components/datalake/DataLakeHeader';
import { DataLakeFilters } from '@/components/datalake/DataLakeFilters';
import { DataLakeSelectionHeader } from '@/components/datalake/DataLakeSelectionHeader';
import { useUserProjects } from '@/hooks/useUserProjects';

const DataLake: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { mutate: addImagesToProject } = useAddImagesToProject();

  const parsedQuery = useSearchParser(searchText);
  const _query = buildImageQuery(parsedQuery)

  // Build API params from parsed query
  const apiParams: ImagesParams = {
    limit: searchText ? 500 : 50,
    skip: 0,
    q: _query,
    search: parsedQuery.text,
    tag: parsedQuery.tags.join(','),
  };

  const { data, isLoading, error } = useImages(apiParams);
  const { data: projects, isLoading: isLoadingProjects, error: errorProjects } = useUserProjects();

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

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && data?.images) {
        setSelectedIds(new Set(data.images.map((img) => img.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [data?.images]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);


  const handleAddToProject = () => {
    if (selectedIds.size === 0 || !selectedProject) {
      toast({
        title: 'Selection required',
        description: 'Please select images and a project first.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    addImagesToProject(
      {
        project_id: selectedProject,
        image_ids: selectedImages,
      },
      {
        onSuccess: () => {
          // Clear selections after successful addition
          setSelectedImages([]);
          setSelectedProject('');
        },
      }
    );
  };

  if (error || errorProjects) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">Error loading images</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 w-full">
      <DataLakeHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalImages={data?.total || 0}
      />

      <DataLakeFilters searchText={searchText} onSearchChange={setSearchText} />

      <DataLakeSelectionHeader
        selectedCount={selectedIds.size}
        onClearSelection={handleClearSelection}
        onAddToProject={handleAddToProject}
        projects={projects ?? []}
        isLoadingProjects={false}
      />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !data?.images.length ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">No images found</p>
            <p className="text-sm text-muted-foreground">
              {searchText ? 'Try adjusting your search filters' : 'Upload images to get started'}
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <ImageGrid images={data.images} selectedIds={selectedIds} onSelect={handleSelect} />
      ) : (
        <ImageTable
          images={data.images}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
        />
      )}
    </div>
  );
};

export default DataLake;