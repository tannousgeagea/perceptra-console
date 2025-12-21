import React from "react";
import { 
  Box, 
  Eye, 
  Grid3X3, 
  MessageSquare, 
  ScanEye,
  Layers,
  Cpu
} from "lucide-react";
import { Label } from "@/components/ui/ui/label";
import { cn } from "@/lib/utils";
import { ModelFormData, ModelTask } from "@/hooks/useModels";

interface ModelFrameworkSelectionProps {
  formData: ModelFormData;
  setFormData: React.Dispatch<React.SetStateAction<ModelFormData>>;
}

const taskOptions: { 
  value: ModelTask; 
  label: string; 
  description: string; 
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "classification",
    label: "Classification",
    description: "Categorize images into predefined classes",
    icon: <Grid3X3 className="h-6 w-6" />,
    color: "from-blue-500 to-blue-600"
  },
  {
    value: "object-detection",
    label: "Object Detection",
    description: "Locate and identify objects in images",
    icon: <Box className="h-6 w-6" />,
    color: "from-green-500 to-green-600"
  },
  {
    value: "segmentation",
    label: "Segmentation",
    description: "Pixel-level classification of images",
    icon: <Layers className="h-6 w-6" />,
    color: "from-purple-500 to-purple-600"
  },
  {
    value: "llm",
    label: "Language Model",
    description: "Natural language processing tasks",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "from-amber-500 to-amber-600"
  },
  {
    value: "vlm",
    label: "Vision-Language",
    description: "Combined image and text understanding",
    icon: <ScanEye className="h-6 w-6" />,
    color: "from-pink-500 to-pink-600"
  }
];

const frameworkOptions: {
  value: string;
  label: string;
  description: string;
  logo: string;
}[] = [
  {
    value: "pytorch",
    label: "PyTorch",
    description: "Dynamic computation graphs",
    logo: "🔥"
  },
  {
    value: "tensorflow",
    label: "TensorFlow",
    description: "Production-ready ML platform",
    logo: "📊"
  },
  {
    value: "ultralytics",
    label: "Ultralytics",
    description: "State-of-the-art YOLO models",
    logo: "🎯"
  },
  {
    value: "huggingface",
    label: "Hugging Face",
    description: "Transformers & pre-trained models",
    logo: "🤗"
  }
];

const ModelFrameworkSelection: React.FC<ModelFrameworkSelectionProps> = ({ 
  formData, 
  setFormData 
}) => {
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
          <Cpu className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-2xl font-semibold">Task & Framework</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Select the type of model and the framework you want to use.
        </p>
      </div>

      {/* Task Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">
          Model Task <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {taskOptions.map((task) => (
            <button
              key={task.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, task: task.value }))}
              className={cn(
                "relative p-5 rounded-xl border-2 text-left transition-all duration-200 group",
                formData.task === task.value
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 transition-transform group-hover:scale-110",
                `bg-gradient-to-br ${task.color}`
              )}>
                {task.icon}
              </div>
              <h3 className="font-semibold text-foreground">{task.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              {formData.task === task.value && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Eye className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Framework Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">
          Framework <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {frameworkOptions.map((fw) => (
            <button
              key={fw.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, framework: fw.value }))}
              className={cn(
                "p-4 rounded-xl border-2 text-center transition-all duration-200",
                formData.framework === fw.value
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className="text-3xl mb-2">{fw.logo}</div>
              <h3 className="font-semibold text-foreground text-sm">{fw.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{fw.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelFrameworkSelection;
