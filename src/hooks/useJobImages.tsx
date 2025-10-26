// hooks/useProjectImages.ts
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";

interface ImageData {
  image_id: string;
  image_url: string;
  image_name: string;
}

interface DataResponse {
  unannotated?: number;
  annotated?: number;
  reviewed?: number;
  total_record?: number;
  data?: ImageData[];
  pages?: number;
}


export const fetchJobImages = async (
    jobId: string,
    status: string,
    userFilter: string,
    page: number,
    itemsPerPage: number = 50
): Promise<DataResponse> => {
  const url = `${baseURL}/api/v1/jobs/${jobId}/images?status=${status}&user_filters=${userFilter}&items_per_page=${itemsPerPage}&page=${page}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch project images");
  }

  return res.json();
};

export const useJobImages = (
  jobId: string,
  status: string,
  userFilter: string,
  page: number,
  itemsPerPage = 50
) => {

  return useQuery<DataResponse, Error>({
    queryKey: ["job-images", jobId, status, userFilter, page],
    queryFn: () => fetchJobImages(jobId, status, userFilter, page, itemsPerPage),
    // keepPreviousData : true,
    // staleTime: 1000 * 60 * 5,
  });
};
