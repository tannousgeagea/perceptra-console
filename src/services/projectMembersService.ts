import { apiFetch } from '@/services/apiClient';
import { ProjectMember } from '@/types/organization';

const headers = (orgId: string): HeadersInit => ({
  'X-Organization-ID': orgId,
});

async function throwOnError(res: Response): Promise<Response> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res;
}

export const fetchProjectMembers = async (
  orgId: string,
  projectId: string,
): Promise<ProjectMember[]> => {
  const res = await apiFetch(`/api/v1/projects/${projectId}/members`, {
    headers: headers(orgId),
  });
  await throwOnError(res);
  return res.json();
};

export const addProjectMember = async (
  orgId: string,
  projectId: string,
  userId: string,
  role: string,
): Promise<ProjectMember> => {
  const res = await apiFetch(`/api/v1/projects/${projectId}/members`, {
    method: 'POST',
    headers: headers(orgId),
    body: JSON.stringify({ user_id: userId, role }),
  });
  await throwOnError(res);
  return res.json();
};

export const updateProjectMember = async (
  orgId: string,
  projectId: string,
  userId: string,
  role: string,
): Promise<ProjectMember> => {
  const res = await apiFetch(`/api/v1/projects/${projectId}/members/${userId}`, {
    method: 'PATCH',
    headers: headers(orgId),
    body: JSON.stringify({ role }),
  });
  await throwOnError(res);
  return res.json();
};

export const removeProjectMember = async (
  orgId: string,
  projectId: string,
  userId: string,
): Promise<void> => {
  const res = await apiFetch(`/api/v1/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
    headers: headers(orgId),
  });
  await throwOnError(res);
};
