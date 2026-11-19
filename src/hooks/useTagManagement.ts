// hooks/useTagManagement.ts
//
// The organization's image and model tags: list with usage, rename / recolour /
// merge, delete. Tags belong to the organization, so a change made from a
// project's view applies everywhere.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, withQuery } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import type { ManagedTag, TagKind, TagUpdate } from '@/types/tags';

/** A rename into a name another tag already has: the server sends that tag back. */
export class TagNameTakenError extends Error {
  constructor(public existing: ManagedTag, message: string) {
    super(message);
    this.name = 'TagNameTakenError';
  }
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === 'string') return body.detail;
    if (body.detail?.message) return body.detail.message;
  } catch {
    // not JSON
  }
  return `Request failed (${res.status})`;
}

export const useManagedTags = (kind: TagKind, projectId?: string) => {
  const orgId = useAuth().getCurrentOrganization()?.id;
  return useQuery({
    queryKey: ['managed-tags', orgId, kind, projectId ?? null],
    queryFn: async (): Promise<ManagedTag[]> => {
      const res = await apiFetch(withQuery(`/api/v1/tags/${kind}`, { project_id: projectId }));
      if (!res.ok) throw new Error(await errorMessage(res));
      return res.json();
    },
    enabled: !!orgId,
  });
};

/** After a change: every tag list, and the pages that show tags on images and models. */
const useRefreshTagViews = () => {
  const queryClient = useQueryClient();
  return () => {
    for (const key of ['managed-tags', 'projectImageDetails', 'projectImages', 'images', 'projectModels', 'modelDetail']) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  };
};

export const useUpdateTag = (kind: TagKind) => {
  const refresh = useRefreshTagViews();
  return useMutation({
    mutationFn: async ({ id, update }: { id: number; update: TagUpdate }): Promise<ManagedTag> => {
      const res = await apiFetch(`/api/v1/tags/${kind}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(update),
      });
      if (res.status === 409) {
        const body = await res.json();
        throw new TagNameTakenError(body.detail.existing, body.detail.message);
      }
      if (!res.ok) throw new Error(await errorMessage(res));
      return res.json();
    },
    onSuccess: refresh,
  });
};

export const useDeleteTag = (kind: TagKind) => {
  const refresh = useRefreshTagViews();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiFetch(`/api/v1/tags/${kind}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await errorMessage(res));
      return res.json();
    },
    onSuccess: refresh,
  });
};

/** Take one tag off one image (the image's `pk` from its details). */
export const useRemoveImageTag = () => {
  const refresh = useRefreshTagViews();
  return useMutation({
    mutationFn: async ({ imagePk, tag }: { imagePk: number; tag: string }) => {
      const res = await apiFetch(`/api/v1/images/${imagePk}/tags/${encodeURIComponent(tag)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(await errorMessage(res));
    },
    onSuccess: refresh,
  });
};
