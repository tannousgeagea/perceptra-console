import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { ScanEye, Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);
  const { requestPasswordReset } = useAuth();

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    return '';
  };

  const emailError = touched ? validateEmail(email) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    const error = validateEmail(email);
    if (error) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await requestPasswordReset(email);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email. Please try again.');
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
      <div className="text-center space-y-4">
        <Link to="/login" className="inline-flex justify-center items-center">
          <div className="flex items-center gap-2 group">
            <div className="relative">
              <ScanEye className="w-8 h-8 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
              <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">VisionNest</h1>
          </div>
        </Link>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Reset your password
          </h2>
          <p className="text-muted-foreground">
            Enter your email and we'll send you a reset link
          </p>
        </div>
      </div>

      {/* Card */}
      <Card className="p-6 sm:p-8 shadow-xl border-border/50 backdrop-blur-sm bg-card/95 transition-all duration-300 hover:shadow-2xl">
        {success ? (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <div className="absolute inset-0 bg-success/20 blur-2xl animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Check your email
              </h3>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Link to="/login" className="block">
                <Button 
                  size="lg"
                  className="w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  Back to Login
                </Button>
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setTouched(false);
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Global Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  disabled={isSubmitting}
                  className={cn(
                    "pl-10 h-11 transition-all duration-300",
                    "focus:ring-2 focus:ring-primary/20",
                    emailError && "border-destructive focus:ring-destructive/20"
                  )}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {emailError && (
                <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send reset link</span>
                )}
              </span>
            </Button>

            {/* Back to login */}
            <Link to="/login" className="block">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Button>
            </Link>
          </form>
        )}
      </Card>
      </>
  );
};

export default ForgotPassword;
