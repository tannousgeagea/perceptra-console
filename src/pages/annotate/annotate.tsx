import { useState, FC } from "react";
import useFetchData from "@/hooks/use-fetch-data";
import ImageCard from "@/components/image/ImageCard";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import FilterTabs from "@/components/ui/filter/filter-tabs";
import Spinner from '@/components/ui/animation/spinner';
import PaginationControls from "@/components/ui/actions/pagination-control";
import AnnotateActions from "../../components/ui/actions/annotate-actions";
import Header from "@/components/ui/header/Header";
import { Info } from "lucide-react";
import "./annotate.css";


interface Filter {
  key: string;
  label: string;
  count: number;
}

interface DataResponse {
  unannotated?: number;
  annotated?: number;
  reviewed?: number;
  total_record?: number;
  data?: Array<{ image_id: string, image_url: string, image_name: string }>;
  pages?: number;
}

const Annotate: FC = () => {
  const { projectId, jobId } = useParams<{ projectId: string, jobId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const [selectedFilter, setSelectedFilter] = useState<string>(query.get("filter") || "unannotated");
  const [currentPage, setCurrentPage] = useState<number>(parseInt(query.get("page") || "1", 10));
  const itemsPerPage: number = 50;

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
  
  const { data, loading, error, refetch }: 
    { data?: DataResponse; loading: boolean; error?: Error | null; refetch: () => void } = useFetchData(
    `/api/v1/jobs/${jobId}/images?status=${selectedFilter}&items_per_page=${itemsPerPage}&page=${currentPage}`
  );

  const handleImageClick = (index:number): void => {
    navigate(
      `/projects/${projectId}/images/annotate`,
      { state: { images: data, currentIndex: index } });
  };

  const filters: Filter[] = [
    { key: "unannotated", label: "Unannotated", count: data?.unannotated || 0 },
    { key: "annotated", label: "Annotated", count: data?.annotated || 0 },
    { key: "reviewed", label: "Reviewed", count: data?.reviewed || 0 },
  ];

  const totalRecord: number = data?.total_record || 0;
  const pages = data?.pages || 0
  const imageData = data?.data || [];
  const totalReviewed = data?.reviewed || 0
  
  if (error) return <p>Error loading images: {error.message}</p>;

  return (
    <div className="space-y-6 p-6 w-full">
      <div className="flex flex-col justify-between h-full">
        <div>
          <Header
            title="Annotate"
            description={`Annotate your images.`}
          />
          <div className="tabs">
            <FilterTabs 
              filters={filters}
              selectedFilter={selectedFilter}
              onSelectFilter={handleFilterChange}
            />

            <AnnotateActions 
              projectId={projectId || ''}
              totalRecord={totalReviewed}
              onSuccess={refetch}
            />
          </div>

          {loading ? (
            <div className="image-grid">
              <Spinner />
            </div>
          ) : totalRecord === 0 ? (
            <div className="no-results">
              <i className="info-icon"><Info /></i>
              <span>The search returned 0 results.</span>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(125px,1fr))] gap-4 w-full rounded">
              {imageData.map((image, index) => (
                <ImageCard key={index} image={image} index={index} onClick={handleImageClick} />
              ))}
            </div>
          )}
        </div>

      {totalRecord > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={pages}
          onNext={() => handlePageChange(currentPage + 1)}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
        />
      )}
      </div>
    </div>
   );
};

export default Annotate;