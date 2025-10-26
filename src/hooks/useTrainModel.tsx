import { trainURL } from "@/components/api/base";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

interface TrainModelPayload {
  model_id: string;
  base_version_id: string | null;
  dataset_version_id: string;
  config: {
    epochs: number;
    batch_size: number;
    learning_rate: number;
    [key: string]: any;
  };
}

interface TrainModelResponse {
  training_session_id: string;
  status: "pending" | "started"; // can adjust based on your API
  message?: string;
}

export const useTrainModel = (
  options?: UseMutationOptions<TrainModelResponse, Error, any>
) => {
  return useMutation<TrainModelResponse, Error, any>({
    mutationFn: async (formData: any) => {
      const payload: TrainModelPayload = {
        model_id: formData.modelId,
        base_version_id: formData.baseVersion === "start-new" ? null : formData.baseVersion,
        dataset_version_id: formData.datasetId,
        config: {
          epochs: formData.epochs,
          batch_size: formData.batchSize,
          learning_rate: formData.learningRate,
        },
      };

      const token = localStorage.getItem("token") || sessionStorage.getItem('token');
      const res = await fetch(`${trainURL}/api/v1/train`, {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Training failed");
      }

      return await res.json() as TrainModelResponse;
    },
    ...options,
  });
};

