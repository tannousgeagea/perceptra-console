import type { InvitationPreview } from '@/hooks/useInvitations';

/** Passed in router state to /projects right after someone joins by invitation. */
export interface JoinWelcome {
  organization: string;
  role: string;
  inviter: string | null;
  projects: string[];
}

export const welcomeFrom = (invite: InvitationPreview): { welcome: JoinWelcome } => ({
  welcome: {
    organization: invite.organization.name,
    role: invite.role.label,
    inviter: invite.invited_by?.name ?? null,
    projects: invite.projects,
  },
});
