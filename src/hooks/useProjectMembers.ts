import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
} from '@/services/projectMembersService';

export const useProjectMembers = (orgId: string | undefined, projectId: string | undefined) =>
  useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => fetchProjectMembers(orgId!, projectId!),
    enabled: !!orgId && !!projectId,
    staleTime: 20_000,
  });

export const useAddProjectMember = (orgId: string | undefined, projectId: string | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      addProjectMember(orgId!, projectId!, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
};

export const useUpdateProjectMember = (orgId: string | undefined, projectId: string | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateProjectMember(orgId!, projectId!, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
};

export const useRemoveProjectMember = (orgId: string | undefined, projectId: string | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeProjectMember(orgId!, projectId!, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
};
