import { Card, CardContent } from "@/components/ui/ui/card";
import { Switch } from "@/components/ui/ui/switch";
import { Eye } from "lucide-react";

interface ImageControlsProps {
  showPredictions: boolean;
  showGroundTruth: boolean;
  onTogglePredictions: (value: boolean) => void;
  onToggleGroundTruth: (value: boolean) => void;
}

const ImageControls = ({ 
  showPredictions, 
  showGroundTruth, 
  onTogglePredictions, 
  onToggleGroundTruth 
}: ImageControlsProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Visualization Controls</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={showPredictions} onCheckedChange={onTogglePredictions} />
              <span className="text-sm">Show Predictions</span>
              <Eye className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showGroundTruth} onCheckedChange={onToggleGroundTruth} />
              <span className="text-sm">Show Ground Truth</span>
              <Eye className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageControls;
