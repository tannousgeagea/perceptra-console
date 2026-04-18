import { apiFetch } from '@/services/apiClient';
import {
  OrganizationSummary,
  OrganizationDetails,
  MembersResponse,
  ProjectsResponse,
} from '@/types/organization';

const orgHeader = (orgId: string): HeadersInit => ({
  'X-Organization-ID': orgId,
});

async function throwOnError(res: Response): Promise<Response> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res;
}

export const fetchOrganizationSummary = async (orgId: string): Promise<OrganizationSummary> => {
  const res = await apiFetch('/api/v1/organizations/me', { headers: orgHeader(orgId) });
  await throwOnError(res);
  return res.json();
};

export const fetchOrganizationDetails = async (orgId: string): Promise<OrganizationDetails> => {
  const res = await apiFetch('/api/v1/organizations/details', { headers: orgHeader(orgId) });
  if (!res.ok) throw new Error('Failed to fetch organization details');
  return res.json();
};

export interface MembersParams {
  skip?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const fetchOrganizationMembers = async (
  orgId: string,
  params: MembersParams = {}
): Promise<MembersResponse> => {
  const q = new URLSearchParams();
  if (params.skip != null) q.set('skip', String(params.skip));
  if (params.limit != null) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.role) q.set('role', params.role);
  if (params.status) q.set('status', params.status);

  const qs = q.toString();
  const res = await apiFetch(`/api/v1/organizations/members${qs ? `?${qs}` : ''}`, {
    headers: orgHeader(orgId),
  });
  if (!res.ok) throw new Error('Failed to fetch organization members');
  return res.json();
};

export const fetchOrganizationProjects = async (
  orgId: string,
  search?: string
): Promise<ProjectsResponse> => {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await apiFetch(`/api/v1/organizations/projects${qs}`, {
    headers: orgHeader(orgId),
  });
  if (!res.ok) throw new Error('Failed to fetch organization projects');
  return res.json();
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface InviteMemberResponse {
  message: string;
  user_id: string;
  username: string;
  email: string;
  role: string;
}

export const inviteOrgMember = async (
  orgId: string,
  email: string,
  role: string,
): Promise<InviteMemberResponse> => {
  const res = await apiFetch('/api/v1/organizations/members', {
    method: 'POST',
    headers: orgHeader(orgId),
    body: JSON.stringify({ email, role }),
  });
  await throwOnError(res);
  return res.json();
};

export interface UpdateMemberData {
  role?: string;
  status?: string;
}

export const updateOrgMember = async (
  orgId: string,
  userId: string,
  data: UpdateMemberData,
): Promise<void> => {
  const res = await apiFetch(`/api/v1/organizations/users/${userId}`, {
    method: 'PATCH',
    headers: orgHeader(orgId),
    body: JSON.stringify(data),
  });
  await throwOnError(res);
};

export const removeOrgMember = async (orgId: string, userId: string): Promise<void> => {
  const res = await apiFetch(`/api/v1/organizations/members/${userId}`, {
    method: 'DELETE',
    headers: orgHeader(orgId),
  });
  await throwOnError(res);
};
