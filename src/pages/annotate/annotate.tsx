import { useState, FC, useMemo } from "react";
import ImageCard from "@/components/image/ImageCard";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import FilterTabs from "@/components/ui/filter/filter-tabs";
import Spinner from '@/components/ui/animation/spinner';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ui/toggle-group"; // if using shadcn UI
import PaginationControls from "@/components/ui/actions/pagination-control";
import { Button } from "@/components/ui/ui/button";
import { useJobImages } from "@/hooks/useJobImages";
import { Info, Database } from "lucide-react";
import { ImageSize } from "@/types/image";
import QueryState from "@/components/common/QueryState";
import { AnnotateHeader } from "@/components/job-annotation/AnnotateHeader";

interface Filter {
  key: string;
  label: string;
  count: number;
}

const Annotate: FC = () => {
  const { projectId, jobId } = useParams<{ projectId: string, jobId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("")
  const [datasetBuilderOpen, setDatasetBuilderOpen] = useState(false);

  if (!projectId || !jobId) {
    return <p className="text-red-600 p-6">Invalid route: Missing project or job ID.</p>;
  }

  const query = new URLSearchParams(location.search);
  const [selectedFilter, setSelectedFilter] = useState<string>(query.get("filter") || "unannotated");
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(query.get("page") || "1", 10)
  );  
  const itemsPerPage: number = 50;
  const [imageSize, setImageSize] = useState<ImageSize>("sm");

  const { data, isLoading, isError, refetch } = useJobImages(projectId, jobId, {
    status: selectedFilter || undefined,
    skip: (currentPage - 1) * itemsPerPage,
    limit: itemsPerPage,
  });
  
  const filteredImages = data?.images.filter(
    (image) => 
      image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateURL = (filter: string, page: number) => {
    navigate({
      pathname: location.pathname,
      search: `?filter=${filter}&page=${page}`,
    });
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
    updateURL(filter, 1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURL(selectedFilter, newPage);
  };
  
  const handleImageClick = (index: number, image_id:string): void => {
    navigate(
      `/projects/${projectId}/images/${image_id}?jobId=${jobId}&filter=${selectedFilter}&page=${currentPage}&index=${index}`);
  };

  const counts = useMemo(() => {
    const total = data?.total || 0;
    const annotated = data?.annotated || 0;
    const reviewed = data?.reviewed || 0;
    const unannotated = data?.unannotated || 0;
    return { total, annotated, reviewed, unannotated };
  }, [data]);

  const filters: Filter[] = [
    { key: "unannotated", label: "Unannotated", count: counts.unannotated || 0 },
    { key: "annotated", label: "Annotated", count: counts.annotated || 0 },
    { key: "reviewed", label: "Reviewed", count: counts.reviewed || 0 },
  ];
  
  if (isError || isLoading)
    return (
      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingMessage="Loading annotations..."
        errorMessage="Failed to fetch annotations. Please try again."
      />
  )

  return (
    <div className="w-full flex flex-col p-6 space-y-6">
      <div className="flex flex-col justify-between h-full">
        <div>
          <AnnotateHeader 
            projectId={projectId}
            job={data?.job!}
            onRefresh={refetch}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}

          />
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <FilterTabs 
              filters={filters}
              selectedFilter={selectedFilter}
              onSelectFilter={handleFilterChange}
            />

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setDatasetBuilderOpen(true)}>
                <Database className="h-4 w-4" />
                Build Dataset
              </Button>

              {/* 🔹 Size toggle (sm, md, lg) */}
              <ToggleGroup
                type="single"
                value={imageSize}
                onValueChange={(val) => {
                  if (val) setImageSize(val as "sm" | "md" | "lg");
                }}
                className="flex gap-1 border border-border rounded-lg p-0.5 bg-muted/30"
              >
                <ToggleGroupItem
                  value="sm"
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    imageSize === "sm"
                      ? "bg-primary text-white"
                      : "hover:bg-muted/50"
                  }`}
                >
                  S
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="md"
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    imageSize === "md"
                      ? "bg-primary text-white"
                      : "hover:bg-muted/50"
                  }`}
                >
                  M
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="lg"
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    imageSize === "lg"
                      ? "bg-primary text-white"
                      : "hover:bg-muted/50"
                  }`}
                >
                  L
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 w-full rounded px-4 py-8 place-items-center">
              <Spinner />
            </div>
          ) : counts.total === 0 ? (
            <div className="flex items-center mt-5 px-5 py-2.5 border border-[#cce5ff] rounded-lg bg-[#f0f8ff] text-[#004085] text-sm font-medium gap-1">
              <span className="mr-1 text-2xl text-[#004085]">
                <Info />
              </span>
              <span>The search returned 0 results.</span>
            </div>
          ) : (
            <div
              className={`flex flex-wrap gap-4 justify-start items-start w-full`}
              style={{
                rowGap: "1rem",
                columnGap: "1rem",
              }}
            >
              {filteredImages?.map((image, index) => (
                <div
                  key={image.image_id}
                  // className={`
                  //   ${imageSize === "sm" ? "w-28" : imageSize === "md" ? "w-40" : "w-56"}
                  // `}
                >
                  <ImageCard
                    image={image}
                    index={index}
                    size={imageSize}
                    onClick={() => handleImageClick(index, image.image_id)}
                    highlightColor=""
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {counts.total > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(counts.total / itemsPerPage)}
            onNext={() => handlePageChange(currentPage + 1)}
            onPrevious={() => handlePageChange(currentPage - 1)}
          />
        )}
      </div>
    </div>
   );
};

export default Annotate;