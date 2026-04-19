import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  fetchOrganizationSummary,
  fetchOrganizationDetails,
  fetchOrganizationMembers,
  fetchOrganizationProjects,
  inviteOrgMember,
  updateOrgMember,
  removeOrgMember,
  MembersParams,
  UpdateMemberData,
} from '@/services/organizationService';

export const useOrganizationSummary = (orgId: string | undefined) =>
  useQuery({
    queryKey: ['org-summary', orgId],
    queryFn: () => fetchOrganizationSummary(orgId!),
    enabled: !!orgId,
    staleTime: 30_000,
  });

export const useOrganizationDetails = (orgId: string | undefined) =>
  useQuery({
    queryKey: ['org-details', orgId],
    queryFn: () => fetchOrganizationDetails(orgId!),
    enabled: !!orgId,
    staleTime: 30_000,
  });

export const useOrganizationMembers = (orgId: string | undefined, params: MembersParams = {}) =>
  useQuery({
    queryKey: ['org-members', orgId, params],
    queryFn: () => fetchOrganizationMembers(orgId!, params),
    enabled: !!orgId,
    staleTime: 20_000,
    placeholderData: keepPreviousData,
  });

export const useOrganizationProjects = (orgId: string | undefined, search?: string) =>
  useQuery({
    queryKey: ['org-projects', orgId, search],
    queryFn: () => fetchOrganizationProjects(orgId!, search),
    enabled: !!orgId,
    staleTime: 30_000,
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useInviteMember = (orgId: string | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      inviteOrgMember(orgId!, email, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-members', orgId] });
      qc.invalidateQueries({ queryKey: ['org-summary', orgId] });
    },
  });
};

export const useUpdateMember = (orgId: string | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateMemberData }) =>
      updateOrgMember(orgId!, userId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-members', orgId] });
    },
  });
};

export const useRemoveMember = (orgId: string | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeOrgMember(orgId!, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-members', orgId] });
      qc.invalidateQueries({ queryKey: ['org-summary', orgId] });
    },
  });
};
