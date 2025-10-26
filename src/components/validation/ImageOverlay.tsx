import { Badge } from "@/components/ui/ui/badge";
import { BoundingBox } from "@/types/validation";

interface ImageOverlayProps {
  boundingBoxes: BoundingBox[];
  showPredictions: boolean;
  showGroundTruth: boolean;
  imageWidth: number;
  imageHeight: number;
}

const ImageOverlay = ({ 
  boundingBoxes, 
  showPredictions, 
  showGroundTruth, 
  imageWidth, 
  imageHeight 
}: ImageOverlayProps) => {
  const filteredBoxes = boundingBoxes.filter(box => 
    (box.type === 'prediction' && showPredictions) || 
    (box.type === 'groundTruth' && showGroundTruth)
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {filteredBoxes.map((box, index) => (
        <div
          key={`${box.label}-${box.x}-${box.y}-${box.type}`}
          className={`absolute border-2 ${
            box.type === 'prediction' 
              ? 'border-blue-500' 
              : 'border-green-500'
          }`}
          style={{
            left: `${(box.x / imageWidth) * 100}%`,
            top: `${(box.y / imageHeight) * 100}%`,
            width: `${(box.width / imageWidth) * 100}%`,
            height: `${(box.height / imageHeight) * 100}%`,
          }}
        >
          <Badge 
            className={`absolute -top-6 left-0 text-ms ${
              box.type === 'prediction' 
                ? 'bg-blue-500 text-white' 
                : 'bg-green-500 text-white'
            }`}
          >
            {box.label} {box.type === 'prediction' && `${(box.confidence * 100).toFixed(0)}%`}
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default ImageOverlay;