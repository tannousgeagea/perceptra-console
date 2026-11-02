import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/services/apiClient";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import type { Project, ProjectUpdate } from "@/types/project";

const listKey = (orgId?: string) => ["userAssignedProjects", orgId];

/** FastAPI errors carry `detail` as a string or a validation object. */
async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
    if (body?.detail) return JSON.stringify(body.detail);
  } catch {
    // non-JSON body
  }
  if (response.status === 403) return "You don't have permission to do this.";
  return fallback;
}

export const updateProject = async (projectId: string, data: ProjectUpdate): Promise<Project> => {
  const response = await apiFetch(`/api/v1/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await errorMessage(response, "Failed to update project"));
  return response.json();
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const response = await apiFetch(`/api/v1/projects/${projectId}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await errorMessage(response, "Failed to delete project"));
};

/**
 * Edit a project. The list updates optimistically and rolls back on error;
 * the project detail cache (sidebar, header) is replaced with the server copy.
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const key = listKey(currentOrganization?.id);

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ProjectUpdate }) =>
      updateProject(projectId, data),
    onMutate: async ({ projectId, data }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Project[]>(key);
      queryClient.setQueryData<Project[]>(key, (old) =>
        old?.map((p) => (p.project_id === projectId ? { ...p, ...data } as Project : p))
      );
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error.message);
    },
    onSuccess: (project) => {
      queryClient.setQueryData(["project", project.project_id, currentOrganization?.id], project);
      toast.success("Project updated");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
};

/** Delete (soft) a project; it disappears from the list immediately. */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const key = listKey(currentOrganization?.id);

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Project[]>(key);
      queryClient.setQueryData<Project[]>(key, (old) => old?.filter((p) => p.project_id !== projectId));
      return { previous };
    },
    onError: (error: Error, _projectId, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error.message);
    },
    onSuccess: (_data, projectId) => {
      queryClient.removeQueries({ queryKey: ["project", projectId] });
      toast.success("Project deleted");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
};
