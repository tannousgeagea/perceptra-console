import { baseURL } from "@/components/api/base";
import { useState, useEffect } from "react";

interface Image {
    created_at: string;
    // Add other properties of the image as needed
}

interface Filters {
    [key: string]: string | number | boolean;
}

const useImages = () => {
    const [images, setImages] = useState<Image[]>([]);
    const [filteredImages, setFilteredImages] = useState<Image[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<Filters>({});
    const [sortOrder, setSortOrder] = useState<string>("Newest");
    const [loading, setLoading] = useState<boolean>(false);

    const fetchImages = async (filters: Filters): Promise<void> => {
        setLoading(true);
        try {
            const query = Object.entries(filters)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join("&");
            const response = await fetch(`${baseURL}/api/v1/images?${query}`);
            const data = await response.json();

            if (data && data.data) {
                setImages(data.data);
            } else {
                setImages([]);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    console.log("Query: ", selectedFilters);
    
    const filterAndSortImages = (): void => {
        let filtered: Image[] = [...images];

        // Apply sorting
        if (sortOrder === "Newest") {
            filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else {
            filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }

        setFilteredImages(filtered);
    };

    useEffect(() => {
        fetchImages(selectedFilters);
    }, [selectedFilters]);

    useEffect(() => {
        filterAndSortImages();
    }, [images, sortOrder]);

    const updateFilter = (key: string, value: string | number | boolean): void => {
        setSelectedFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    return {
        images: filteredImages,
        loading,
        setSortOrder,
        updateFilter,
    };
};

export default useImages;