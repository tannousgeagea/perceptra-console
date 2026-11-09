// hooks/useInvitations.ts
//
// Organization invitations: the invitee's side (preview a link, accept it)
// and the admin's side (invite, list pending, resend, withdraw).

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';

export type InvitationState = 'pending' | 'expired' | 'accepted' | 'revoked';
export type InvitableRole = 'viewer' | 'editor' | 'admin';

export interface InvitationPreview {
  state: InvitationState;
  email: string;
  account_exists: boolean;
  organization: {
    id: string;
    name: string;
    description: string;
    logo_url: string | null;
    members: number;
    projects: number;
  };
  role: { name: InvitableRole; label: string; summary: string; abilities: string[] };
  invited_by: { name: string; email: string } | null;
  /** Names of the projects they'll be added to. */
  projects: string[];
  message: string;
  created_at: string;
  expires_at: string;
}

export interface InvitableProject {
  id: string;
  name: string;
}

export interface AdminInvitation {
  id: number;
  email: string;
  role: InvitableRole;
  status: InvitationState;
  message: string;
  invited_by: string | null;
  created_at: string;
  expires_at: string;
  last_sent_at: string | null;
  send_count: number;
  link: string;
  projects: InvitableProject[];
}

/** An API error with the server's code (e.g. "expired", "wrong_account") when it sent one. */
export class InvitationApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body?.detail;
    if (detail && typeof detail === 'object') {
      throw new InvitationApiError(response.status, detail.message ?? 'Request failed', detail.code);
    }
    throw new InvitationApiError(response.status, typeof detail === 'string' ? detail : `Request failed (${response.status})`);
  }
  return body as T;
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
});

// ─── Invitee ─────────────────────────────────────────────────────────────────

export const useInvitationPreview = (token: string | undefined) =>
  useQuery({
    queryKey: ['invitation', token],
    queryFn: () => call<InvitationPreview>(`/api/v1/invitations/${encodeURIComponent(token!)}`),
    enabled: !!token,
    retry: false,
    staleTime: 30_000,
  });

export const useAcceptInvitation = () =>
  useMutation({
    mutationFn: (token: string) =>
      call<{ organization: { id: string; name: string; slug: string; role: string } }>(
        `/api/v1/invitations/${encodeURIComponent(token)}/accept`,
        json('POST'),
      ),
  });

// ─── Admin ───────────────────────────────────────────────────────────────────

const adminKey = (orgId?: string) => ['org-invitations', orgId] as const;

export const useOrgInvitations = (orgId: string | undefined) =>
  useQuery({
    queryKey: adminKey(orgId),
    queryFn: () =>
      call<AdminInvitation[]>('/api/v1/organizations/invitations?status=pending', {
        headers: { 'X-Organization-ID': orgId! },
      }),
    enabled: !!orgId,
  });

const useAdminMutation = <V, R>(orgId: string | undefined, request: (vars: V) => Promise<R>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKey(orgId) }),
  });
};

/** The organization's active projects, to pick from when inviting. */
export const useInvitableProjects = (orgId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: ['org-invitable-projects', orgId],
    queryFn: () =>
      call<InvitableProject[]>('/api/v1/organizations/invitations/projects', {
        headers: { 'X-Organization-ID': orgId! },
      }),
    enabled: !!orgId && enabled,
    staleTime: 60_000,
  });

export const useCreateInvitation = (orgId: string | undefined) =>
  useAdminMutation(orgId, (vars: { email: string; role: InvitableRole; message?: string; project_ids?: string[] }) =>
    call<AdminInvitation>('/api/v1/organizations/invitations', {
      ...json('POST', vars),
      headers: { 'Content-Type': 'application/json', 'X-Organization-ID': orgId! },
    }),
  );

export const useResendInvitation = (orgId: string | undefined) =>
  useAdminMutation(orgId, (id: number) =>
    call<AdminInvitation>(`/api/v1/organizations/invitations/${id}/resend`, {
      ...json('POST'),
      headers: { 'Content-Type': 'application/json', 'X-Organization-ID': orgId! },
    }),
  );

export const useRevokeInvitation = (orgId: string | undefined) =>
  useAdminMutation(orgId, (id: number) =>
    call<void>(`/api/v1/organizations/invitations/${id}`, {
      method: 'DELETE',
      headers: { 'X-Organization-ID': orgId! },
    }),
  );
