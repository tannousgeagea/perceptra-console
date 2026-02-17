import { AIModel } from '@/types/auto-annotate';
import { ProjectImage } from '@/types/dataset';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Separator } from '@/components/ui/ui/separator';
import { ChevronLeft, Rocket, ImageIcon, Cpu, Tag, Clock } from 'lucide-react';

interface Props {
  selectedImages: ProjectImage[];
  model: AIModel;
  labels: string[];
  totalSizeMb: number;
  onBack: () => void;
  onStart: () => void;
}

export function ConfirmStep({ selectedImages, model, labels, totalSizeMb, onBack, onStart }: Props) {
  const estimatedMinutes = Math.ceil((selectedImages.length * 2) / 60);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Confirm Auto-Annotation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Images */}
          <div className="flex items-start gap-3">
            <ImageIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">{selectedImages.length} images</p>
              <p className="text-xs text-muted-foreground">{totalSizeMb.toFixed(1)} MB total</p>
            </div>
          </div>

          <Separator />

          {/* Model */}
          <div className="flex items-start gap-3">
            <Cpu className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">{model.name}</p>
              <p className="text-xs text-muted-foreground">
                {model.version} · {model.accuracy}% accuracy
              </p>
              <div className="flex gap-1 mt-1">
                {model.supportedTypes.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Labels */}
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">{labels.length} target labels</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {labels.map((l) => (
                  <Badge key={l} variant="secondary" className="text-xs">
                    {l}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Time estimate */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">~{estimatedMinutes} min estimated</p>
              <p className="text-xs text-muted-foreground">
                Processing runs in background. You can navigate away.
              </p>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-1 overflow-x-auto py-2">
            {selectedImages.slice(0, 10).map((img) => (
              <img
                key={img.id}
                src={img.download_url}
                alt={img.name}
                className="h-12 w-16 rounded object-cover border"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
            ))}
            {selectedImages.length > 10 && (
              <div className="h-12 w-16 rounded border flex items-center justify-center bg-muted text-xs text-muted-foreground">
                +{selectedImages.length - 10}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={onStart} className="gap-2">
          <Rocket className="h-4 w-4" />
          Start Auto-Annotation
        </Button>
      </div>
    </div>
  );
}
