import React from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/ui/card";
import { Button } from "@/components/ui/ui/button";
import { Badge } from "@/components/ui/ui/badge";
import { ModelDetail } from "@/types/models";
import { toast } from "sonner";
import { useDeployVersion, useUndeployVersion } from "@/hooks/useModelDeploy";
import { Layers, Settings, ArrowUpRight, ArrowDownLeft, Copy } from "lucide-react";

const deploymentBadge = (status: string) => {
  switch (status) {
    case "production":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "staging":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "retired":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const ModelDeploymentView: React.FC<{ model: ModelDetail }> = ({ model }) => {
  const deployMutation = useDeployVersion();
  const undeployMutation = useUndeployVersion();

  const productionVersion = model.versions.find(
    (v) => v.deployment_status === "production"
  );
  const stagingVersion = model.versions.find(
    (v) => v.deployment_status === "staging"
  );

  const trainedVersions = [...model.versions]
    .filter((v) => v.status === "trained")
    .sort((a, b) => b.version_number - a.version_number)
    .slice(0, 5);

  const inferenceEndpoint = `${import.meta.env.VITE_API_URL ?? ""}/api/v1/infer/${model.id}`;

  return (
    <div className="space-y-6">
      {/* Status overview */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Status</CardTitle>
          <CardDescription>Current inference service configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2 text-sm">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Production
              </h3>
              {productionVersion ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-0 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    v{productionVersion.version_number}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Deployed</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No version in production</p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4 text-muted-foreground" />
                Staging
              </h3>
              {stagingVersion ? (
                <Badge variant="outline" className="border-0 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  v{stagingVersion.version_number}
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4 text-muted-foreground" />
                API Status
              </h3>
              {productionVersion ? (
                <Badge variant="outline" className="border-0 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="border-0 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Inactive
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-6 border rounded-md p-4">
            <h3 className="font-medium mb-2 text-sm">Inference Endpoint</h3>
            <div className="bg-muted p-2 rounded flex justify-between items-center">
              <code className="text-xs truncate">{inferenceEndpoint}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(inferenceEndpoint);
                  toast.success("Endpoint copied");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deploy a version */}
      <Card>
        <CardHeader>
          <CardTitle>Deploy Version</CardTitle>
          <CardDescription>Choose a trained version to deploy to staging or production</CardDescription>
        </CardHeader>
        <CardContent>
          {trainedVersions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trained versions available.</p>
          ) : (
            <div className="space-y-3">
              {trainedVersions.map((version) => {
                const isProduction = version.deployment_status === "production";
                const isStaging = version.deployment_status === "staging";
                const isDeployed = isProduction || isStaging;
                return (
                  <div
                    key={version.id}
                    className={`border rounded-md p-4 ${isProduction ? "border-primary bg-primary/5" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Version {version.version_number}</span>
                        {isDeployed && (
                          <Badge
                            variant="outline"
                            className={`text-xs border-0 ${deploymentBadge(version.deployment_status)}`}
                          >
                            {version.deployment_status}
                          </Badge>
                        )}
                        {version.metrics?.f1_score !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            F1: {(version.metrics.f1_score * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!isProduction && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={deployMutation.isPending}
                            onClick={() =>
                              deployMutation.mutate({ versionId: version.id, targetEnv: "production" })
                            }
                          >
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                            Production
                          </Button>
                        )}
                        {!isStaging && !isProduction && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={deployMutation.isPending}
                            onClick={() =>
                              deployMutation.mutate({ versionId: version.id, targetEnv: "staging" })
                            }
                          >
                            Staging
                          </Button>
                        )}
                        {isDeployed && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground"
                            disabled={undeployMutation.isPending}
                            onClick={() => undeployMutation.mutate(version.id)}
                          >
                            <ArrowDownLeft className="h-3.5 w-3.5 mr-1" />
                            Undeploy
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelDeploymentView;
