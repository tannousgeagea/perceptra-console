import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/ui/card";
import { Button } from "@/components/ui/ui/button";
import { Badge } from "@/components/ui/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/ui/tooltip";
import { Progress } from "@/components/ui/ui/progress";
import { ExternalLink, HelpCircle, RefreshCw, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PriorityImage, SamplingStrategy } from "@/types/evaluation";

interface ActiveLearningProps {
  priorityImages: PriorityImage[];
  isLoading: boolean;
  onGenerateQueue: (strategy: SamplingStrategy, batchSize: number) => void;
}

const STRATEGY_INFO: Record<SamplingStrategy, { title: string; description: string }> = {
  uncertainty: {
    title: "Uncertainty Sampling",
    description: "Prioritize images where the model has low confidence predictions",
  },
  diversity: {
    title: "Diversity Sampling",
    description: "Focus on under-represented classes and edge cases",
  },
  "error-prone": {
    title: "Error-Prone Sampling",
    description: "Select images similar to previously known errors",
  },
  hybrid: {
    title: "Hybrid Sampling (Recommended)",
    description: "Balanced combination of all strategies for optimal results",
  },
};

const getPriorityColor = (score: number) => {
  if (score >= 0.8) return "bg-red-500";
  if (score >= 0.6) return "bg-yellow-500";
  return "bg-green-500";
};

export const ActiveLearning = ({
  priorityImages,
  isLoading,
  onGenerateQueue,
}: ActiveLearningProps) => {
  const [strategy, setStrategy] = useState<SamplingStrategy>("hybrid");
  const [batchSize, setBatchSize] = useState(20);

  const handleGenerate = () => {
    onGenerateQueue(strategy, batchSize);
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Images Needing Review</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  {Object.entries(STRATEGY_INFO).map(([key, info]) => (
                    <div key={key}>
                      <p className="font-medium">{info.title}</p>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>Prioritized queue for human review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Strategy:</span>
              <Select
                value={strategy}
                onValueChange={(v) => setStrategy(v as SamplingStrategy)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hybrid">Hybrid (Recommended)</SelectItem>
                  <SelectItem value="uncertainty">Uncertainty</SelectItem>
                  <SelectItem value="diversity">Diversity</SelectItem>
                  <SelectItem value="error-prone">Error-Prone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Batch Size:</span>
              <Select
                value={batchSize.toString()}
                onValueChange={(v) => setBatchSize(parseInt(v))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Generate Queue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Priority Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Queue</CardTitle>
          <CardDescription>
            {priorityImages.length} images prioritized for review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {priorityImages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No images in queue</p>
              <p className="text-sm mt-1">Click "Generate Queue" to get prioritized images</p>
            </div>
          ) : (
            <div className="space-y-4">
              {priorityImages.map((image, index) => (
                <div
                  key={image.image_id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
                    <img
                      src={image.thumbnail_url}
                      alt={image.image_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{image.image_name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {image.reasons.map((reason, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Priority Score */}
                  <div className="flex-shrink-0 w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Priority</span>
                      <span className="text-sm font-medium">
                        {image.priority_score.toFixed(2)}
                      </span>
                    </div>
                    <Progress
                      value={image.priority_score * 100}
                      className="h-2"
                      // Using inline style for dynamic color since Progress component doesn't support className for indicator
                    />
                  </div>

                  {/* Action */}
                  <Button size="sm" className="flex-shrink-0">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Review Now
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
