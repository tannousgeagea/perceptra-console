import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  Cpu, 
  Database, 
  FileCode2, 
  Loader2, 
  Sliders, 
  Upload,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/ui/form";
import { Input } from "@/components/ui/ui/input";
import { Slider } from "@/components/ui/ui/slider";
import { Textarea } from "@/components/ui/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";
import { Switch } from "@/components/ui/ui/switch";
import { Label } from "@/components/ui/ui/label";
import { Model, Dataset, ModelDetail } from "@/types/models";
import { ModelService } from "./ModelService";
import { mockDatasets } from "./mockModels";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface TrainingFormProps {
  model: ModelDetail;
  projectId: string;
}

const TrainingForm: React.FC<TrainingFormProps> = ({ model, projectId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  // Fetch datasets
  const { data: datasets = mockDatasets } = useQuery({
    queryKey: ["datasets"],
    queryFn: () => Promise.resolve(mockDatasets),
    initialData: mockDatasets
  });

  // Form configuration
  const form = useForm({
    defaultValues: {
      baseVersion: model.versions.length > 0 ? model.versions[0].id : "",
      datasetId: "dataset-001",
      epochs: 10,
      batchSize: 32,
      learningRate: 0.001,
      advancedConfig: false
    }
  });

  // Monitor training status
  const [trainingStatus, setTrainingStatus] = useState<{
    active: boolean;
    log: string[];
    progress: number;
  }>({
    active: false,
    log: [],
    progress: 0,
  });

  // Handle dataset selection
  const handleDatasetChange = (datasetId: string) => {
    const dataset = datasets.find(d => d.id === datasetId) || null;
    setSelectedDataset(dataset);
    form.setValue('datasetId', datasetId);
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Mutation for starting a training job
  const trainMutation = useMutation({
    mutationFn: async (formValues: any) => {
      // First simulate the API call to create a new version
      await ModelService.trainNewVersion(model.id, {
        ...formValues,
        dataset: datasets.find(d => d.id === formValues.datasetId)
      });

      // Then simulate the training process
      setTrainingStatus({
        active: true,
        log: ["Initializing training environment..."],
        progress: 0
      });

      // Simulate progress updates
      return new Promise<void>((resolve) => {
        const datasetName = datasets.find(d => d.id === formValues.datasetId)?.name || "unknown dataset";
        let progress = 0;
        const logMessages = [
          `Loading dataset: ${datasetName}...`,
          "Preprocessing images...",
          "Building model architecture...",
          "Starting training loop...",
          "Epoch 1/10 completed. Loss: 0.723",
          "Epoch 2/10 completed. Loss: 0.612",
          "Epoch 3/10 completed. Loss: 0.541",
          "Epoch 4/10 completed. Loss: 0.498",
          "Epoch 5/10 completed. Loss: 0.452",
          "Epoch 6/10 completed. Loss: 0.411",
          "Epoch 7/10 completed. Loss: 0.387",
          "Epoch 8/10 completed. Loss: 0.365",
          "Epoch 9/10 completed. Loss: 0.348",
          "Epoch 10/10 completed. Loss: 0.331",
          "Running evaluation on test set...",
          "Saving model weights and artifacts...",
          "Training completed successfully!"
        ];

        const interval = setInterval(() => {
          if (progress < logMessages.length) {
            setTrainingStatus(prev => ({
              active: true,
              log: [...prev.log, logMessages[progress]],
              progress: Math.min(100, Math.round((progress + 1) * 100 / logMessages.length))
            }));
            progress++;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              resolve();
            }, 1000);
          }
        }, 1000);
      });
    },
    onSuccess: () => {
      toast.success("Training completed successfully!");
      setTimeout(() => {
        navigate(`/projects/${projectId}/models/${model.id}`);
      }, 2000);
    },
    onError: (error) => {
      toast.error("Training failed", {
        description: error.message,
      });
      setTrainingStatus({
        active: false,
        log: [],
        progress: 0
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: any) => {
    trainMutation.mutate(data);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, we'd read and parse the file
    toast.info(`Config file "${file.name}" selected.`, {
      description: "File will be used for model training configuration."
    });
  };

  // Handle code editor change
  const handleConfigCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // In a real app, we'd validate the JSON/YAML
  };

  const getModelTypeSpecificParams = () => {
    switch(model.task) {
      case "classification":
        return (
          <>
            <FormItem>
              <FormLabel>Number of Classes</FormLabel>
              <FormControl>
                <Input type="number" defaultValue="10" min="1" />
              </FormControl>
              <FormDescription>
                The number of categories to classify
              </FormDescription>
            </FormItem>
            <FormItem>
              <FormLabel>Class Weights</FormLabel>
              <div className="flex gap-2">
                <Switch defaultChecked id="class-weights" />
                <Label htmlFor="class-weights">Apply class weights for imbalanced data</Label>
              </div>
            </FormItem>
          </>
        );
      case "object-detection":
        return (
          <>
            <FormItem>
              <FormLabel>IOU Threshold</FormLabel>
              <FormControl>
                <Input type="number" defaultValue="0.5" min="0" max="1" step="0.01" />
              </FormControl>
              <FormDescription>
                Intersection over Union threshold for detection
              </FormDescription>
            </FormItem>
            <FormItem>
              <FormLabel>Confidence Threshold</FormLabel>
              <FormControl>
                <Input type="number" defaultValue="0.25" min="0" max="1" step="0.01" />
              </FormControl>
            </FormItem>
          </>
        );
      case "segmentation":
        return (
          <>
            <FormItem>
              <FormLabel>Mask Format</FormLabel>
              <Select defaultValue="binary">
                <SelectTrigger>
                  <SelectValue placeholder="Select mask format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="binary">Binary</SelectItem>
                  <SelectItem value="multiclass">Multi-class</SelectItem>
                  <SelectItem value="instance">Instance</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Type of segmentation masks</FormDescription>
            </FormItem>
            <FormItem>
              <FormLabel>Loss Function</FormLabel>
              <Select defaultValue="dice">
                <SelectTrigger>
                  <SelectValue placeholder="Select loss function" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dice">Dice Loss</SelectItem>
                  <SelectItem value="bce">Binary Cross Entropy</SelectItem>
                  <SelectItem value="focal">Focal Loss</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </>
        );
      case "llm":
      case "vlm":
        return (
          <>
            <FormItem>
              <FormLabel>Base Model</FormLabel>
              <Select defaultValue="bert-base">
                <SelectTrigger>
                  <SelectValue placeholder="Select base model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bert-base">BERT Base</SelectItem>
                  <SelectItem value="roberta">RoBERTa</SelectItem>
                  <SelectItem value="t5-base">T5 Base</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Pre-trained model to fine-tune</FormDescription>
            </FormItem>
            <FormItem>
              <FormLabel>Sequence Length</FormLabel>
              <FormControl>
                <Input type="number" defaultValue="512" min="32" />
              </FormControl>
            </FormItem>
          </>
        );
      default:
        return null;
    }
  };

  // Check if training is in progress
  const isTraining = trainingStatus.active || trainMutation.isPending;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Training Configuration</CardTitle>
          <CardDescription>
            Configure the parameters for your new model version
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id="training-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                  <TabsTrigger value="basic" disabled={isTraining}>
                    <Database className="w-4 h-4 mr-2" /> Dataset
                  </TabsTrigger>
                  <TabsTrigger value="params" disabled={isTraining}>
                    <Sliders className="w-4 h-4 mr-2" /> Parameters
                  </TabsTrigger>
                  <TabsTrigger value="compute" disabled={isTraining}>
                    <Cpu className="w-4 h-4 mr-2" /> Compute
                  </TabsTrigger>
                  <TabsTrigger value="advanced" disabled={isTraining}>
                    <FileCode2 className="w-4 h-4 mr-2" /> Advanced
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="baseVersion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Version</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isTraining}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a version" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="start-new">Start from scratch</SelectItem>
                            {model.versions
                              .filter(v => v.status === "trained")
                              .sort((a, b) => b.version_number - a.version_number)
                              .map(version => (
                                <SelectItem key={version.id} value={version.id}>
                                  v{version.version_number}
                                  {version.tags.includes("production") ? " (Production)" : ""}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Starting from an existing version can speed up training
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="datasetId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Dataset</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => handleDatasetChange(value)}
                          disabled={isTraining}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a dataset" />
                          </SelectTrigger>
                          <SelectContent>
                            {datasets.map(dataset => (
                              <SelectItem key={dataset.id} value={dataset.id}>
                                {dataset.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the dataset to use for training
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedDataset && (
                    <div className="rounded-md bg-muted/50 p-4 mt-2">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">{selectedDataset.name}</h4>
                          <dl className="text-sm text-muted-foreground space-y-1">
                            {selectedDataset.itemCount && (
                              <div className="flex gap-2">
                                <dt className="font-medium">Items:</dt>
                                <dd>{selectedDataset.itemCount.toLocaleString()}</dd>
                              </div>
                            )}
                            {selectedDataset.createdAt && (
                              <div className="flex gap-2">
                                <dt className="font-medium">Created:</dt>
                                <dd>{formatDate(selectedDataset.createdAt)}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="params" className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="epochs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Epochs: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            defaultValue={[field.value]}
                            max={100}
                            min={1}
                            step={1}
                            disabled={isTraining}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Number of complete passes through the dataset
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="batchSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch Size: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            defaultValue={[field.value]}
                            max={256}
                            min={1}
                            step={1}
                            disabled={isTraining}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Number of samples processed before updating weights
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="learningRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Learning Rate: {field.value}
                        </FormLabel>
                        <FormControl>
                          <Slider
                            defaultValue={[field.value * 1000]}
                            max={10}
                            min={0.1}
                            step={0.1}
                            disabled={isTraining}
                            onValueChange={(vals) => field.onChange(vals[0] / 1000)}
                          />
                        </FormControl>
                        <FormDescription>
                          Step size for gradient descent optimization
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Model-specific parameters */}
                  {getModelTypeSpecificParams()}
                </TabsContent>

                <TabsContent value="compute" className="pt-4">
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Compute Instance</FormLabel>
                      <Select defaultValue="gpu-standard" disabled={isTraining}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select instance type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpu-small">CPU Small (2 vCPUs, 8GB RAM)</SelectItem>
                          <SelectItem value="cpu-medium">CPU Medium (4 vCPUs, 16GB RAM)</SelectItem>
                          <SelectItem value="gpu-standard">GPU Standard (1 GPU, 16GB VRAM)</SelectItem>
                          <SelectItem value="gpu-large">GPU Large (4 GPUs, 64GB VRAM)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Compute resources to allocate for training
                      </FormDescription>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Distributed Training</FormLabel>
                      <div className="flex gap-2">
                        <Switch id="distributed" disabled={isTraining} />
                        <Label htmlFor="distributed">Enable distributed training across multiple nodes</Label>
                      </div>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Mixed Precision</FormLabel>
                      <div className="flex gap-2">
                        <Switch id="mixed-precision" defaultChecked disabled={isTraining} />
                        <Label htmlFor="mixed-precision">Use mixed precision (FP16) to speed up training</Label>
                      </div>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Early Stopping</FormLabel>
                      <div className="flex gap-2">
                        <Switch id="early-stopping" defaultChecked disabled={isTraining} />
                        <Label htmlFor="early-stopping">Stop training if validation metrics don't improve</Label>
                      </div>
                      <FormDescription>
                        Patience: 5 epochs
                      </FormDescription>
                    </FormItem>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="pt-4">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <FormLabel>Configuration File</FormLabel>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isTraining}
                          asChild
                        >
                          <label htmlFor="config-file" className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Config
                            <input
                              id="config-file"
                              type="file"
                              className="hidden"
                              accept=".yaml,.json"
                              onChange={handleFileUpload}
                              disabled={isTraining}
                            />
                          </label>
                        </Button>
                      </div>
                      <FormDescription>
                        Upload a YAML or JSON configuration file
                      </FormDescription>
                    </div>

                    <div className="space-y-2">
                      <FormLabel>Raw Configuration</FormLabel>
                      <Textarea
                        placeholder="# YAML configuration
epochs: 10
batch_size: 32
learning_rate: 0.001
model_config:
  architecture: resnet50
  pretrained: true
  freeze_layers: 5"
                        className="font-mono text-sm"
                        rows={10}
                        disabled={isTraining}
                        onChange={handleConfigCodeChange}
                      />
                      <FormDescription>
                        Directly edit the training configuration
                      </FormDescription>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-5">
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}/models/${model.id}`)}
            disabled={isTraining}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="training-form"
            disabled={isTraining}
          >
            {isTraining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isTraining ? "Training..." : "Start Training"}
          </Button>
        </CardFooter>
      </Card>

      {/* Training Log */}
      {trainingStatus.active && (
        <Card>
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${trainingStatus.progress}%` }}
              />
            </div>
            <CardDescription>
              {trainingStatus.progress}% complete
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-64 overflow-auto">
            <div className="bg-muted/50 p-4 rounded-md font-mono text-sm">
              {trainingStatus.log.map((line, index) => (
                <div key={index} className="pb-1">
                  <span className="text-muted-foreground">[{new Date().toLocaleTimeString()}]</span>{" "}
                  {line}
                </div>
              ))}
              {isTraining && (
                <div className="animate-pulse">
                  <span className="text-muted-foreground">[{new Date().toLocaleTimeString()}]</span>{" "}
                  _
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrainingForm;