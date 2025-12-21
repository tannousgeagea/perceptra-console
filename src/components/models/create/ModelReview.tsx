import React from "react";
import { 
  CheckCircle2, 
  FileText, 
  Cpu, 
  Settings2, 
  Tag,
  Box,
  Grid3X3,
  Layers,
  MessageSquare,
  ScanEye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { Separator } from "@/components/ui/ui/separator";
import { ModelFormData, ModelTask } from "@/hooks/useModels";

interface ModelReviewProps {
  formData: ModelFormData;
}

const getTaskIcon = (task: ModelTask) => {
  switch (task) {
    case "classification":
      return <Grid3X3 className="h-5 w-5" />;
    case "object-detection":
      return <Box className="h-5 w-5" />;
    case "segmentation":
      return <Layers className="h-5 w-5" />;
    case "llm":
      return <MessageSquare className="h-5 w-5" />;
    case "vlm":
      return <ScanEye className="h-5 w-5" />;
    default:
      return <Cpu className="h-5 w-5" />;
  }
};

const getTaskLabel = (task: ModelTask) => {
  const labels: Record<ModelTask, string> = {
    "classification": "Classification",
    "object-detection": "Object Detection",
    "segmentation": "Segmentation",
    "llm": "Language Model",
    "vlm": "Vision-Language Model"
  };
  return labels[task] || task;
};

const getFrameworkLabel = (framework: string) => {
  const labels: Record<string, string> = {
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "ultralytics": "Ultralytics",
    "huggingface": "Hugging Face"
  };
  return labels[framework] || framework;
};

const ModelReview: React.FC<ModelReviewProps> = ({ formData }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-2xl font-semibold">Review & Create</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Please review your model configuration before creating.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Basic Info */}
        <Card className="overflow-hidden border-border/50">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Basic Information</span>
          </div>
          <CardContent className="p-5 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Model Name</p>
              <p className="font-semibold text-lg">{formData.name || "—"}</p>
            </div>
            {formData.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-foreground">{formData.description}</p>
              </div>
            )}
            {formData.tags.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task & Framework */}
        <Card className="overflow-hidden border-border/50">
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 px-5 py-3 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-accent" />
            <span className="font-semibold text-sm">Task & Framework</span>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {formData.task && getTaskIcon(formData.task as ModelTask)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Task</p>
                  <p className="font-semibold">{formData.task ? getTaskLabel(formData.task as ModelTask) : "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-2xl">
                  {formData.framework === "pytorch" && "🔥"}
                  {formData.framework === "tensorflow" && "📊"}
                  {formData.framework === "ultralytics" && "🎯"}
                  {formData.framework === "huggingface" && "🤗"}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Framework</p>
                  <p className="font-semibold">{formData.framework ? getFrameworkLabel(formData.framework) : "—"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card className="overflow-hidden border-border/50">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-5 py-3 flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-sm">Training Configuration</span>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Batch Size</p>
                <p className="font-mono font-semibold text-lg">{formData.config.batchSize}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Learning Rate</p>
                <p className="font-mono font-semibold text-lg">{formData.config.learningRate}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Epochs</p>
                <p className="font-mono font-semibold text-lg">{formData.config.epochs}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Optimizer</p>
                <p className="font-semibold capitalize">{formData.config.optimizer}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Scheduler</p>
                <p className="font-semibold capitalize">{formData.config.scheduler.replace('-', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="text-center p-4 rounded-xl bg-accent/5 border border-accent/20">
          <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-2" />
          <p className="font-medium">Everything looks good!</p>
          <p className="text-sm text-muted-foreground">Click "Create Model" to proceed.</p>
        </div>
      </div>
    </div>
  );
};

export default ModelReview;
