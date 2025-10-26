import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormControl
} from "@/components/ui/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/ui/select";
import { FileText } from "lucide-react";
import { Dataset, Model } from "@/types/models";
import { UseFormReturn } from "react-hook-form";

interface DatasetTabProps {
  model: Model;
  form: UseFormReturn<any>;
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  onDatasetChange: (id: string) => void;
  isTraining: boolean;
}

const DatasetTab: React.FC<DatasetTabProps> = ({
  model,
  form,
  datasets,
  selectedDataset,
  onDatasetChange,
  isTraining
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <>
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
                  .sort((a, b) => b.versionNumber - a.versionNumber)
                  .map(version => (
                    <SelectItem key={version.id} value={version.id}>
                      v{version.versionNumber}{version.tags.includes("production") ? " (Production)" : ""}
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
              onValueChange={onDatasetChange}
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
    </>
  );
};

export default DatasetTab;
