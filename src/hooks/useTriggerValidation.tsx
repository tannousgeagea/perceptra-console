import { useMutation } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";

export const useTriggerValidation = (taskId: string) => {
  const mutation = useMutation({
    mutationFn: async (modelVersionId: number) => {
      const res = await fetch(`${baseURL}/api/v1/validate-model/${modelVersionId}`, {
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
