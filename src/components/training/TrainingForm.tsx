import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/ui/card";
import { Model, Dataset } from "@/types/models";
import { useProjectDatasets } from "@/hooks/useProjectDatasets";
import TrainingTabs from "./TrainingTabs";
import TrainingProgress from "./TrainingProgress";
import { useTrainModel } from "@/hooks/useTrainModel";
import { useTrainingProgress } from "@/hooks/useTrainingProgress";

interface TrainingFormProps {
  model: Model;
  projectId: string;
}

const TrainingForm: React.FC<TrainingFormProps> = ({ model, projectId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [trainingSessionId, setTrainingSessionId] = useState<string | null>(null);
  const { data: datasets = [], isLoading: datasetsLoading } = useProjectDatasets(projectId);

  const { mutate: triggerTraining } = useTrainModel({
    onSuccess: (data) => {
      toast.success("Training started...");
      setTrainingSessionId(data.training_session_id); // backend should return this
    },
    onError: (err) => {
      toast.error("Training failed", { description: err.message });
    },
  });
  
  const training = useTrainingProgress(trainingSessionId);
  useEffect(() => {
    if (training.isComplete) {
      toast.success("Training completed successfully!");
      setTimeout(() => navigate(`/projects/${projectId}/models/${model.id}`), 1500);
    }
  }, [training]);

  const form = useForm({
    defaultValues: {
      baseVersion: model.versions.length > 0 ? model.versions[0].id : "",
      datasetId: datasets.length > 0 ? datasets[0].id : "",
      epochs: 10,
      batchSize: 32,
      learningRate: 0.001,
      advancedConfig: false,
    },
  });

  const handleDatasetChange = (datasetId: string) => {
    const dataset = datasets.find((d) => d.id === datasetId) || null;
    setSelectedDataset(dataset);
    form.setValue("datasetId", datasetId);
  };

  const onSubmit = (formValues: any) => {
    triggerTraining({
      ...formValues,
      modelId: model.id,
    });
  };

  const isTraining = trainingSessionId !== null && !training.isComplete;
  if (datasetsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 mr-2 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading datasets...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <TrainingTabs
        model={model}
        form={form}
        isTraining={isTraining}
        datasets={datasets}
        selectedDataset={selectedDataset}
        onDatasetChange={handleDatasetChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSubmit={onSubmit}
        projectId={projectId}
      />

      {trainingSessionId&& (
        <TrainingProgress
          log={training.logs}
          progress={training.progress}
          isTraining={isTraining}
        />
      )}
    </div>
  );
};

export default TrainingForm;
