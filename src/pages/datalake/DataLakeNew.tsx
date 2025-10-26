
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/ui/button";
import { toast } from "@/components/ui/ui/use-toast";
import { useImages } from "@/hooks/useImages";
import { mockImages, sources } from "@/components/datalake/mockImages"
import SearchFilter from "@/components/datalake/SearchFilter";
import SourceFilter from "@/components/datalake/SourceFilter";
import SortControl from "@/components/datalake/SortControl";
import TagFilter from "@/components/datalake/TagFilter";
import SelectionHeader from "@/components/datalake/SelectionHeader";
import ImageGrid from "@/components/datalake/ImageGrid";
import ImageTable from "@/components/datalake/ImageTable";
import ViewToggle from "@/components/datalake/ViewToggle";
import NoResults from "@/components/datalake/NoResults";
import { Loader } from "lucide-react";
import useFetchData from "@/hooks/use-fetch-data";
import { useAddImagesToProject } from '@/hooks/useAddImagesToProject';
import { parseQueryString, formatQueryAsTagParams, ParsedQuery } from "@/utils/queryParse";


interface Project {
    id: string;
    name: string;
}

// Available tags from all images
const allTags = Array.from(
  new Set(mockImages.flatMap(img => img.tags))
).sort();

const DataLake: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState<string | undefined>(undefined);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery>({});
  const [view, setView] = useState<"grid" | "table">("grid");
  const { mutate: addImagesToProject } = useAddImagesToProject();

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setParsedQuery(parseQueryString(searchTerm));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle removing a specific filter from the search
  const handleRemoveFilter = (key: string) => {
    // Create a new search string without the removed filter
    const newSearchTerms = Object.entries(parsedQuery)
      .filter(([k]) => k !== key)
      .map(([k, v]) => {
        // Add quotes if the value contains spaces
        const formattedValue = v.includes(' ') ? `"${v}"` : v;
        return `${k}:${formattedValue}`;
      })
      .join(' ');
    
    setSearchTerm(newSearchTerms);
  };

  // Format tag filters from parsed query
  const tagFiltersFromQuery = formatQueryAsTagParams(parsedQuery);
  
  // Combine text-based tag filters with UI-selected tag filters
  const combinedTagFilters = [...filterTags, ...tagFiltersFromQuery];

  // Extract text search term if present
  const textSearchTerm = parsedQuery.text || '';
  const { data: projects, loading: loadingProjects, error: errorProjects } = useFetchData('/api/v1/projects');
  const projectsData: Project[] = projects?.data || [];

  const isSearching = searchTerm.trim() !== "" || filterTags.length > 0 || Object.keys(parsedQuery).length > 0;
  const dynamicLimit = isSearching ? 500 : 50;
  const { data: images, isLoading, isError } = useImages({
    source: filterSource,
    name: textSearchTerm || undefined,
    tag: filterTags.length > 0 ? filterTags[0] : undefined,
    limit: dynamicLimit,
    parsedQuery: combinedTagFilters,
  });  

  const toggleImageSelection = (image_id: string) => {
    setSelectedImages(prev => 
      prev.includes(image_id) 
        ? prev.filter(imgId => imgId !== image_id)
        : [...prev, image_id]
    );
  };

  const toggleSelectAll = () => {
    const displayedImages = images?.data || [];
    if (selectedImages.length === displayedImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(displayedImages.map(img => img.image_id));
    }
  };

  const toggleFilterTag = (tag: string) => {
    setFilterTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterSource(undefined);
    setFilterTags([]);
  };
  
  const handleImageClick = (image: typeof mockImages[0]) => {
    // If the image has a project ID, navigate to the image detail within that project
    if (image.projectId) {
      navigate(`/projects/${image.projectId}/images/${image.id}`);
    } else {
      // Show a toast notifying that this image isn't in a project yet
      toast({
        title: "Image not in a project",
        description: "Add this image to a project to view and annotate it.",
        duration: 3000,
      });
    }
  };

  const handleAddToProject = () => {
    if (selectedImages.length === 0 || !selectedProject) {
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

  const displayedImages = images?.data || []
  
  // Apply sorting (we still need to sort client-side)
  const sortedImages = [...displayedImages].sort((a, b) => {
    return sortOrder === "asc"
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || filterSource !== undefined || filterTags.length > 0;

  return (
    <div className="space-y-6 p-6 w-full animate-fade-in h-full mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Lake</h1>
          <p className="text-muted-foreground mt-1">Explore and manage all your image data</p>
        </div>
        <div className="space-x-4">
          <Button variant="outline">Add to Project</Button>
          <Button className="bg-accent hover:bg-accent/80">Upload Images</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SearchFilter 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            parsedQuery={parsedQuery}
            onRemoveFilter={handleRemoveFilter}
          />
          <SourceFilter 
            filterSource={filterSource} 
            setFilterSource={setFilterSource} 
            sources={sources} 
          />
          <div className="flex items-center justify-between gap-2">
            <SortControl sortOrder={sortOrder} setSortOrder={setSortOrder} />
            <ViewToggle view={view} setView={setView} />
          </div>
        </div>
        
        <TagFilter 
          allTags={allTags}
          filterTags={filterTags}
          toggleFilterTag={toggleFilterTag}
          handleClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Selection header */}
      <SelectionHeader
        selectedImages={selectedImages}
        filteredImages={sortedImages}
        toggleSelectAll={toggleSelectAll}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        projectOptions={projectsData}
        handleAddToProject={handleAddToProject}
      />

      {loadingProjects && (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader className="animate-spin h-8 w-8 mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Project...</p>
        </div>
      )}

      {errorProjects && (
        <div className="text-center p-12">
          <p className="text-destructive font-medium mb-2">Failed to load projects</p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader className="animate-spin h-8 w-8 mb-4 text-primary" />
          <p className="text-muted-foreground">Loading images...</p>
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="text-center p-12">
          <p className="text-destructive font-medium mb-2">Failed to load images</p>
          <p className="text-muted-foreground">Using mock data as fallback</p>
        </div>
      )}

      {/* Images grid */}
      {!isLoading && sortedImages.length > 0 ? (
        <>
          {view === "grid" ? (
            <ImageGrid 
              images={sortedImages} 
              selectedImages={selectedImages} 
              onImageClick={handleImageClick}
              toggleImageSelection={toggleImageSelection}
            />
          ) : (
            <ImageTable
              images={sortedImages}
              selectedImages={selectedImages}
              onImageClick={handleImageClick}
              toggleImageSelection={toggleImageSelection}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          )}
        </>
      ) : (
        !isLoading && <NoResults onClearFilters={handleClearFilters} />
      )}


    </div>
  );
};

export default DataLake;