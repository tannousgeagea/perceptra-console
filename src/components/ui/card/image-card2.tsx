import React from "react";
import { useState } from "react";
import Loader from "../animation/loader";
import "./image-card2.css";

// Define the types for annotation and image
interface Annotation {
  xyxyn: number[]; // Coordinates in normalized [x_min, y_min, x_max, y_max] format
}

interface ImageProps {
  image_id: string;
  image_url: string;
  image_name: string;
  annotations?: Annotation[];
}

interface ImageCardProps {
  image: ImageProps; // Prop type for the component
  index: number;
  onClick: (index: number) => void;
}

const ImageCard2: React.FC<ImageCardProps> = ({ image, onClick, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const handleOnClick = (index: number): void => {
    if (onClick) {
      onClick(index);
    }
  };

  return (
    <div className="image-card2">
      <div
        className="image-card2-container"
        onClick={() => handleOnClick(index)}
      >
        <img src={image.image_url} alt="image" loading="lazy" onLoad={() => setIsLoaded(true)}/>
        {isLoaded && 
          image.annotations?.map((annotation, idx) => {
            const [xMin, yMin, xMax, yMax] = annotation.xyxyn;
            return (
              <div
                key={idx}
                className="image-card2-bounding-box"
                style={{
                  left: `${xMin * 100}%`,
                  top: `${yMin * 100}%`,
                  width: `${(xMax - xMin) * 100}%`,
                  height: `${(yMax - yMin) * 100}%`,
                }}
              
              >
                <div className="highlight-area"></div>
              </div>
          );
        })}
      </div>
      {/* Image name */}
      <p>{image.image_name}</p>

      {!isLoaded &&
        <div className="image-loader">
          <Loader />
        </div>
      }
    </div>
  );
};

export default ImageCard2;
