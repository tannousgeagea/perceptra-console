// components/invitations/PendingInvitations.tsx
//
// Invitations sent but not yet accepted, with copy link / resend / withdraw.
// Renders nothing while there are none.

import { formatDistanceToNowStrict } from 'date-fns';
import { Copy, Mail, RotateCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/ui/button';
import {
  AdminInvitation,
  InvitationApiError,
  useOrgInvitations,
  useResendInvitation,
  useRevokeInvitation,
} from '@/hooks/useInvitations';
import { ROLE_CHOICES } from './roleChoices';

const roleLabel = (role: string) => ROLE_CHOICES.find((r) => r.value === role)?.label ?? role;

export function PendingInvitations({ orgId }: { orgId: string | undefined }) {
  const { data: invitations = [] } = useOrgInvitations(orgId);
  const resend = useResendInvitation(orgId);
  const revoke = useRevokeInvitation(orgId);

  if (invitations.length === 0) return null;

  const fail = (what: string) => (err: unknown) =>
    toast.error(`Could not ${what}`, { description: err instanceof InvitationApiError ? err.message : undefined });

  const copyLink = async (invitation: AdminInvitation) => {
    try {
      await navigator.clipboard.writeText(invitation.link);
      toast.success('Invitation link copied', { description: `Only ${invitation.email} can use it.` });
    } catch {
      toast.error('Could not copy the link');
    }
  };

  return (
    <section aria-labelledby="pending-invitations" className="mt-6">
      <h3 id="pending-invitations" className="mb-2 text-sm font-medium text-[var(--mtx-text)]">
        Waiting to accept ({invitations.length})
      </h3>
      <ul className="divide-y divide-[var(--mtx-border)] rounded-lg border border-[var(--mtx-border)]">
        {invitations.map((invitation) => {
          const expired = invitation.status === 'expired';
          return (
            <li key={invitation.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <Mail className="h-4 w-4 shrink-0 text-[var(--mtx-text-muted)]" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--mtx-text)]">{invitation.email}</p>
                <p className="text-xs text-[var(--mtx-text-muted)]">
                  {roleLabel(invitation.role)}
                  {invitation.projects.length > 0 &&
                    ` in ${invitation.projects.length === 1 ? invitation.projects[0].name : `${invitation.projects.length} projects`}`}
                  {invitation.invited_by ? `, invited by ${invitation.invited_by}` : ''}
                  {', '}
                  {expired ? (
                    <span className="text-[var(--mtx-error-text)]">expired</span>
                  ) : (
                    `expires ${formatDistanceToNowStrict(new Date(invitation.expires_at), { addSuffix: true })}`
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {!expired && (
                  <Button variant="ghost" size="sm" onClick={() => copyLink(invitation)} aria-label={`Copy invitation link for ${invitation.email}`}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={resend.isPending}
                  onClick={() =>
                    resend.mutate(invitation.id, {
                      onSuccess: () => toast.success(`Invitation sent again to ${invitation.email}`),
                      onError: fail('resend the invitation'),
                    })
                  }
                >
                  <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                  Resend
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={revoke.isPending}
                  onClick={() =>
                    revoke.mutate(invitation.id, {
                      onSuccess: () => toast.success(`Invitation to ${invitation.email} withdrawn`),
                      onError: fail('withdraw the invitation'),
                    })
                  }
                  className="text-[var(--mtx-error-text)] hover:text-[var(--mtx-error-text)]"
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Withdraw
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
