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