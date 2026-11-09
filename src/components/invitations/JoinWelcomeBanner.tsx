// components/invitations/JoinWelcomeBanner.tsx
//
// Shown once on the Projects page right after someone joins by invitation:
// where they are, as what, and what to do if they have no projects yet.

import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { InvitationBox } from './InvitationBox';
import type { JoinWelcome } from './welcome';

export function JoinWelcomeBanner({ projectCount }: { projectCount: number | undefined }) {
  const location = useLocation();
  const navigate = useNavigate();
  const welcome = (location.state as { welcome?: JoinWelcome } | null)?.welcome;
  if (!welcome) return null;

  // Clearing the router state removes the banner (and keeps it gone on reload).
  const dismiss = () => navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  const askWho = welcome.inviter ?? 'an organization admin';

  return (
    <section
      aria-labelledby="join-welcome"
      className="relative flex flex-col gap-5 rounded-xl border border-[var(--mtx-border)] bg-[var(--mtx-bg)] px-6 pb-6 pt-5 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h2 id="join-welcome" className="text-sm text-[var(--mtx-text-muted)]">
          You've joined
        </h2>
        <InvitationBox name={welcome.organization} role={welcome.role} size="compact" tone="paper" />
      </div>
      <div className="max-w-md text-sm leading-relaxed text-[var(--mtx-text-muted)] sm:pr-8 sm:text-right">
        {projectCount ? (
          <p>
            You're in {projectCount === 1 ? 'one project' : `${projectCount} projects`}
            {welcome.projects.length > 0 ? ` from the invitation` : ''}. Open one below to start.
          </p>
        ) : (
          <p>
            You're not in a project yet. Ask {askWho} to add you to one; it will appear here.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss welcome"
        className="absolute right-3 top-3 rounded-md p-1.5 text-[var(--mtx-text-muted)] hover:bg-[var(--mtx-surface)] hover:text-[var(--mtx-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mtx-primary)]"
      >
        <X className="h-4 w-4" />
      </button>
    </section>
  );
}
