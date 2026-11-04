import { apiFetch } from '@/services/apiClient';
import { useMutation } from "@tanstack/react-query";

export const useTriggerValidation = (taskId: string) => {
  const mutation = useMutation({
    mutationFn: async (modelVersionId: number) => {
      const res = await apiFetch(`/api/v1/validate-model/${modelVersionId}`, {
        method: "POST",
        headers: {
          "X-Request-ID": taskId,
        }
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Validation failed");
      }

      return res.json()
    },
  });

  return mutation;
};
