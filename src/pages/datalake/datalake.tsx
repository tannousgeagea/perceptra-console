import { FC } from "react";
import { useNavigate } from "react-router-dom";
import useImages from "@/hooks/use-images";
import useFilters from "@/hooks/use-filters";
import SearchFilter from "@/components/ui/filter/filter-search";
import ScrollFilter from "@/components/ui/filter/filter-scroll";
import SortFilter from "@/components/ui/filter/filter-sort";
import ImageGallery from "@/components/feature/image-gallery";
import DatalakeIcon from "@/assets/icons/nav/datalake.png";
import Spinner from "@/components/ui/animation/spinner";

import "./datalake.css";

const Datalake: FC = () => {
    const navigate: (path: string, options?: { state?: { images: any[]; currentIndex: number } }) => void = useNavigate();
    const { filters, loading: loadingFilters, error: errorFilters }: { filters: Array<{ key: string; title: string; items: Array<{ value: string }> }>; loading: boolean; error?: Error | null } = useFilters();
    const { images, loading: loadingImages, setSortOrder, updateFilter }: { images: any[]; loading: boolean; setSortOrder: (order: string) => void; updateFilter: (key: string, value: any) => void } = useImages();

    if (loadingFilters) return <p>Loading metadata...</p>;
    if (errorFilters) return <p>Error loading metadata: {errorFilters.message}</p>;

    const handleImageClick = (index: number): void => {
        navigate(`/annotate/${index}`, { state: { images, currentIndex: index } });
    };

    return (
        <div className="section-container">
            <div className="section-content">
                <div className="section-header">
                    <div className="section-title">
                        <img src={DatalakeIcon} className="header-icon" alt="Dataset Icon" />
                        <span>Datalake</span>
                    </div>
                </div>

                <div className="dataset-content-section">
                    <div className="dataset-filter-section">
                        <SearchFilter
                            placeholder="Filter by filename"
                            onSearchChange={(term: string) => updateFilter("image_name", term)}
                        />

                        {filters.map((filter) => (
                            <ScrollFilter
                                key={filter.key}
                                name={filter.title}
                                data={filter.items.map((item) => item.value)}
                                onFilterChange={(value) => updateFilter(filter.key, value)}
                            />
                        ))}

                        <SortFilter
                            name="Sort By"
                            data={["Newest", "Oldest"]}
                            onSortChange={setSortOrder}
                        />
                    </div>

                    <div className="image-preview-section">
                        {loadingImages ? (
                            <Spinner />
                        ) : (
                            <ImageGallery 
                                images={images}
                                handleImageClick={handleImageClick} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Datalake;