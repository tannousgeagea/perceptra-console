import { Badge } from "@/components/ui/ui/badge";
import ImageOverlay from "./ImageOverlay";
import { BoundingBox, ValidationImage } from "@/types/validation";

interface ValidationImageCardProps {
  image: ValidationImage;
  showPredictions: boolean;
  showGroundTruth: boolean;
}

const ValidationImageCard = ({ image, showPredictions, showGroundTruth }: ValidationImageCardProps) => {
  return (
    <div className="space-y-3">
      <div className="relative group overflow-hidden rounded-lg border border-slate-200">
        <img 
          src={image.original} 
          alt={`Validation ${image.id}`}
          className="w-full object-fill transition-transform group-hover:scale-105"
        />
        
        <ImageOverlay 
          boundingBoxes={image.boundingBoxes}
          showPredictions={showPredictions}
          showGroundTruth={showGroundTruth}
          imageWidth={image.width}
          imageHeight={image.height}
        />
        
        {/* Status indicators */}
        <div className="absolute top-2 left-2 flex gap-1">
          {showPredictions && (
            <Badge className="bg-blue-500 text-white text-xs">Prediction</Badge>
          )}
          {showGroundTruth && (
            <Badge className="bg-green-500 text-white text-xs">Ground Truth</Badge>
          )}
        </div>
        
        {/* Overall confidence */}
        <div className="absolute bottom-2 right-2">
          <Badge className="bg-black/70 text-white text-xs">
            {(image.confidence * 100).toFixed(1)}%
          </Badge>
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-slate-600">
        <span>Image #{image.id}</span>
        <span>Confidence: {(image.confidence * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default ValidationImageCard;