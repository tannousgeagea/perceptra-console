import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BadgePlus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";
import { ModelType } from "@/types/models";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { 
  useProjectModels, 
  useUpdateModel, 
  useDeleteModel, 
  useDuplicateModel,
  useTriggerTraining,
} from "@/hooks/useModels";
import { ModelListItem, ModelDetail, ModelVersion, TrainingTriggerRequest } from "@/types/models";

import { toast } from "sonner";
import EditModelDialog from "@/components/models/EditModelDialog";
import DeleteModelDialog from "@/components/models/DeleteModelDialog";
import DuplicateModelDialog from "@/components/models/DuplicateModelDialog";
import StartTrainingDialog from "@/components/models/StartTrainingDialog";
import ModelCardActions from "@/components/models/ModelCardActions";

const ModelsList: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [modelTypeFilter, setModelTypeFilter] = useState<string>("all");
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);


  const [selectedModel, setSelectedModel] = useState<ModelListItem | null>(null);

  const { data: models, isLoading, error  } = useProjectModels(projectId!);
  const updateModel = useUpdateModel({
    onSuccess: (data) => {
      console.log('Model updated:', data.id);
    }
  });

  const deleteModel = useDeleteModel();
  const duplicateModel = useDuplicateModel({
    onSuccess: (data) => {
      console.log('Duplicated model:', data.id);
    }
  });

  // Use the hook with custom callbacks
  const triggerTraining = useTriggerTraining({
    onSuccess: (data) => {
      console.log('Training started:', data);
      // Or show the task details
      console.log(`Training task ${data.task_id} on ${data.compute_provider} ${data.instance_type}`);
    },
    onError: (error) => {
      console.error('Failed to start training:', error);
    },
    showToast: true,
  });

  // Filter models based on search query and type filter
  const filteredModels = models
    ? models.filter((model) => {
        const matchesSearch =
          searchQuery === "" ||
          model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesType =
          modelTypeFilter === "all" || model.task === modelTypeFilter;

        return matchesSearch && matchesType;
      })
    : [];

  // Get the model type label for display
  const getModelTypeLabel = (type: ModelType): string => {
    switch (type) {
      case "classification":
        return "Classification";
      case "object-detection":
        return "Object Detection";
      case "segmentation":
        return "Segmentation";
      case "llm":
        return "Language Model";
      case "vlm":
        return "Vision-Language Model";
      default:
        return type;
    }
  };

  // Get badge color based on model type
  const getModelTypeColor = (type: ModelType): string => {
    switch (type) {
      case "classification":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "object-detection":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "segmentation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "llm":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "vlm":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle edit model
  const handleEditModel = (model: ModelListItem) => {
    setSelectedModel(model);
    setEditDialogOpen(true);
  };

  // Handle save edited model
  const handleSaveModel = (updatedModel: ModelListItem) => {
    // Update model name and description
    updateModel.mutate({
      modelId: updatedModel.id,
      request: updatedModel
    }); 

    toast.success("Model updated successfully!", {
      description: `${updatedModel.name} has been updated.`,
    });
  };

  // Handle delete model
  const handleDeleteModel = (model: ModelListItem) => {
    setSelectedModel(model);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = (modelId: string) => {
    deleteModel.mutate(modelId)
    toast.success("Model deleted", {
      description: "The model has been permanently deleted.",
    });
  };

  const handleDuplicateModel = (model: ModelListItem) => {
    setSelectedModel(model);
    setDuplicateDialogOpen(true);
  };

  // Handle duplicate model
  const handleConfirmDuplicate = (model: ModelListItem, newName: string) => {
    const duplicatedModel: ModelListItem = {
      ...model,
      id: `model-${Date.now()}`,
      name: newName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version_count: 0,
    };

    duplicateModel.mutate({ 
      modelId:model.id, 
      newName: newName 
    });

    toast.success("Model duplicated!", {
      description: `${duplicatedModel.name} has been created.`,
    });
  };

  // Handle start training
  const handleStartTraining = (model: ModelListItem) => {
    setSelectedModel(model);
    setTrainingDialogOpen(true);
  };


  // Handle confirm training
  const handleConfirmTraining = (
    model: ModelDetail,
    request: TrainingTriggerRequest,
  ) => {

    triggerTraining.mutate({
      modelId: model.id,
      request
    });

    toast.success("Training started!", {
      description: `Training v${model.latest_version} of ${model.name} has begun.`,
    });
  };

  return (
    <div className="space-y-6 p-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Models</h1>
          <p className="text-muted-foreground">
            Manage and track models in your project
          </p>
        </div>
        <Button asChild>
          <Link to={`/projects/${projectId}/models/new`}>
            <BadgePlus className="mr-2 h-4 w-4" /> Create Model
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={modelTypeFilter} onValueChange={setModelTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All model types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All model types</SelectItem>
              <SelectItem value="classification">Classification</SelectItem>
              <SelectItem value="object-detection">Object Detection</SelectItem>
              <SelectItem value="segmentation">Segmentation</SelectItem>
              <SelectItem value="llm">Language Model</SelectItem>
              <SelectItem value="vlm">Vision-Language Model</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/3 mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-destructive/10 p-4 rounded-md">
          <p className="text-destructive">Error loading models. Please try again.</p>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="font-medium text-lg mb-2">No models found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || modelTypeFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by creating your first model"}
          </p>
          {!searchQuery && modelTypeFilter === "all" && (
            <Button asChild>
              <Link to={`/projects/${projectId}/models/new`}>
                Create New Model
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((model) => (
            <div key={model.id} className="relative group">
              <ModelCardActions
                onEdit={() => handleEditModel(model)}
                onDelete={() => handleDeleteModel(model)}
                onDuplicate={() => handleDuplicateModel(model)}
                onTrain={() => handleStartTraining(model)}
              />
              <Link
                to={`/projects/${projectId}/models/${model.id}`}
                key={model.id}
              >
                <Card className="hover:shadow-md transition-shadow overflow-hidden h-full border-border/50 hover:border-primary/30">
                  <CardHeader>
                    <div className="flex justify-between items-start pr-8 w-full">
                      <CardTitle className="line-clamp-1">{model.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={`${getModelTypeColor(model.task)} border-0 shrink-0`}
                      >
                        {getModelTypeLabel(model.task)}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {model.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="font-medium">{formatDate(model.updated_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Versions</p>
                        <p className="font-medium">{model.version_count}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {model.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {model.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{model.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 px-6 py-3">
                    <Button variant="ghost" className="w-full" asChild>
                      <div>View Details</div>
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Edit Model Dialog */}
      <EditModelDialog
        model={selectedModel}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveModel}
      />

      {/* Delete Model Dialog */}
      <DeleteModelDialog
        model={selectedModel}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      {/* Duplicate Model Dialog */}
      <DuplicateModelDialog
        model={selectedModel}
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        onConfirm={handleConfirmDuplicate}
      />
      
      {/* Start Training Dialog */}
      <StartTrainingDialog
        modelId={selectedModel?.id!}
        open={trainingDialogOpen}
        onOpenChange={setTrainingDialogOpen}
        onConfirm={handleConfirmTraining}
      />

    </div>
  );
};

export default ModelsList;