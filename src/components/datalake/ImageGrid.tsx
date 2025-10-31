
import React from "react";
import ImageCard from "@/components/common/ImageCard";
import { ImageRecord } from "@/types/image";

interface ImageGridProps {
  images: ImageRecord[];
  selectedImages: string[];
  onImageClick: (image: ImageRecord) => void;
  toggleImageSelection: (imageId: string) => void;
}


const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  selectedImages,
  onImageClick,
  toggleImageSelection,
}) => {

  if (!images?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No images found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {images.map(image => (
        <ImageCard
          key={image.id}
          id={image.id}
          src={image.download_url}
          name={image.name}
          tags={image.tags}
          source={image.source_of_origin}
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
