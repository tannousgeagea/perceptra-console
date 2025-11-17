// pages/OAuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/ui/button';
import { Card } from '@/components/ui/ui/card';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

type ProcessingState = 'loading' | 'success' | 'error';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const [state, setState] = useState<ProcessingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) return;
    const processCallback = async () => {
      setIsProcessing(true);
      
      // Get parameters from URL
      const code = searchParams.get('code');
      const stateParam = searchParams.get('state');
      const provider = sessionStorage.getItem('oauth_provider') as 'microsoft' | 'google';

      // Validate parameters
      if (!code) {
        setState('error');
        setError('Missing authorization code');
        return;
      }

      if (!stateParam) {
        setState('error');
        setError('Missing state parameter');
        return;
      }

      if (!provider) {
        setState('error');
        setError('Missing provider information');
        return;
      }

      try {
        // Complete OAuth flow
        const result = await handleOAuthCallback(provider, code, stateParam);

        if (result.success) {
          setState('success');
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 1000);
        } else {
          setState('error');
          setError(result.error || 'Authentication failed');
        }
      } catch (err) {
        setState('error');
        setError('An unexpected error occurred during authentication');
      }

    };

    processCallback();
  }, [searchParams, handleOAuthCallback, navigate, isProcessing]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Gradient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md px-4 sm:px-6 relative z-10">
        <Card className="p-8 shadow-xl border-border/50 backdrop-blur-sm bg-card/95">
          {state === 'loading' && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="relative inline-block">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="absolute inset-0 bg-primary/20 blur-2xl" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Completing authentication
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your credentials...
                </p>
              </div>
              {/* Progress indicator */}
              <div className="flex justify-center gap-2 pt-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center space-y-4 animate-scale-in">
              <div className="relative inline-block">
                <CheckCircle2 className="w-16 h-16 text-success" />
                <div className="absolute inset-0 bg-success/20 blur-2xl animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Authentication successful!
                </h2>
                <p className="text-muted-foreground">
                  Redirecting you to your dashboard...
                </p>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Authentication failed
                </h2>
                <p className="text-muted-foreground">
                  {error || 'An error occurred during authentication'}
                </p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                Back to Login
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};