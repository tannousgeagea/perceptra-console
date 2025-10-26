
import React from "react";
import ImageCard from "@/components/common/ImageCard";

interface ImageGridProps {
  images: Array<{
    id: string;
    image_id:string;
    src: string;
    name: string;
    tags?: string[];
    source?: string;
    projectId?: string;
  }>;
  selectedImages: string[];
  onImageClick: (image: any) => void;
  toggleImageSelection: (id: string) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  selectedImages,
  onImageClick,
  toggleImageSelection,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {images.map(image => (
        <ImageCard
          key={image.id}
          id={image.id}
          src={image.src}
          name={image.name}
          tags={image.tags}
          source={image.source}
          selected={selectedImages.includes(image.image_id)}
          onClick={() => {
            if (selectedImages.length > 0) {
              toggleImageSelection(image.image_id);
            } else {
              onImageClick(image);
            }
          }}
        />
      ))}
    </div>
  );
};

export default ImageGrid;
