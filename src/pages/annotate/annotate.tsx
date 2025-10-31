import { useState, FC, useMemo } from "react";
import ImageCard from "@/components/image/ImageCard";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import FilterTabs from "@/components/ui/filter/filter-tabs";
import Spinner from '@/components/ui/animation/spinner';
import PaginationControls from "@/components/ui/actions/pagination-control";
import AnnotateActions from "../../components/ui/actions/annotate-actions";
import Header from "@/components/ui/header/Header";
import { useJobImages } from "@/hooks/useJobImages";
import { Info } from "lucide-react";

interface Filter {
  key: string;
  label: string;
  count: number;
}

const Annotate: FC = () => {
  const { projectId, jobId } = useParams<{ projectId: string, jobId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  if (!projectId || !jobId) {
    return <p className="text-red-600 p-6">Invalid route: Missing project or job ID.</p>;
  }

  const query = new URLSearchParams(location.search);
  const [selectedFilter, setSelectedFilter] = useState<string>(query.get("filter") || "unannotated");
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(query.get("page") || "1", 10)
  );  
  const itemsPerPage: number = 50;

  const { data, isLoading, isError, refetch } = useJobImages(projectId, jobId, {
    status: selectedFilter || undefined,
    skip: (currentPage - 1) * itemsPerPage,
    limit: itemsPerPage,
  });
  
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
  
  const handleImageClick = (index:number): void => {
    navigate(
      `/projects/${projectId}/images/annotate`,
      { state: { images: data, currentIndex: index } });
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
  
  if (isError)
    return (
      <div className="flex flex-col items-center justify-center p-12 text-red-600">
        <p>Failed to load job images.</p>
        <button
          onClick={() => refetch()}
          className="text-blue-500 underline mt-2"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="w-full flex flex-col p-6 space-y-6">
      <div className="flex flex-col justify-between h-full">
        <div>
          <Header
            title="Annotate"
            description={`Annotate your images.`}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <FilterTabs 
              filters={filters}
              selectedFilter={selectedFilter}
              onSelectFilter={handleFilterChange}
            />

            <AnnotateActions 
              projectId={projectId || ''}
              totalRecord={counts.total}
              onSuccess={refetch}
            />
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
            <div className="grid grid-cols-[repeat(auto-fit,minmax(125px,1fr))] gap-4 w-full rounded">
              {data?.images.map((image, index) => (
                <ImageCard 
                  key={index} 
                  image={{
                    image_id: image.image_id,
                    image_url: image.download_url,
                    image_name: image.name,
                  }} 
                  index={index} 
                  onClick={handleImageClick} 
                />
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