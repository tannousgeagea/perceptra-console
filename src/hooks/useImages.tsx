import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseURL } from "@/components/api/base";
import { mockImages } from "@/components/datalake/mockImages";

export interface ImageItem {
  id: string;
  image_id: string;
  name: string;
  src: string;
  tags: string[];
  source: string;
  date: string;
  projectId?: string;
}

interface UseImagesParams {
  name?: string;
  tag?: string;
  source?: string;
  limit?: number;
  offset?: number;
  parsedQuery?: string[];
  useMock?: boolean;
}

export interface ImageResponse {
  total: number;
  limit: number;
  offset: number;
  data: ImageItem[];
}

const fetchImages = async (params: UseImagesParams): Promise<ImageResponse> => {
  const { name, tag, source, limit = 20, offset = 0, parsedQuery = [], useMock } = params;

  if (useMock) {
    return {
      data: mockImages,
      total: mockImages.length,
      limit,
      offset,
    };
  }

  const queryParams: Record<string, any> = { limit, offset };
  if (name) queryParams.name = name;
  if (tag) queryParams.tag = tag;
  if (source) queryParams.source = source;

  if (parsedQuery.length > 0) {
    queryParams.query = parsedQuery;
  }


  console.log(parsedQuery)
  try {
    const response = await axios.get(`${baseURL}/api/v1/images`, { 
      params: queryParams,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v));
          } else {
            searchParams.append(key, value);
          }
        });
        return searchParams.toString();
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(`Fetch failed: ${error.message || error}`);
  }
};

export const useImages = (params: UseImagesParams = {}) => {
  return useQuery({
    queryKey: ["images", params],
    queryFn: () => fetchImages(params),
    staleTime: 1000 * 60,
    retry: false,
  });
};
