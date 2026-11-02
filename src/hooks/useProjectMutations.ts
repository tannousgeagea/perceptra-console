import { useMutation, useQueryClient, type QueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/services/apiClient";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import type { Project, ProjectUpdate } from "@/types/project";

/** Prefix shared by every variant of the projects list (e.g. with/without inactive). */
const listPrefix = (orgId?: string) => ["userAssignedProjects", orgId];

type ListSnapshot = [QueryKey, Project[] | undefined][];

/** Apply `update` to every cached list variant; returns a snapshot for rollback. */
async function patchLists(
  queryClient: QueryClient,
  prefix: QueryKey,
  update: (projects: Project[]) => Project[]
): Promise<ListSnapshot> {
  await queryClient.cancelQueries({ queryKey: prefix });
  const snapshot = queryClient.getQueriesData<Project[]>({ queryKey: prefix });
  queryClient.setQueriesData<Project[]>({ queryKey: prefix }, (old) => (old ? update(old) : old));
  return snapshot;
}

const rollback = (queryClient: QueryClient, snapshot?: ListSnapshot) =>
  snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));

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

export const restoreProject = async (projectId: string): Promise<void> => {
  const response = await apiFetch(`/api/v1/projects/${projectId}/restore`, { method: "POST" });
  if (!response.ok) throw new Error(await errorMessage(response, "Failed to restore project"));
};

/**
 * Edit a project. Lists update optimistically and roll back on error;
 * the project detail cache (sidebar, header) is replaced with the server copy.
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const prefix = listPrefix(currentOrganization?.id);

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ProjectUpdate }) =>
      updateProject(projectId, data),
    onMutate: async ({ projectId, data }) => ({
      snapshot: await patchLists(queryClient, prefix, (list) =>
        list.map((p) => (p.project_id === projectId ? ({ ...p, ...data } as Project) : p))
      ),
    }),
    onError: (error: Error, _vars, context) => {
      rollback(queryClient, context?.snapshot);
      toast.error(error.message);
    },
    onSuccess: (project) => {
      queryClient.setQueryData(["project", project.project_id, currentOrganization?.id], project);
      toast.success("Project updated");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: prefix }),
  });
};

/**
 * Soft-delete a project. It leaves the list immediately, and the success
 * toast offers Undo (server-side restore) for a few seconds.
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const prefix = listPrefix(currentOrganization?.id);

  const undo = async (project: Project) => {
    const toastId = toast.loading(`Restoring “${project.name}”…`);
    try {
      await restoreProject(project.project_id);
      toast.success(`“${project.name}” restored`, { id: toastId });
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
    } finally {
      queryClient.invalidateQueries({ queryKey: prefix });
    }
  };

  return useMutation({
    mutationFn: (project: Project) => deleteProject(project.project_id),
    onMutate: async (project) => ({
      snapshot: await patchLists(queryClient, prefix, (list) =>
        list.filter((p) => p.project_id !== project.project_id)
      ),
    }),
    onError: (error: Error, _project, context) => {
      rollback(queryClient, context?.snapshot);
      toast.error(error.message);
    },
    onSuccess: (_data, project) => {
      queryClient.removeQueries({ queryKey: ["project", project.project_id] });
      toast.success(`“${project.name}” deleted`, {
        duration: 8000,
        action: { label: "Undo", onClick: () => void undo(project) },
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: prefix }),
  });
};
