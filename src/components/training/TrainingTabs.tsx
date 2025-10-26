// File: components/training/TrainingTabs.tsx
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import DatasetTab from "./tabs/DatasetTab";
import ParametersTab from "./tabs/ParametersTab";
import ComputeTab from "./tabs/ComputeTab";
import AdvancedTab from "./tabs/AdvancedTab";
import { Button } from "@/components/ui/ui/button";
import { Form } from "@/components/ui/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/ui/card";
import { Model, Dataset } from "@/types/models";
import { 
  Cpu, 
  Database, 
  FileCode2, 
  Loader2, 
  Sliders, 
  Upload,
  FileText
} from "lucide-react";

interface Props {
  model: Model;
  form: UseFormReturn<any>;
  isTraining: boolean;
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  onDatasetChange: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmit: (data: any) => void;
  projectId: string;
}

const TrainingTabs: React.FC<Props> = ({
  model,
  form,
  isTraining,
  datasets,
  selectedDataset,
  onDatasetChange,
  activeTab,
  setActiveTab,
  onSubmit,
  projectId
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Training Configuration</CardTitle>
        <CardDescription>
          Configure the parameters for your new model version
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form id="training-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <DatasetTab
                  form={form}
                  model={model}
                  datasets={datasets}
                  selectedDataset={selectedDataset}
                  onDatasetChange={onDatasetChange}
                  isTraining={isTraining}
                />
              </TabsContent>

              <TabsContent value="params" className="pt-4 space-y-6">
                <ParametersTab model={model} form={form} isTraining={isTraining} />
              </TabsContent>

              <TabsContent value="compute" className="pt-4">
                <ComputeTab isTraining={isTraining} />
              </TabsContent>

              <TabsContent value="advanced" className="pt-4">
                <AdvancedTab isTraining={isTraining} />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-5">
        <Button variant="outline" type="button" disabled={isTraining} onClick={() => location.href = `/projects/${projectId}/models/${model.id}`}>
          Cancel
        </Button>
        <Button type="submit" form="training-form" disabled={isTraining}>
          {isTraining ? "Training..." : "Start Training"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TrainingTabs;
