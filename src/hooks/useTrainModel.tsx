import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";

interface TrainModelPayload {
  dataset_version_id: string;
  parent_version_id: string | null;
  config: {
    epochs: number;
    batch_size: number;
    learning_rate: number;
    [key: string]: any;
  };
  compute_profile_id?: string;
  agent_id?: string;
}

interface TrainModelResponse {
  model_version_id: string;
  version_number: number;
  training_session_id: string;
  task_id: string;
  status: string;
  compute_provider?: string;
  instance_type?: string;
  message?: string;
}

export const useTrainModel = (
  options?: UseMutationOptions<TrainModelResponse, Error, any>
) => {
  return useMutation<TrainModelResponse, Error, any>({
    mutationFn: async (formData: any) => {
      const payload: TrainModelPayload = {
        parent_version_id: formData.baseVersion === "start-new" ? null : formData.baseVersion,
        dataset_version_id: formData.datasetId,
        config: {
          epochs: formData.epochs,
          batch_size: formData.batchSize,
          learning_rate: formData.learningRate,
        },
        ...(formData.computeProfileId ? { compute_profile_id: formData.computeProfileId } : {}),
        ...(formData.agentId ? { agent_id: formData.agentId } : {}),
      };

      const res = await apiFetch(`/api/v1/models/${formData.modelId}/train`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Training failed");
      }

      return res.json() as Promise<TrainModelResponse>;
    },
    ...options,
  });
};
