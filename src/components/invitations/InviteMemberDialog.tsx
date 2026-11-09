// components/invitations/InviteMemberDialog.tsx
//
// Invite someone to the current organization by email, with a role and an
// optional note. They get an email with a link; they don't need an account yet.

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/ui/dialog';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Textarea } from '@/components/ui/ui/textarea';
import { InvitableRole, InvitationApiError, useCreateInvitation } from '@/hooks/useInvitations';
import { cn } from '@/lib/utils';
import { ROLE_CHOICES } from './roleChoices';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string | undefined;
  orgName: string;
}

export function InviteMemberDialog({ open, onOpenChange, orgId, orgName }: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InvitableRole>('editor');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = useCreateInvitation(orgId);

  // A fresh form each time the dialog opens.
  useEffect(() => {
    if (open) {
      setEmail('');
      setRole('editor');
      setMessage('');
      setError(null);
    }
  }, [open]);

  const roleLabel = ROLE_CHOICES.find((r) => r.value === role)?.label ?? role;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || create.isPending) return;
    setError(null);
    try {
      const invitation = await create.mutateAsync({ email: email.trim(), role, message: message.trim() || undefined });
      toast.success(`Invitation sent to ${invitation.email}`, {
        description: `They'll join ${orgName} as ${roleLabel} when they accept.`,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof InvitationApiError ? err.message : 'The invitation could not be sent. Try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Invite to {orgName}</DialogTitle>
            <DialogDescription>
              They'll get an email with a link to join. They can create an account from it if they don't have one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-5">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium">Role</legend>
              <div role="radiogroup" className="grid gap-2">
                {ROLE_CHOICES.map((choice) => {
                  const selected = role === choice.value;
                  return (
                    <button
                      key={choice.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setRole(choice.value)}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mtx-primary)]',
                        selected
                          ? 'border-[var(--mtx-primary)] bg-[var(--mtx-primary)]/[0.06]'
                          : 'border-[var(--mtx-border)] hover:bg-[var(--mtx-surface)]'
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                          selected ? 'border-[var(--mtx-primary)]' : 'border-[var(--mtx-text-muted)]/50'
                        )}
                      >
                        {selected && <span className="h-2 w-2 rounded-full bg-[var(--mtx-primary)]" />}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-[var(--mtx-text)]">{choice.label}</span>
                        <span className="block text-xs text-[var(--mtx-text-muted)]">{choice.summary}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="invite-message">
                Note <span className="font-normal text-[var(--mtx-text-muted)]">(optional, shown in the invitation)</span>
              </Label>
              <Textarea
                id="invite-message"
                rows={3}
                maxLength={1000}
                placeholder="We're labeling the new conveyor footage this month. Welcome aboard!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-[var(--mtx-error-text)]">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending || !email.trim()}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {create.isPending ? 'Sending…' : 'Send invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
