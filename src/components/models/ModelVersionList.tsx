
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Check, TagIcon, Database } from "lucide-react";
import { VersionTag } from "@/types/models";
import { ModelArtifact, ModelDetail, ModelVersion } from "@/hooks/useModels";
import { ModelService } from "./ModelService";
import { Button } from "@/components/ui/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/ui/table";
import { Badge } from "@/components/ui/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/ui/tooltip";

interface ModelVersionsListProps {
  model: ModelDetail;
  projectId: string;
}

const ModelVersionsList: React.FC<ModelVersionsListProps> = ({ model, projectId }) => {
  const queryClient = useQueryClient();
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


  // Get badge for version status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "trained":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-0">Trained</Badge>;
      case "training":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-0">Training</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-0">Failed</Badge>;
      case "draft":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-0">Draft</Badge>;
      case "deployed":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-0">Deployed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Mutation to set a version tag
  const tagMutation = useMutation({
    mutationFn: ({ modelId, versionId, tag, value }: { modelId: string; versionId: string; tag: string; value: boolean }) =>
      ModelService.setVersionTag(modelId, versionId, tag, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["model", model.id] });
      toast.success("Version tag updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update version tag", {
        description: error.message,
      });
    },
  });

  // Toggle version selection
  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions((prev) =>
      prev.includes(versionId)
        ? prev.filter((id) => id !== versionId)
        : [...prev, versionId]
    );
  };

  // Are we comparing versions
  const isComparing = selectedVersions.length > 0;

  // Download artifacts
  const handleDownload = (artifactType: keyof ModelArtifact, version: ModelVersion) => {
    // In a real app, this would download the file
    toast.info(`Downloading ${artifactType} for version ${version.version_number}`, {
      description: `This would download ${version.artifacts[artifactType] || "the file"}`,
    });
  };

  // Set version tag
  const handleSetTag = (version: ModelVersion, tag: VersionTag, value: boolean) => {
    tagMutation.mutate({
      modelId: model.id,
      versionId: version.id,
      tag,
      value,
    });
  };

  return (
    <div className="space-y-4">
      {isComparing && (
        <div className="bg-muted p-3 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-medium">Compare Mode:</span>{" "}
            <span className="text-muted-foreground">
              {selectedVersions.length} versions selected
            </span>
          </div>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={selectedVersions.length !== 2}
            >
              Compare Versions
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedVersions([])}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dataset</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>By</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {model.versions
              .sort((a, b) => b.version_number - a.version_number)
              .map((version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.id)}
                      onChange={() => toggleVersionSelection(version.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    v{version.version_number}
                  </TableCell>
                  <TableCell>{getStatusBadge(version.status)}</TableCell>
                  <TableCell>
                    {version.dataset ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              <Database className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="truncate max-w-[120px]">
                                {version.dataset.name}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="space-y-1">
                              <p className="font-medium">{version.dataset.name}</p>
                              {version.dataset.item_count && (
                                <p className="text-xs text-muted-foreground">
                                  {version.dataset.item_count} items
                                </p>
                              )}
                              {version.dataset.created_at && (
                                <p className="text-xs text-muted-foreground">
                                  Created: {formatDate(version.dataset.created_at)}
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(version.created_at)}</TableCell>
                  <TableCell className="max-w-[120px] truncate">
                    {version.created_by}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {version.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {version.status === "trained" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <TagIcon className="h-4 w-4" />
                              <span className="sr-only">Tag version</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Tag Version</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleSetTag(version, "production", true)}
                            >
                              {version.tags.includes("production") && (
                                <Check className="mr-2 h-4 w-4" />
                              )}
                              Production
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSetTag(version, "staging", true)}
                            >
                              {version.tags.includes("staging") && (
                                <Check className="mr-2 h-4 w-4" />
                              )}
                              Staging
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSetTag(version, "baseline", true)}
                            >
                              {version.tags.includes("baseline") && (
                                <Check className="mr-2 h-4 w-4" />
                              )}
                              Baseline
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSetTag(version, "experimental", true)}
                            >
                              {version.tags.includes("experimental") && (
                                <Check className="mr-2 h-4 w-4" />
                              )}
                              Experimental
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      
                      {version.artifacts && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Download</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {version.artifacts.onnx && (
                              <DropdownMenuItem
                                onClick={() => handleDownload("onnx", version)}
                              >
                                ONNX Model
                              </DropdownMenuItem>
                            )}
                            {version.artifacts.checkpoint && (
                              <DropdownMenuItem
                                onClick={() => handleDownload("checkpoint", version)}
                              >
                                Weights
                              </DropdownMenuItem>
                            )}
                            {version.artifacts.logs && (
                              <DropdownMenuItem
                                onClick={() => handleDownload("logs", version)}
                              >
                                Training Logs
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ModelVersionsList;