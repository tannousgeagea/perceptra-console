import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/ui/card';
import { SignupHeader } from '@/components/auth/SignupHeader';
import { SignupForm } from '@/components/auth/SignupForm';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { InvitationBox } from '@/components/invitations/InvitationBox';
import { welcomeFrom } from '@/components/invitations/welcome';
import { useInvitationPreview } from '@/hooks/useInvitations';
import { UserCreate } from '@/types/auth';

const Signup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  // Arriving from an invitation link: the account joins that organization.
  const [params] = useSearchParams();
  const inviteToken = params.get('invite') ?? undefined;
  const { data: invite } = useInvitationPreview(inviteToken);
  const joining = invite?.state === 'pending' ? invite : undefined;

  const handleSignup = async (data: UserCreate) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await signup({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        inviteToken: joining ? inviteToken : undefined,
      });

      if (result.success) {
        // Automatically log in the user after successful signup
        const loginResult = await login(data.email, data.password, false);

        if (loginResult.success) {
          if (joining) navigate('/projects', { replace: true, state: welcomeFrom(joining) });
          else navigate('/', { replace: true });
        } else {
          // If auto-login fails, redirect to login page
          navigate('/login', { 
            replace: true,
            state: { message: 'Account created! Please sign in.' }
          });
        }
      } else {
        setError(result.error || 'Sign up failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <SignupHeader />

      {/* What this account joins, when it comes from an invitation */}
      {joining && (
        <div className="rounded-xl border border-[var(--mtx-border)] bg-[var(--mtx-surface)] px-5 pb-4 pt-3">
          <p className="text-sm text-[var(--mtx-text-muted)]">
            {joining.invited_by ? `${joining.invited_by.name} invited you to join` : 'You were invited to join'}
          </p>
          <InvitationBox name={joining.organization.name} role={joining.role.label} size="compact" tone="paper" />
        </div>
      )}

      {/* Form Card */}
      <Card className="p-6 sm:p-8 shadow-xl border-border/50 backdrop-blur-sm bg-card/95 transition-all duration-300 hover:shadow-2xl">
        {/* From an invitation, social sign-up joins that organization too. */}
        <OAuthButtons
          className="mb-6"
          next={joining && inviteToken ? `/invite/${encodeURIComponent(inviteToken)}` : undefined}
          inviteToken={joining ? inviteToken : undefined}
        />
        <SignupForm
          key={joining ? 'invite' : 'plain'}
          onSubmit={handleSignup}
          isSubmitting={isSubmitting}
          error={error}
          lockedEmail={joining?.email}
        />
      </Card>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        By creating an account, you agree to our{' '}
        <button className="text-primary hover:text-primary-hover hover:underline transition-colors font-medium">
          Terms of Service
        </button>{' '}
        and{' '}
        <button className="text-primary hover:text-primary-hover hover:underline transition-colors font-medium">
          Privacy Policy
        </button>
      </p>
    </>
  );
};

export default Signup;
