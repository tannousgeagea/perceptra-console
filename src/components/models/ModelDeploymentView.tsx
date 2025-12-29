import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/ui/card";
import { Button } from "@/components/ui/ui/button";
import { ModelDetail } from "@/types/models";
import { Badge } from "@/components/ui/ui/badge";
import { Switch } from "@/components/ui/ui/switch";
import { Label } from "@/components/ui/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import { Layers, Settings, Play, Code, Link } from "lucide-react";


const ModelDeploymentView: React.FC<{ model: ModelDetail }> = ({ model }) => {
  const [autoDeployEnabled, setAutoDeployEnabled] = useState<boolean>(false);
  
  // Get production version if it exists
  const productionVersion = model.versions.find(
    (v) => v.id === model.production_version?.id
  );
  
  // Get latest version
  const latestVersion = [...model.versions]
    .filter((v) => v.status === "trained")
    .sort((a, b) => b.version_number - a.version_number)[0];

  // Simulated mutation for deploying a model
  const deployMutation = useMutation({
    mutationFn: async () => {
      // Simulate API call
      return new Promise<void>((resolve) => {
        setTimeout(resolve, 1500);
      });
    },
    onSuccess: () => {
      toast.success("Model deployed successfully!");
    },
    onError: () => {
      toast.error("Failed to deploy model.");
    },
  });

  // Endpoint URL
  const apiEndpoint = "https://api.visionnest.ai/models/" + model.id;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deployment Status</CardTitle>
          <CardDescription>Current deployment configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Production Version
              </h3>
              {productionVersion ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-0">
                    v{productionVersion.version_number}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Deployed
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No version in production</p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                API Status
              </h3>
              {productionVersion ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-0">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-0">
                  Inactive
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Play className="h-4 w-4 text-muted-foreground" />
                Auto-Deploy
              </h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-deploy"
                  checked={autoDeployEnabled}
                  onCheckedChange={setAutoDeployEnabled}
                />
                <Label htmlFor="auto-deploy">
                  {autoDeployEnabled ? "Enabled" : "Disabled"}
                </Label>
              </div>
            </div>
          </div>

          <div className="mt-6 border rounded-md p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Link className="h-4 w-4 text-muted-foreground" />
              API Endpoint
            </h3>
            <div className="bg-muted p-2 rounded flex justify-between items-center">
              <code className="text-sm">{apiEndpoint}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(apiEndpoint);
                  toast.success("API endpoint copied to clipboard!");
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deploy Model</CardTitle>
          <CardDescription>
            Choose a version to deploy to production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="version">
            <TabsList className="mb-4">
              <TabsTrigger value="version">Version</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
            </TabsList>
            <TabsContent value="version">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Select the version you want to deploy to production.
                </p>

                {model.versions
                  .filter((v) => v.status === "trained")
                  .sort((a, b) => b.version_number - a.version_number)
                  .slice(0, 3)
                  .map((version) => (
                    <div
                      key={version.id}
                      className={`border rounded-md p-4 ${
                        version.id === model.production_version?.id
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">
                            Version {version.version_number}
                          </h4>
                          {version.id === model.production_version?.id && (
                            <Badge className="mt-1 bg-primary/20 text-primary border-0">
                              Current
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          disabled={
                            deployMutation.isPending ||
                            version.id === model.production_version?.id
                          }
                          onClick={() => deployMutation.mutate()}
                        >
                          {version.id === model.production_version?.id
                            ? "Deployed"
                            : "Deploy"}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="configuration">
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    Deployment Configuration
                  </h3>
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
{`{
  "model_id": "${model.id}",
  "version_id": "${latestVersion?.id || ""}",
  "compute": {
    "instance_type": "ml.m5.large",
    "min_instances": 1,
    "max_instances": 3,
    "auto_scaling": true
  },
  "environment": {
    "framework": "pytorch",
    "version": "1.12.0"
  },
  "inference_options": {
    "timeout_ms": 5000,
    "max_batch_size": 16
  }
}`}
                  </pre>
                </div>

                <Button
                  className="w-full"
                  onClick={() => deployMutation.mutate()}
                  disabled={deployMutation.isPending || !latestVersion}
                >
                  {deployMutation.isPending ? "Deploying..." : "Deploy with Configuration"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelDeploymentView;