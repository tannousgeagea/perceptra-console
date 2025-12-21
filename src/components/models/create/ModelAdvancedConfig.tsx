import React from "react";
import { Settings2, Zap, RotateCw, Gauge } from "lucide-react";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Slider } from "@/components/ui/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";
import { Card, CardContent } from "@/components/ui/ui/card";
import { ModelFormData } from "@/hooks/useModels";

interface ModelAdvancedConfigProps {
  formData: ModelFormData;
  setFormData: React.Dispatch<React.SetStateAction<ModelFormData>>;
}

const optimizerOptions = [
  { value: "adam", label: "Adam", description: "Adaptive learning rates" },
  { value: "adamw", label: "AdamW", description: "Adam with weight decay" },
  { value: "sgd", label: "SGD", description: "Classic gradient descent" },
  { value: "rmsprop", label: "RMSprop", description: "Root mean square propagation" }
];

const schedulerOptions = [
  { value: "cosine", label: "Cosine Annealing", description: "Smooth decay" },
  { value: "step", label: "Step LR", description: "Periodic drops" },
  { value: "exponential", label: "Exponential", description: "Gradual decay" },
  { value: "plateau", label: "Reduce on Plateau", description: "Adaptive to loss" }
];

const ModelAdvancedConfig: React.FC<ModelAdvancedConfigProps> = ({ 
  formData, 
  setFormData 
}) => {
  const updateConfig = (key: keyof ModelFormData['config'], value: number | string) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Settings2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Training Configuration</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Fine-tune the hyperparameters for optimal training results.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mx-auto">
        {/* Batch Size */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Gauge className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <Label className="text-base font-medium">Batch Size</Label>
                <p className="text-xs text-muted-foreground">Samples per iteration</p>
              </div>
            </div>
            <div className="space-y-3">
              <Slider
                value={[formData.config.batchSize]}
                onValueChange={([value]) => updateConfig('batchSize', value)}
                min={1}
                max={128}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">1</span>
                <span className="font-mono font-semibold text-primary">{formData.config.batchSize}</span>
                <span className="text-muted-foreground">128</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Rate */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <Label className="text-base font-medium">Learning Rate</Label>
                <p className="text-xs text-muted-foreground">Step size for optimization</p>
              </div>
            </div>
            <Input
              type="number"
              step="0.0001"
              min="0.00001"
              max="1"
              value={formData.config.learningRate}
              onChange={(e) => updateConfig('learningRate', parseFloat(e.target.value) || 0.001)}
              className="font-mono text-center h-12"
            />
          </CardContent>
        </Card>

        {/* Epochs */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <RotateCw className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <Label className="text-base font-medium">Epochs</Label>
                <p className="text-xs text-muted-foreground">Complete dataset passes</p>
              </div>
            </div>
            <div className="space-y-3">
              <Slider
                value={[formData.config.epochs]}
                onValueChange={([value]) => updateConfig('epochs', value)}
                min={1}
                max={500}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">1</span>
                <span className="font-mono font-semibold text-primary">{formData.config.epochs}</span>
                <span className="text-muted-foreground">500</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimizer */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Settings2 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <Label className="text-base font-medium">Optimizer</Label>
                <p className="text-xs text-muted-foreground">Weight update algorithm</p>
              </div>
            </div>
            <Select 
              value={formData.config.optimizer} 
              onValueChange={(value) => updateConfig('optimizer', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {optimizerOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Scheduler - Full Width */}
        <Card className="border-border/50 md:col-span-2">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <RotateCw className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <Label className="text-base font-medium">Learning Rate Scheduler</Label>
                <p className="text-xs text-muted-foreground">How the learning rate changes over time</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {schedulerOptions.map((sch) => (
                <button
                  key={sch.value}
                  type="button"
                  onClick={() => updateConfig('scheduler', sch.value)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    formData.config.scheduler === sch.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-sm">{sch.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{sch.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelAdvancedConfig;
