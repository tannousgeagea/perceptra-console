
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";
import { ModelDetail } from "@/types/models";
import ValidationImages from "@/components/validation/ValidationImages";
import { useValidationImages } from "@/hooks/useValidationImages";

/**
 * The model's predictions next to the ground truth on its validation images,
 * per trained version (the same data as a training run's "Val Images" tab).
 */
const ModelVisualResults: React.FC<{ model: ModelDetail }> = ({ model }) => {
  const trainedVersions = model.versions
    .filter(v => v.status === "trained" || v.status === "deployed")
    .sort((a, b) => b.version_number - a.version_number);

  const [selectedVersion, setSelectedVersion] = useState<string>(
    model.production_version?.id || trainedVersions[0]?.id || ""
  );
  const versionPk = model.versions.find(v => v.id === selectedVersion)?.pk;

  const { data, isLoading, isError, refetch } = useValidationImages(versionPk, 100, 0);

  const renderVisualization = () => {
    if (trainedVersions.length === 0) {
      return <p className="py-8 text-center text-sm text-muted-foreground">Results appear here once a version has finished training.</p>;
    }
    if (isLoading) {
      return <p className="py-8 text-center text-sm text-muted-foreground">Loading results…</p>;
    }
    if (isError) {
      return <p className="py-8 text-center text-sm text-destructive">Couldn't load this version's results. Try again in a moment.</p>;
    }
    return (
      <ValidationImages
        validationImages={data?.results ?? []}
        modelVersionId={versionPk}
        onValidationComplete={() => refetch()}
      />
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Results Visualization</CardTitle>
          <CardDescription>
            Predictions compared with the ground truth on each version's validation images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Version
              </label>
              <Select 
                value={selectedVersion} 
                onValueChange={setSelectedVersion}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Version" />
                </SelectTrigger>
                <SelectContent>
                  {trainedVersions
                    .map(version => (
                      <SelectItem
                        key={version.id}
                        value={version.id}
                      >
                        v{version.version_number}
                        {version?.deployment_status === "production" ? " (Production)" : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {renderVisualization()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelVisualResults;