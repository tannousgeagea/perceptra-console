import React, { useState, useEffect } from "react";
import { 
  CustomDialog, 
  CustomDialogContent, 
  CustomDialogHeader, 
  CustomDialogTitle, 
  CustomDialogDescription, 
  CustomDialogFooter 
} from "@/components/common/CustomDialog";
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
import { Play, Loader2, Settings2, GitBranch, Cpu, Sparkles, Tag } from "lucide-react";
import { mockDatasets } from "./mockModels";
import { Badge } from "@/components/ui/ui/badge";
import { useModelDetail } from "@/hooks/useModels";
import { ModelDetail, TrainingConfig, ComputeProfile, TrainingTriggerRequest, ComputeProfiles } from "@/types/models";
import { RadioGroup, RadioGroupItem } from "@/components/ui/ui/radio-group";
import { Separator } from "@/components/ui/ui/separator";

interface StartTrainingDialogProps {
  modelId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (model: ModelDetail, request: TrainingTriggerRequest ) => void;
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
  modelId,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [config, setConfig] = useState<TrainingConfig>(defaultConfig);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [selectedBaseVersion, setSelectedBaseVersion] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [trainingMode, setTrainingMode] = useState<"scratch" | "transfer">("transfer");
  const [versionName, setVersionName] = useState<string>("");
  const [selectedComputeProfile, setSelectedComputeProfile] = useState<string>("");
  const { data: model, error } = useModelDetail(modelId!);
  

  // Get sorted versions (latest first)
  const sortedVersions = model?.versions
   .slice()
    .sort((a, b) => b.version_number - a.version_number) || [];
  
  const latestVersion = sortedVersions[0];
  const hasVersions = sortedVersions.length > 0;

  // Get default compute profile
  const defaultComputeProfile = ComputeProfiles.find(p => p.isDefault);


  useEffect(() => {
    if (open && model) {
      setConfig(defaultConfig);
      setSelectedDataset(mockDatasets[0]?.id || "");
      
      setVersionName("");
      setSelectedComputeProfile(defaultComputeProfile?.id || "");
      
      // Set training mode and base version based on available versions
      if (hasVersions) {
        setTrainingMode("transfer");
        setSelectedBaseVersion(latestVersion?.id || "");
      } else {
        setTrainingMode("scratch");
        setSelectedBaseVersion("");
      }
    }
  }, [open, model, latestVersion?.id, hasVersions, defaultComputeProfile?.id]);

  const handleConfirm = async () => {
    if (!model || !selectedDataset) return;
    
    setIsLoading(true);
    const request: TrainingTriggerRequest = {
      dataset_version_id: selectedDataset,
      parent_version_id: trainingMode === "transfer" ? selectedBaseVersion : null,
      config: config,
      version_name: versionName || undefined,
      compute_profile_id: selectedComputeProfile || undefined,
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    onConfirm(model, request);
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
  const selectedComputeInfo = ComputeProfiles.find((p) => p.id === selectedComputeProfile);
  const nextVersionNumber = Math.max(...model.versions.map(v => v.version_number), 0) + 1

  return (
    <CustomDialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <CustomDialogHeader>
          <CustomDialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Start Training
          </CustomDialogTitle>
          <CustomDialogDescription>
            Configure and start a new training run for "{model.name}".
          </CustomDialogDescription>
        </CustomDialogHeader>

        <div className="space-y-6 py-4">
          {/* Version Name (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="version-name" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Version Name
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="version-name"
              placeholder={`e.g., "Improved accuracy" or "Experiment A"`}
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground">
              Give this version a memorable name for easy identification
            </p>
          </div>

          <Separator />

          {/* Training Mode Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Training Mode
            </Label>
            <RadioGroup
              value={trainingMode}
              onValueChange={(value) => setTrainingMode(value as "scratch" | "transfer")}
              className="grid grid-cols-2 gap-4"
            >
              <div className={`relative flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${trainingMode === "scratch" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <RadioGroupItem value="scratch" id="scratch" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="scratch" className="cursor-pointer font-medium">
                    Train from Scratch
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Start fresh with random weights
                  </p>
                </div>
              </div>
              <div className={`relative flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${!hasVersions ? "opacity-50 cursor-not-allowed" : ""} ${trainingMode === "transfer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <RadioGroupItem 
                  value="transfer" 
                  id="transfer" 
                  className="mt-1" 
                  disabled={!hasVersions}
                />
                <div className="space-y-1">
                  <Label htmlFor="transfer" className={`font-medium ${hasVersions ? "cursor-pointer" : "cursor-not-allowed"}`}>
                    Transfer Learning
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {hasVersions 
                      ? "Continue from existing version"
                      : "No versions available yet"
                    }
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Base Version Selection (only for transfer learning) */}
          {trainingMode === "transfer" && hasVersions && (
            <div className="space-y-2">
              <Label htmlFor="base-version" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Base Version
              </Label>
              <Select value={selectedBaseVersion} onValueChange={setSelectedBaseVersion}>
                <SelectTrigger id="base-version">
                  <SelectValue placeholder="Select base version" />
                </SelectTrigger>
                <SelectContent>
                  {sortedVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      <div className="flex items-center gap-2">
                        <span>v{version.version_number}</span>
                        {version.version_name && (
                          <span className="text-muted-foreground">- {version.version_name}</span>
                        )}
                        {version.id === latestVersion?.id && (
                          <Badge variant="secondary" className="text-xs py-0 px-1.5">
                            Latest
                          </Badge>
                        )}
                        {version.tags?.includes("production") && (
                          <Badge variant="default" className="text-xs py-0 px-1.5 bg-green-600">
                            Prod
                          </Badge>
                        )}
                        <span className="text-muted-foreground text-xs capitalize">
                          ({version.status})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The new training run will start from this version's weights
              </p>
            </div>
          )}

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
                    <div className="flex items-center gap-2">
                      <span>{dataset.name}</span>
                      {dataset.version && (
                        <Badge variant="outline" className="text-xs py-0">
                          {dataset.version}
                        </Badge>
                      )}
                      <span className="text-muted-foreground text-xs">
                        ({dataset.itemCount?.toLocaleString()} items)
                      </span>
                    </div>
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

          {/* Compute Profile Selection */}
          <div className="space-y-2">
            <Label htmlFor="compute" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Compute Profile
            </Label>
            <Select value={selectedComputeProfile} onValueChange={setSelectedComputeProfile}>
              <SelectTrigger id="compute">
                <SelectValue placeholder="Select compute profile" />
              </SelectTrigger>
              <SelectContent>
                {ComputeProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    <div className="flex items-center gap-2">
                      <span>{profile.name}</span>
                      {profile.isDefault && (
                        <Badge variant="secondary" className="text-xs py-0 px-1.5">
                          Default
                        </Badge>
                      )}
                      {profile.gpuType && (
                        <span className="text-muted-foreground text-xs">
                          ({profile.gpuCount}x {profile.gpuType})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedComputeInfo && (
              <p className="text-xs text-muted-foreground">
                {selectedComputeInfo.description}
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
                    value={[config.epochs || 50 ]}
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
                    value={[config.batchSize || 32]}
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
              <div className="font-medium capitalize">{model.task.replace("-", " ")}</div>
              <div className="text-muted-foreground">Mode:</div>
              <div className="font-medium">
                {trainingMode === "scratch" ? "From Scratch" : "Transfer Learning"}
              </div>
              {trainingMode === "transfer" && selectedBaseVersion && (
                <>
                  <div className="text-muted-foreground">Base Version:</div>
                  <div className="font-medium">
                    v{sortedVersions.find(v => v.id === selectedBaseVersion)?.version_number || "-"}
                  </div>
                </>
              )}
              <div className="text-muted-foreground">New Version:</div>
              <div className="font-medium">v{nextVersionNumber}</div>
              <div className="text-muted-foreground">Compute:</div>
              <div className="font-medium">{selectedComputeInfo?.name || "Default"}</div>
            </div>
          </div>
        </div>

        <CustomDialogFooter className="gap-2 sm:gap-0">
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
        </CustomDialogFooter>
      </CustomDialogContent>
    </CustomDialog>
  );
};

export default StartTrainingDialog;