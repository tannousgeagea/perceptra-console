import { useState, useEffect } from "react";
import { baseURL } from "@/components/api/base";

interface Filter {
    key: string;
    title: string;
    items: Array<{ value: string }>;
}

const useFilters = (): { filters: Filter[]; loading: boolean; error: Error | null } => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMetadata = async (): Promise<void> => {
        try {
            const response = await fetch(`${baseURL}/api/v1/images/metadata`);
            const data: { data?: { filters?: Filter[] } } = await response.json();

            if (data && data.data) {
                setFilters(data.data.filters || []);
            } else {
                setFilters([]);
            }
        } catch (error) {
            console.error("Error fetching metadata:", error);
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetadata();
    }, []);

    return { filters, loading, error };
};

export default useFilters;
