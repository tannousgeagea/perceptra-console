import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/ui/card";
import {CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { LoginHeader } from '@/components/auth/LoginHeader';
import { LoginForm } from '@/components/auth/LoginForm';


const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Where to go after signing in (e.g. back to an invitation). Same-site paths
  // only: "/x" but not "//host" or "/\host", which browsers treat as other sites.
  const params = new URLSearchParams(location.search);
  const rawNext = params.get('next') ?? '';
  const next = /^\/(?![/\\])/.test(rawNext) ? rawNext : '/';
  const fromInvitation = next.startsWith('/invite/');
  // Also sent with Microsoft/Google sign-in: a first-time account then joins
  // the organization instead of getting its own workspace.
  const inviteToken = fromInvitation ? decodeURIComponent(next.slice('/invite/'.length)) : undefined;
  const initialEmail = params.get('email') ?? undefined;
  
  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setSuccessMessage(state.message);
      // Clear the message from history
      window.history.replaceState({}, document.title);
    }
  }, [location]);


  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await login(email, password, rememberMe);
      
      if (result.success) {
        navigate(next, { replace: true });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-success/10 border border-success/20 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
          <p className="text-sm text-success font-medium">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <LoginHeader />

      {fromInvitation && (
        <p className="rounded-lg border border-[var(--mtx-border)] bg-[var(--mtx-surface)] px-4 py-3 text-sm text-[var(--mtx-text-muted)]">
          Sign in{initialEmail ? <> as <span className="font-medium text-[var(--mtx-text)]">{initialEmail}</span></> : null} to
          accept your invitation. You'll go straight back to it.
        </p>
      )}

      {/* Form Card */}
      <Card className="p-6 sm:p-8 shadow-xl border-border/50 backdrop-blur-sm bg-card/95 transition-all duration-300 hover:shadow-2xl">
        <OAuthButtons className="mb-6" next={next} inviteToken={inviteToken} />
        <LoginForm
          onSubmit={handleLogin}
          isSubmitting={isSubmitting}
          error={error}
          initialEmail={initialEmail}
        />
      </Card>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        By signing in, you agree to our{' '}
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

export default Login;