import { useState, FC } from "react";
import ImageCard from "@/components/image/ImageCard";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Spinner from '@/components/ui/animation/spinner';
import PaginationControls from "@/components/ui/actions/pagination-control";
import DatasetActions from "@/components/ui/actions/dataset-actions";
import FiltersDataset from "@/components/ui/filter/filter-dataset";
import Header from "@/components/ui/header/Header";
import { useProjectImages } from "@/hooks/useProjectImages";
import useFetchData from "@/hooks/use-fetch-data";
import { Info } from "lucide-react";

interface DataResponse {
  unannotated?: number;
  annotated?: number;
  reviewed?: number;
  total_record?: number;
  data?: Array<{ image_id: string, image_url: string, image_name: string }>;
  pages?: number;
}

const Dataset: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const [selectedFilter, setSelectedFilter] = useState<string>(query.get("filter") || "");
  const [currentPage, setCurrentPage] = useState<number>(parseInt(query.get("page") || "1", 10));
  const itemsPerPage: number = 50;


  console.log(selectedFilter)
  const updateURL = (filter: string, page: number) => {
    console.log(filter)
    navigate({
      pathname: location.pathname,
      search: `?filter=${filter}&page=${page}`,
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURL(selectedFilter, newPage);
  };
  
  // const { data, loading, error, refetch }: 
  //   { data?: DataResponse; loading: boolean; error?: Error | null; refetch: () => void } = useFetchData(
  //   `/api/v1/projects/${projectId}/images?status=dataset&user_filters=${selectedFilter}&items_per_page=${itemsPerPage}&page=${currentPage}`
  // );

  const { data, isLoading: loading, error } = useProjectImages(
    projectId!,
    "dataset",
    selectedFilter,
    currentPage,
    itemsPerPage
  );

  const handleImageClick = (index:number): void => {
    navigate(
      `/projects/${projectId}/images/annotate`,
      { state: { images: data, currentIndex: index } });
  };

  const totalRecord: number = data?.total_record || 0;
  const pages = data?.pages || 0
  const imageData = data?.data || [];
  if (error) return <p>Error loading images: {error.message}</p>;

  return (
    <div className="space-y-6 p-6 w-full">
      <div className="flex flex-col justify-between h-full">
        <div>
          <Header
            title="Dataset"
            description={``}
          />
          <div className="flex justify-between mr-2 flex-wrap gap-2 mb-4">
            <FiltersDataset 
              onSearch={(value) => {
                setSelectedFilter(value);
                updateURL(value, currentPage);
              }}
            />
            <DatasetActions 
              projectId={projectId || ""}
            />
          </div>

          {loading ? (
            <div className="grid gap-4">
              <Spinner />
            </div>
          ) : totalRecord === 0 ? (
            <div className="flex items-center px-[20px] py-[10px] border-[1px] border-[solid] border-[#cce5ff] text-[#004085] rounded-[8px] bg-[#f0f8ff] font-medium gap-1">
              <i className="mr-1 text-2xl text-[#004085]"><Info /></i>
              <span>The search returned 0 results.</span>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(125px,1fr))] gap-4 w-full rounded">
              {imageData.map((image, index) => (
                // <ImageCard2 key={index} image={image} index={index} onClick={handleImageClick} />
                <ImageCard
                  key={image.image_id}
                  image={image}
                  index={index}
                  onClick={handleImageClick}
              />
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

export default Dataset;