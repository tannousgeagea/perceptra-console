import type { InvitableRole } from '@/hooks/useInvitations';

/** Roles an invitation can grant. Same wording as the invitation page and email. */
export const ROLE_CHOICES: { value: InvitableRole; label: string; summary: string }[] = [
  { value: 'viewer', label: 'Viewer', summary: 'See projects, datasets and results' },
  { value: 'editor', label: 'Editor', summary: 'Annotate, review and build datasets' },
  { value: 'admin', label: 'Admin', summary: 'Run the organization: members, storage, compute' },
];
