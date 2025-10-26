import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";

export const useDeleteJob = (projectId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (jobId: string) => {
        const res = await fetch(`${baseURL}/api/v1/jobs/${jobId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete job");
        },
        onSuccess: (_, jobId) => {
            queryClient.invalidateQueries({ queryKey: ['project-jobs', projectId] });
            queryClient.removeQueries({ queryKey: ["job", jobId] });
        },
    });
};
