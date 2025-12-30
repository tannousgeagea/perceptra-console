
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { 
  BarChart4, 
  Clock, 
  Code, 
  Database, 
  Layers, 
  Plus, 
  Settings, 
  Tag
} from "lucide-react";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import ModelVersionsList from "@/components/models/ModelVersionList";
import ModelVisualResults from "@/components/models/ModelVisualResults";
import ModelMetricsView from "@/components/models/ModelMetricView";
import ModelDeploymentView from "@/components/models/ModelDeploymentView";
import { useModelDetail } from "@/hooks/useModels";

const ModelDetail: React.FC = () => {
  const { projectId, modelId } = useParams<{ projectId: string; modelId: string }>();
  const { data: model, isLoading, error } = useModelDetail(modelId!);
    // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get the model type label for display
  const getModelTypeLabel = (type: string): string => {
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
  const getModelTypeColor = (type: string): string => {
    switch (type) {
      case "classification":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "object-detection":
        return "bg-green-100 text-green-800 border-green-200";
      case "segmentation":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "llm":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "vlm":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 w-full">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex gap-4 flex-wrap">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="bg-destructive/10 p-6 rounded-lg">
        <h3 className="font-bold text-destructive mb-2">Error Loading Model</h3>
        <p className="mb-4">We couldn't load the model details. Please try again.</p>
        <Button asChild>
          <Link to={`/projects/${projectId}/models`}>Back to Models</Link>
        </Button>
      </div>
    );
  }

  // Get production version if exists
  const productionVersion = model.production_version

  return (
    <div className="space-y-6 p-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{model.name}</h1>
            <Badge
              variant="outline"
              className={`${getModelTypeColor(model.task)} border-0`}
            >
              {getModelTypeLabel(model.task)}
            </Badge>
          </div>
          <p className="text-muted-foreground">{model.description}</p>
        </div>
        <Button asChild>
          <Link to={`/projects/${projectId}/models/${modelId}/train`}>
            <Plus className="mr-2 h-4 w-4" /> Train New Version
          </Link>
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Layers className="h-4 w-4" />
            <span className="text-sm font-medium">Versions</span>
          </div>
          <p className="text-2xl font-bold">{model.versions.length}</p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Tag className="h-4 w-4" />
            <span className="text-sm font-medium">Production</span>
          </div>
          <p className="text-2xl font-bold">
            {productionVersion ? `v${productionVersion.version_number}` : "None"}
          </p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Last Update</span>
          </div>
          <p className="text-lg font-medium">{formatDate(model.updated_at)}</p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">Created By</span>
          </div>
          <p className="text-sm font-medium truncate">{model.created_by}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="versions" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Versions
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" /> Results
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Code className="h-4 w-4" /> Metrics
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Deployment
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="versions" className="mt-6">
          <ModelVersionsList model={model} projectId={projectId || ''} />
        </TabsContent>
        
        <TabsContent value="visual" className="mt-6">
          <ModelVisualResults model={model} />
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-6">
          <ModelMetricsView model={model} />
        </TabsContent>
        
        <TabsContent value="deployment" className="mt-6">
          <ModelDeploymentView model={model} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelDetail;