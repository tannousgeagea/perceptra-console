// Define types for the image card component
export interface Annotation {
    xyxyn: number[]; // Coordinates in normalized [x_min, y_min, x_max, y_max] format
    label?: string; // Optional label for the annotation
    confidence?: number; // Optional confidence score
  }
  
export interface ImageData {
    image_id: string;
    image_url: string;
    image_name: string;
    annotations?: Annotation[];
  }
  
export interface ImageCardProps {
    image: ImageData;
    index: number;
    onClick?: (index: number) => void;
    className?: string;
    highlightColor?: string; // Allow customization of highlight color
    size?: 'sm' | 'md' | 'lg'; // Different size options
  }
  
export interface ImageCardGridProps {
    images: ImageData[];
    onImageClick?: (index: number) => void;
    className?: string;
    columnCount?: {
      sm: number; // Small screens (mobile)
      md: number; // Medium screens (tablet)
      lg: number; // Large screens (desktop)
    };
  }

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  results: T[];
}

export interface ImageRecord {
  id: string;
  image_id: string;
  name: string;
  original_filename: string;
  file_format: string;
  file_size: number;
  file_size_mb: number;
  width: number;
  height: number;
  aspect_ratio: number;
  megapixels: number;
  storage_profile: {
    id: string;
    name: string;
    backend: string;
  };
  storage_key: string;
  checksum: string;
  source_of_origin: string;
  tags: string[];
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  download_url: string;
}

export interface ImagesResponse {
  total: number;
  page: number;
  page_size: number;
  images: ImageRecord[];
}

export interface ImagesParams extends PaginationParams {
  from_date?: string;
  to_date?: string;
  tags?: string;
}