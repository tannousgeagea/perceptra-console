import React from "react";
import { Zap, Gauge, Scale, Target, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/ui/badge";
import { ModelFormData, ModelTask } from "@/hooks/useModels";
import { ModelSize } from "@/types/models";

interface ModelSizeSelectionProps {
  formData: ModelFormData;
  setFormData: React.Dispatch<React.SetStateAction<ModelFormData>>;
}

interface SizeOption {
  id: ModelSize;
  label: string;
  variant: string;      // framework-specific variant label
  description: string;
  speedScore: number;   // 1–5, higher = faster
  accuracyScore: number;
  icon: React.ReactNode;
  recommended?: boolean;
  unavailableFor?: string[];  // framework names where this size isn't available
}

const ALL_SIZES: SizeOption[] = [
  {
    id: "nano",
    label: "Nano",
    variant: "n",
    description: "Minimum footprint for edge devices and real-time pipelines.",
    speedScore: 5,
    accuracyScore: 1,
    icon: <Zap className="h-5 w-5" />,
    unavailableFor: ["pytorch", "tensorflow", "huggingface"],
  },
  {
    id: "small",
    label: "Small",
    variant: "s",
    description: "Fast inference with good accuracy for production workloads.",
    speedScore: 4,
    accuracyScore: 2,
    icon: <Gauge className="h-5 w-5" />,
  },
  {
    id: "medium",
    label: "Medium",
    variant: "m",
    description: "Balanced speed and accuracy. The right choice for most projects.",
    speedScore: 3,
    accuracyScore: 3,
    icon: <Scale className="h-5 w-5" />,
    recommended: true,
  },
  {
    id: "large",
    label: "Large",
    variant: "l",
    description: "High accuracy for demanding detection tasks.",
    speedScore: 2,
    accuracyScore: 4,
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: "xlarge",
    label: "X-Large",
    variant: "x",
    description: "Maximum accuracy — requires a powerful GPU.",
    speedScore: 1,
    accuracyScore: 5,
    icon: <Trophy className="h-5 w-5" />,
    unavailableFor: ["pytorch", "tensorflow", "huggingface"],
  },
];

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-4 rounded-full transition-colors ${
            i < score ? color : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

const ModelSizeSelection: React.FC<ModelSizeSelectionProps> = ({ formData, setFormData }) => {
  const { framework, modelSize } = formData;

  const visibleSizes = ALL_SIZES.filter(
    (s) => !s.unavailableFor?.includes(framework)
  );

  const handleSelect = (size: ModelSize) => {
    setFormData((prev) => ({ ...prev, modelSize: size }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Model Size</h2>
        <p className="text-sm text-muted-foreground">
          Choose the architecture size for your model. Larger sizes achieve higher accuracy
          but require more GPU memory and slower inference.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleSizes.map((size) => {
          const isSelected = modelSize === size.id;

          return (
            <button
              key={size.id}
              type="button"
              onClick={() => handleSelect(size.id)}
              className={`
                relative text-left rounded-xl border p-5 transition-all duration-200
                hover:border-primary/50 hover:shadow-sm focus:outline-none
                ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "border-border bg-card"
                }
              `}
            >
              {size.recommended && (
                <Badge className="absolute top-3 right-3 text-xs bg-accent/20 text-accent border-0 px-2 py-0.5">
                  Recommended
                </Badge>
              )}

              {/* Icon + label row */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                    ${isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}
                  `}
                >
                  {size.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">{size.label}</p>
                  {framework === "ultralytics" && (
                    <p className="text-xs text-muted-foreground font-mono">
                      YOLO variant: {size.variant}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {size.description}
              </p>

              {/* Speed / Accuracy bars */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Speed</span>
                  <ScoreBar score={size.speedScore} color="bg-cyan-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Accuracy</span>
                  <ScoreBar score={size.accuracyScore} color="bg-violet-500" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!modelSize && (
        <p className="text-sm text-muted-foreground text-center">
          Select a size to continue.
        </p>
      )}
    </div>
  );
};

export default ModelSizeSelection;
