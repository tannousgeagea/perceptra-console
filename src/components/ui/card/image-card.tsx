import React, { useRef, useEffect } from "react";
import './image-card.css';

// Define the types for annotation and image
interface Annotation {
  xyxyn: number[]; // Coordinates in normalized [x_min, y_min, x_max, y_max] format
}

interface ImageProps {
  image_id: string
  image_url: string; // URL of the image
  image_name: string; // Name of the image
  annotations?: Annotation[]; // Optional annotations
}

interface ImageCardProps {
  image: ImageProps; // Prop type for the component 
  onClick: () => void; 
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Type the canvasRef
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Handle null canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Handle null context

    const img = new Image();
    img.src = image.image_url;

    img.onload = () => {
      // Draw the image on the canvas
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw annotations if they exist
      if (image.annotations) {
        image.annotations.forEach((annotation) => {
          const [xMin, yMin, xMax, yMax] = annotation.xyxyn.map((coord, index) =>
            index % 2 === 0 ? coord * canvas.width : coord * canvas.height
          );

          // Draw the bounding box
          ctx.strokeStyle = "yellow";
          ctx.lineWidth = 15;
          ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);
        });
      }
    };
  }, [image]);


  const handleOnClick = (): void => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <div className="image-card">
      <canvas ref={canvasRef} className="image-canvas" onClick={() => handleOnClick()}/>
      <p>{image.image_name}</p>
    </div>
  );
};

export default ImageCard;
