import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/ui/dialog";
import { Button } from "@/components/ui/ui/button";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/ui/accordion";
import { Play, Loader2, Settings2 } from "lucide-react";
import { Model, Dataset } from "@/types/models";
import { mockDatasets } from "@/data/mockModels";

interface TrainingConfig {
  batchSize: number;
  learningRate: number;
  epochs: number;
  optimizer: string;
  scheduler: string;
}

interface StartTrainingDialogProps {
  model: Model | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (model: Model, config: TrainingConfig, datasetId: string) => void;
}

const defaultConfig: TrainingConfig = {
  batchSize: 32,
  learningRate: 0.001,
  epochs: 50,
  optimizer: "adam",
  scheduler: "cosine",
};

const optimizerOptions = [
  { value: "adam", label: "Adam" },
  { value: "sgd", label: "SGD" },
  { value: "adamw", label: "AdamW" },
  { value: "rmsprop", label: "RMSprop" },
];

const schedulerOptions = [
  { value: "cosine", label: "Cosine Annealing" },
  { value: "step", label: "Step Decay" },
  { value: "exponential", label: "Exponential" },
  { value: "none", label: "None" },
];

const StartTrainingDialog: React.FC<StartTrainingDialogProps> = ({
  model,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [config, setConfig] = useState<TrainingConfig>(defaultConfig);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setConfig(defaultConfig);
      setSelectedDataset(mockDatasets[0]?.id || "");
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!model || !selectedDataset) return;
    
    setIsLoading(true);
    // Simulate a brief delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));
    onConfirm(model, config, selectedDataset);
    setIsLoading(false);
    onOpenChange(false);
  };

  const updateConfig = <K extends keyof TrainingConfig>(
    key: K,
    value: TrainingConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (!model) return null;

  const selectedDatasetInfo = mockDatasets.find((d) => d.id === selectedDataset);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Start Training
          </DialogTitle>
          <DialogDescription>
            Configure and start a new training run for "{model.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dataset Selection */}
          <div className="space-y-2">
            <Label htmlFor="dataset">Training Dataset</Label>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger id="dataset">
                <SelectValue placeholder="Select a dataset" />
              </SelectTrigger>
              <SelectContent>
                {mockDatasets.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.itemCount?.toLocaleString()} items)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDatasetInfo && (
              <p className="text-xs text-muted-foreground">
                {selectedDatasetInfo.itemCount?.toLocaleString()} images available for training
              </p>
            )}
          </div>

          {/* Training Configuration */}
          <Accordion type="single" collapsible defaultValue="config">
            <AccordionItem value="config" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  <span>Training Configuration</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                {/* Epochs */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Epochs</Label>
                    <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                      {config.epochs}
                    </span>
                  </div>
                  <Slider
                    value={[config.epochs]}
                    onValueChange={([value]) => updateConfig("epochs", value)}
                    min={10}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of complete passes through the training dataset
                  </p>
                </div>

                {/* Batch Size */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Batch Size</Label>
                    <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                      {config.batchSize}
                    </span>
                  </div>
                  <Slider
                    value={[config.batchSize]}
                    onValueChange={([value]) => updateConfig("batchSize", value)}
                    min={8}
                    max={128}
                    step={8}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of samples per gradient update
                  </p>
                </div>

                {/* Learning Rate */}
                <div className="space-y-2">
                  <Label htmlFor="learning-rate">Learning Rate</Label>
                  <Input
                    id="learning-rate"
                    type="number"
                    step="0.0001"
                    min="0.00001"
                    max="1"
                    value={config.learningRate}
                    onChange={(e) =>
                      updateConfig("learningRate", parseFloat(e.target.value) || 0.001)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Step size for optimizer updates (typically 0.0001 - 0.01)
                  </p>
                </div>

                {/* Optimizer & Scheduler */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Optimizer</Label>
                    <Select
                      value={config.optimizer}
                      onValueChange={(value) => updateConfig("optimizer", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {optimizerOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>LR Scheduler</Label>
                    <Select
                      value={config.scheduler}
                      onValueChange={(value) => updateConfig("scheduler", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {schedulerOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Summary */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
            <p className="text-sm font-medium">Training Summary</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Model:</div>
              <div className="font-medium">{model.name}</div>
              <div className="text-muted-foreground">Type:</div>
              <div className="font-medium capitalize">{model.type.replace("-", " ")}</div>
              <div className="text-muted-foreground">New Version:</div>
              <div className="font-medium">v{model.versions.length + 1}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDataset || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Training
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartTrainingDialog;