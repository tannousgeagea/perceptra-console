
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import type { ImagesResponse, ImagesParams, ParsedQuery } from "@/types/image";

export const fetchImages = async (
  organizationId: string,
  params: ImagesParams = {}
): Promise<ImagesResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) throw new Error("No authentication token found");

  const { 
    skip = 0, 
    limit = 100, 
    from_date, 
    to_date,
    project_id,
    q,
    tag, 
    search 
  } = params;
  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  if (project_id) queryParams.append("project_id", project_id);
  if (from_date) queryParams.append("from_date", from_date);
  if (to_date) queryParams.append("to_date", to_date);

  if (q) {
    queryParams.append("q", q);
  } else {
    // Legacy filters for backwards compatibility
    if (tag) queryParams.append("tag", tag);
    if (search) queryParams.append("search", search);
  }

  const response = await fetch(`${baseURL}/api/v1/images?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-ID": organizationId,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }

  return response.json();
};

export const useImages = (params: ImagesParams = {}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ["images", currentOrganization?.id, params],
    queryFn: () => {
      if (!currentOrganization) throw new Error("No organization selected");
      return fetchImages(currentOrganization.id, params);
    },
    enabled: !!currentOrganization,
    staleTime: 2 * 60 * 1000,
  });
};


// ============= Helper Hooks for Common Queries =============

/**
 * Hook for filtering images by tags
 */
export const useImagesByTags = (tags: string[], additionalFilters?: string) => {
  const tagQuery = tags.map(tag => `tag:${tag}`).join(' ');
  const fullQuery = additionalFilters ? `${tagQuery} ${additionalFilters}` : tagQuery;
  
  return useImages({ q: fullQuery });
};

/**
 * Hook for filtering images by dimensions
 */
export const useImagesByDimensions = (
  minWidth?: number,
  maxWidth?: number,
  minHeight?: number,
  maxHeight?: number
) => {
  const filters: string[] = [];
  
  if (minWidth) filters.push(`min-width:${minWidth}`);
  if (maxWidth) filters.push(`max-width:${maxWidth}`);
  if (minHeight) filters.push(`min-height:${minHeight}`);
  if (maxHeight) filters.push(`max-height:${maxHeight}`);
  
  return useImages({ q: filters.join(' ') });
};

/**
 * Hook for filtering images by annotation count
 */
export const useImagesByAnnotationCount = (
  minAnnotations?: number,
  maxAnnotations?: number
) => {
  const filters: string[] = [];
  
  if (minAnnotations) filters.push(`min-annotations:${minAnnotations}`);
  if (maxAnnotations) filters.push(`max-annotations:${maxAnnotations}`);
  
  return useImages({ q: filters.join(' ') });
};

/**
 * Hook for filtering images by project and split
 */
export const useImagesByProjectSplit = (
  projectId: string,
  split?: 'train' | 'val' | 'test'
) => {
  const query = split ? `split:${split}` : undefined;
  return useImages({ project_id: projectId, q: query });
};

// ============= Query Builder Utility =============

/**
 * Build a query string from filter object
 */
export const buildImageQuery = (filters: ParsedQuery): string => {
  const parts: string[] = [];

  // Tags
  filters.tags?.forEach(tag => parts.push(`tag:${tag}`));

  // Classes
  filters.classes?.forEach(cls => parts.push(`class:${cls}`));

  // Split
  if (filters.split) parts.push(`split:${filters.split}`);

  // Filename
  if (filters.filename) {
    // Quote filename if it contains spaces
    const filename = filters.filename.includes(' ') 
      ? `"${filters.filename}"` 
      : filters.filename;
    parts.push(`filename:${filename}`);
  }

  // Dimensions
  if (filters.minWidth) parts.push(`min-width:${filters.minWidth}`);
  if (filters.maxWidth) parts.push(`max-width:${filters.maxWidth}`);
  if (filters.minHeight) parts.push(`min-height:${filters.minHeight}`);
  if (filters.maxHeight) parts.push(`max-height:${filters.maxHeight}`);

  // Annotations
  if (filters.minAnnotations) parts.push(`min-annotations:${filters.minAnnotations}`);
  if (filters.maxAnnotations) parts.push(`max-annotations:${filters.maxAnnotations}`);

  // Job
  if (filters.job) parts.push(`job:${filters.job}`);

  // Sort
  if (filters.sort) parts.push(`sort:${filters.sort}`);
  if (filters.status) parts.push(`status:${filters.status}`);
  if (filters.backend) parts.push(`backend:${filters.status}`);
  if (filters.job_status) parts.push(`job_status:${filters.job_status}`);

  return parts.join(' ');
};

/**
 * Parse query string back into filter object
 */
export const parseImageQuery = (query: string): Record<string, any> => {
  const filters: Record<string, any> = {
    tags: [],
    classes: [],
  };

  if (!query) return filters;

  // Simple regex to split by spaces but respect quotes
  const tokens = query.match(/(?:[^\s"]|"(?:\\.|[^"])*")+/g) || [];

  tokens.forEach(token => {
    const cleaned = token.replace(/"/g, '');
    
    if (cleaned.includes(':')) {
      const [key, value] = cleaned.split(':', 2);

      switch (key.toLowerCase()) {
        case 'tag':
          filters.tags.push(value);
          break;
        case 'class':
          filters.classes.push(value);
          break;
        case 'split':
          filters.split = value;
          break;
        case 'filename':
          filters.filename = value;
          break;
        case 'min-width':
          filters.minWidth = parseInt(value);
          break;
        case 'max-width':
          filters.maxWidth = parseInt(value);
          break;
        case 'min-height':
          filters.minHeight = parseInt(value);
          break;
        case 'max-height':
          filters.maxHeight = parseInt(value);
          break;
        case 'min-annotations':
          filters.minAnnotations = parseInt(value);
          break;
        case 'max-annotations':
          filters.maxAnnotations = parseInt(value);
          break;
        case 'job':
          filters.job = value;
          break;
        case 'sort':
          filters.sort = value;
          break;
      }
    }
  });

  return filters;
};
