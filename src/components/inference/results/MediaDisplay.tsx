import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';


interface Prediction {
  id: string;
  class: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface MediaDisplayProps {
  imageUrl: string;
  isVideo: boolean;
  showOverlay: boolean;
  overlayType?: 'primary' | 'comparison' | 'side-by-side';
  title?: string;
  maxHeight?: string;
  predictions?: Prediction[];
}

export const MediaDisplay: React.FC<MediaDisplayProps> = ({
  imageUrl,
  isVideo,
  showOverlay,
  overlayType = 'primary',
  title,
  maxHeight = 'max-h-96',
  predictions = []
}) => {
  const getColorForClass = (className: string, index: number) => {
    const colors = [
      { border: 'border-red-500', bg: 'bg-red-500', bgOpacity: 'bg-red-500/10' },
      { border: 'border-blue-500', bg: 'bg-blue-500', bgOpacity: 'bg-blue-500/10' },
      { border: 'border-green-500', bg: 'bg-green-500', bgOpacity: 'bg-green-500/10' },
      { border: 'border-yellow-500', bg: 'bg-yellow-500', bgOpacity: 'bg-yellow-500/10' },
      { border: 'border-purple-500', bg: 'bg-purple-500', bgOpacity: 'bg-purple-500/10' },
      { border: 'border-orange-500', bg: 'bg-orange-500', bgOpacity: 'bg-orange-500/10' }
    ];
    return colors[index % colors.length];
  };

  const renderOverlay = () => {
    if (!showOverlay) return null;

    // If we have prediction data, use it; otherwise fall back to mock positions
    if (predictions && predictions.length > 0) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {predictions.map((prediction, index) => {
            const colors = getColorForClass(prediction.class, index);
            const { x, y, width, height } = prediction.bbox;
            
            return (
              <div
                key={prediction.id}
                className={`absolute border-2 ${colors.border} ${colors.bgOpacity} rounded`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${width}%`,
                  height: `${height}%`
                }}
              >
                <Badge className={`absolute -top-6 left-0 ${colors.bg} text-white text-xs`}>
                  {prediction.class} ({(prediction.confidence * 100).toFixed(1)}%)
                </Badge>
              </div>
            );
          })}
        </div>
      );
    }
  };

  const content = (
    <div className="relative">
      {isVideo ? (
        <video
          src={imageUrl}
          controls
          className={`w-full h-auto ${maxHeight} object-contain`}
        />
      ) : (
        <img
          src={imageUrl}
          alt={title || "Inference result"}
          className={`w-full h-auto ${maxHeight} object-contain`}
        />
      )}
      {renderOverlay()}
    </div>
  );

  if (title) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {content}
    </Card>
  );
};