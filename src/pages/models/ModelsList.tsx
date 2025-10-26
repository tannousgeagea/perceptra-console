import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { ModelService } from "@/components/models/ModelService";
import { Model, ModelType } from "@/types/models";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { useModelsByProject } from "@/hooks/useModelsByProject";

const ModelsList: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [modelTypeFilter, setModelTypeFilter] = useState<string>("all");

  // Fetch models for this project
  // const {
  //   data: models,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ["models", projectId],
  //   queryFn: () => ModelService.getModelsByProjectId(projectId || ""),
  //   enabled: !!projectId,
  // });

  const { data: models, isLoading, error } = useModelsByProject(projectId || '');

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
          modelTypeFilter === "all" || model.type === modelTypeFilter;

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
        return "bg-blue-100 text-blue-800";
      case "object-detection":
        return "bg-green-100 text-green-800";
      case "segmentation":
        return "bg-purple-100 text-purple-800";
      case "llm":
        return "bg-amber-100 text-amber-800";
      case "vlm":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            <Link
              to={`/projects/${projectId}/models/${model.id}`}
              key={model.id}
            >
              <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
                <CardHeader>
                  <div className="flex justify-between items-start w-full">
                    <CardTitle className="truncate">{model.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={`${getModelTypeColor(model.type)} border-0`}
                    >
                      {getModelTypeLabel(model.type)}
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
                      <p className="font-medium">{formatDate(model.updatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Versions</p>
                      <p className="font-medium">{model.versions.length}</p>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelsList;