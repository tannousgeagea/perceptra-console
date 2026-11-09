// pages/invite/InvitePage.tsx
//
// Where an invitation link lands (/invite/:token). Left, on ink: who invites
// you to which organization, framed like an annotated object labeled with
// your role. Right, on paper: what that role can do, and the one next step
// (create an account, sign in, or join).

import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Check, Loader2 } from 'lucide-react';
import { MTXLogo } from '@/components/logo/MTXLogo';
import { InvitationBox } from '@/components/invitations/InvitationBox';
import { welcomeFrom } from '@/components/invitations/welcome';
import { useAuth } from '@/contexts/AuthContext';
import {
  InvitationApiError,
  InvitationPreview,
  useAcceptInvitation,
  useInvitationPreview,
} from '@/hooks/useInvitations';
import type { Organization } from '@/types/auth';
import { cn } from '@/lib/utils';

const GRID = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// ─── Layout ──────────────────────────────────────────────────────────────────

const Shell = ({ ink, paper }: { ink: React.ReactNode; paper: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-white lg:flex-row">
    <section
      className="relative flex flex-col bg-[#0D1117] px-6 pb-12 pt-8 text-[#E6E8EF] sm:px-12 lg:min-h-screen lg:w-[56%] lg:px-16 lg:pb-16 lg:pt-12"
      style={GRID}
    >
      <Link
        to="/"
        className="inline-flex w-fit rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2970FF]"
        // The wordmark uses the theme's text colour; on ink it must be light in either theme.
        style={{ '--mtx-text': '#E6E8EF' } as React.CSSProperties}
      >
        <MTXLogo />
      </Link>
      <div className="flex flex-1 flex-col justify-center py-10 lg:py-0">{ink}</div>
    </section>
    <section className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
      <div className="w-full max-w-[420px]">{paper}</div>
    </section>
  </div>
);

const PrimaryButton = ({
  children,
  onClick,
  to,
  busy,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  busy?: boolean;
}) => {
  const className = cn(
    'inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] px-6 text-[15px] font-semibold text-white transition-colors',
    'bg-[#5A2DFF] hover:bg-[#4B22E8] disabled:opacity-60',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A2DFF]'
  );
  if (to) return <Link to={to} className={className}>{children}</Link>;
  return (
    <button type="button" onClick={onClick} disabled={busy} className={className}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

// ─── Ink panel: the invitation itself ────────────────────────────────────────

const Invitation = ({ invite }: { invite: InvitationPreview }) => {
  const org = invite.organization;
  return (
    <div className="max-w-[600px]">
      <p className="text-[17px] leading-relaxed text-[#9CA3AF]">
        {invite.invited_by ? (
          <>
            <span className="font-medium text-[#E6E8EF]">{invite.invited_by.name}</span> invited you to join
          </>
        ) : (
          'You were invited to join'
        )}
      </p>

      <InvitationBox name={org.name} role={invite.role.label} className="mt-10" />

      {org.description && (
        <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-[#C9CDD6]">{org.description}</p>
      )}
      <p className="mt-3 text-[15px] text-[#9CA3AF]">
        {plural(org.members, 'member')}, {plural(org.projects, 'project')}
      </p>

      {invite.message && (
        <figure className="mt-10 max-w-[52ch] border-l-2 border-[#8A3FFC] pl-5">
          <blockquote className="whitespace-pre-line text-[17px] leading-relaxed text-[#E6E8EF]">
            {invite.message}
          </blockquote>
          {invite.invited_by && (
            <figcaption className="mt-2 text-sm text-[#9CA3AF]">{invite.invited_by.name}</figcaption>
          )}
        </figure>
      )}
    </div>
  );
};

// ─── Paper panel: the role, and what to do next ──────────────────────────────

const RoleDetails = ({ invite }: { invite: InvitationPreview }) => (
  <div>
    <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-[#0F172A]">
      You'll join as {invite.role.label}
    </h1>
    <p className="mt-1.5 text-[15px] text-[#64748B]">{invite.role.summary}.</p>
    <ul className="mt-6 space-y-3">
      {invite.role.abilities.map((ability) => (
        <li key={ability} className="flex gap-3 text-[15px] leading-snug text-[#334155]">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2970FF]" strokeWidth={3} aria-hidden />
          {ability}
        </li>
      ))}
    </ul>

    {invite.projects.length > 0 && (
      <div className="mt-7">
        <p className="text-[15px] font-medium text-[#0F172A]">
          You'll have access to {invite.projects.length === 1 ? 'this project' : `these ${invite.projects.length} projects`}
        </p>
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {invite.projects.map((name) => (
            <li key={name} className="rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-sm text-[#334155]">
              {name}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const NextStep = ({ invite, token }: { invite: InvitationPreview; token: string }) => {
  const { isAuthenticated, user, logout, joinOrganization } = useAuth();
  const navigate = useNavigate();
  const accept = useAcceptInvitation();
  const back = `/invite/${encodeURIComponent(token)}`;
  const loginPath = `/login?next=${encodeURIComponent(back)}&email=${encodeURIComponent(invite.email)}`;
  const signupPath = `/signup?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(invite.email)}`;
  const expires = new Date(invite.expires_at);
  const signedInAs = user?.email ?? '';
  const isInvitedAccount = signedInAs.toLowerCase() === invite.email.toLowerCase();

  const join = () =>
    accept.mutate(token, {
      onSuccess: ({ organization }) => {
        joinOrganization({ ...organization, role: organization.role as Organization['role'] });
        navigate('/projects', { replace: true, state: welcomeFrom(invite) });
      },
    });

  let action: React.ReactNode;
  if (isAuthenticated && isInvitedAccount) {
    action = (
      <>
        <PrimaryButton onClick={join} busy={accept.isPending}>
          {accept.isPending ? 'Joining…' : `Join ${invite.organization.name}`}
        </PrimaryButton>
        <p className="mt-3 text-sm text-[#64748B]">Signed in as {signedInAs}</p>
      </>
    );
  } else if (isAuthenticated) {
    action = (
      <>
        <p className="mb-4 rounded-[10px] bg-[#F1F5F9] px-4 py-3 text-sm leading-relaxed text-[#334155]">
          You're signed in as <span className="font-medium">{signedInAs}</span>, but this invitation is for{' '}
          <span className="font-medium">{invite.email}</span>.
        </p>
        <PrimaryButton
          onClick={() => {
            logout();
            navigate(invite.account_exists ? loginPath : signupPath, { replace: true });
          }}
        >
          Sign out and continue as {invite.email}
        </PrimaryButton>
      </>
    );
  } else if (invite.account_exists) {
    action = (
      <>
        <PrimaryButton to={loginPath}>Sign in to accept</PrimaryButton>
        <p className="mt-3 text-sm text-[#64748B]">You already have an account with {invite.email}.</p>
      </>
    );
  } else {
    action = (
      <>
        <PrimaryButton to={signupPath}>Create your account</PrimaryButton>
        <p className="mt-3 text-sm text-[#64748B]">
          Already use Malumetrix with this email?{' '}
          <Link to={loginPath} className="font-medium text-[#5A2DFF] hover:underline">Sign in</Link>
        </p>
      </>
    );
  }

  return (
    <div className="mt-10 border-t border-[#E5E7EB] pt-8">
      <p className="mb-5 text-sm text-[#64748B]">
        For <span className="font-medium text-[#0F172A]">{invite.email}</span>
      </p>
      {action}
      {accept.error && (
        <p role="alert" className="mt-4 text-sm text-[#B91C1C]">
          {accept.error instanceof InvitationApiError ? accept.error.message : 'Could not join. Try again.'}
        </p>
      )}
      <p className="mt-8 text-[13px] text-[#94A3B8]">
        Expires {formatDistanceToNowStrict(expires, { addSuffix: true })}, on {format(expires, 'd MMMM')}.
      </p>
    </div>
  );
};

/** The invitation can no longer be used: say why, and what to do instead. */
const Closed = ({ invite }: { invite: InvitationPreview }) => {
  const { isAuthenticated, user } = useAuth();
  const inviter = invite.invited_by?.name ?? 'the person who invited you';
  const member = isAuthenticated && user?.organizations.some((o) => o.id === invite.organization.id);

  const copy = {
    expired: {
      title: 'This invitation has expired',
      body: `It ended on ${format(new Date(invite.expires_at), 'd MMMM')}. Ask ${inviter} to send a new one.`,
    },
    revoked: { title: 'This invitation was withdrawn', body: `Ask ${inviter} if you should still join.` },
    accepted: member
      ? { title: `You're already in ${invite.organization.name}`, body: 'The invitation has been used.' }
      : { title: 'This invitation has been used', body: `Sign in as ${invite.email} to open ${invite.organization.name}.` },
    pending: { title: '', body: '' },
  }[invite.state];

  return (
    <div>
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-[#0F172A]">{copy.title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[#64748B]">{copy.body}</p>
      <div className="mt-8">
        {member ? (
          <PrimaryButton to="/projects">Open {invite.organization.name}</PrimaryButton>
        ) : (
          <PrimaryButton to={isAuthenticated ? '/projects' : '/login'}>
            {isAuthenticated ? 'Go to your projects' : 'Sign in'}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const InvitePage = () => {
  const { token = '' } = useParams<{ token: string }>();
  const { data: invite, isLoading, error } = useInvitationPreview(token);

  if (isLoading) {
    return (
      <Shell
        ink={<div className="h-40 max-w-[480px] animate-pulse rounded-md bg-white/5" aria-label="Loading invitation" />}
        paper={<Loader2 className="h-6 w-6 animate-spin text-[#94A3B8]" aria-label="Loading" />}
      />
    );
  }

  if (error || !invite) {
    const notFound = error instanceof InvitationApiError && error.status === 404;
    return (
      <Shell
        ink={
          <p className="max-w-[28ch] text-[34px] font-semibold leading-tight tracking-tight text-white">
            {notFound ? 'This invitation link doesn’t work' : 'The invitation couldn’t be loaded'}
          </p>
        }
        paper={
          <div>
            <p className="text-[15px] leading-relaxed text-[#64748B]">
              {notFound
                ? 'Check that you opened the whole link from the email. If it still fails, ask for a new invitation.'
                : 'Check your connection and reload the page.'}
            </p>
            <div className="mt-8">
              <PrimaryButton to="/login">Go to sign in</PrimaryButton>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <Shell
      ink={<Invitation invite={invite} />}
      paper={
        invite.state === 'pending' ? (
          <>
            <RoleDetails invite={invite} />
            <NextStep invite={invite} token={token} />
          </>
        ) : (
          <Closed invite={invite} />
        )
      }
    />
  );
};

export default InvitePage;
