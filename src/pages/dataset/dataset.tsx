import { useState, FC } from "react";
import ImageCard from "@/components/image/ImageCard";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Spinner from '@/components/ui/animation/spinner';
import PaginationControls from "@/components/ui/actions/pagination-control";
import DatasetActions from "@/components/ui/actions/dataset-actions";
import FiltersDataset from "@/components/ui/filter/filter-dataset";
import Header from "@/components/ui/header/Header";
import { useProjectImages } from "@/hooks/useProjectImages";
import { Info } from "lucide-react";

const Dataset: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const [selectedFilter, setSelectedFilter] = useState<string>(query.get("filter") || "");
  const [currentPage, setCurrentPage] = useState<number>(parseInt(query.get("page") || "1", 10));
  const itemsPerPage: number = 50;

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

  const { data, isLoading, isError } = useProjectImages(projectId!, {
    status: 'dataset',
    skip: (currentPage - 1) * itemsPerPage,
    limit: itemsPerPage,
  }
  );

  const handleImageClick = (index:number): void => {
    navigate(
      `/projects/${projectId}/images/annotate`,
      { state: { images: data, currentIndex: index } });
  };

  const total: number = data?.total || 0;
  const imageData = data?.images || [];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-red-600">
        <p>Failed to load dataset images.</p>
      </div>
    );
  }
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

          {isLoading ? (
            <div className="grid place-items-center gap-4 w-full rounded py-8">
              <Spinner />
            </div>
          ) : total === 0 ? (
            <div className="flex items-center mt-5 px-5 py-2.5 border border-[#cce5ff] rounded-lg bg-[#f0f8ff] text-[#004085] text-sm font-medium gap-1">
              <Info className="text-2xl text-[#004085]" />
              <span>No images found for this dataset.</span>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(125px,1fr))] gap-4 w-full rounded">
              {imageData.map((image, index) => (
                <ImageCard
                  key={image.image_id}
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
        {total > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(total / itemsPerPage)}
            onNext={() => handlePageChange(currentPage + 1)}
            onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          />
        )}
      </div>
    </div>
   );
};

export default Dataset;