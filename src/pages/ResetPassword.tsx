import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { ScanEye, Lock, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, X } from 'lucide-react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    const metRequirements = passwordRequirements.filter(req => req.test(value));
    if (metRequirements.length < 4) return 'Password does not meet requirements';
    return '';
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return '';
  };

  const passwordError = touched.password ? validatePassword(password) : '';
  const confirmPasswordError = touched.confirmPassword ? validateConfirmPassword(confirmPassword) : '';
  
  const passwordStrength = passwordRequirements.filter(req => req.test(password)).length;
  const passwordStrengthPercentage = (passwordStrength / passwordRequirements.length) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;

    setTouched({ password: true, confirmPassword: true });
    
    const pwdError = validatePassword(password);
    const confirmError = validateConfirmPassword(confirmPassword);
    
    if (pwdError || confirmError) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await resetPassword(token, password);
      
      if (result.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { 
            replace: true,
            state: { message: 'Password reset successful! Please sign in.' }
          });
        }, 2000);
      } else {
        setError(result.error || 'Failed to reset password. The link may have expired.');
        setTokenValid(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
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
            Set new password
          </h2>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </div>
      </div>

      {/* Card */}
      <Card className="p-6 sm:p-8 shadow-xl border-border/50 backdrop-blur-sm bg-card/95 transition-all duration-300 hover:shadow-2xl">
        {!tokenValid ? (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Invalid or expired link
              </h3>
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Link to="/forgot-password" className="block">
                <Button 
                  size="lg"
                  className="w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  Request new link
                </Button>
              </Link>
              <Link to="/login" className="block">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full"
                >
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <div className="absolute inset-0 bg-success/20 blur-2xl animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Password reset successful!
              </h3>
              <p className="text-sm text-muted-foreground">
                Redirecting you to login...
              </p>
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

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                New password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  disabled={isSubmitting}
                  className={cn(
                    "pl-10 pr-10 h-11 transition-all duration-300",
                    "focus:ring-2 focus:ring-primary/20",
                    passwordError && "border-destructive focus:ring-destructive/20"
                  )}
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2 animate-fade-in">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        passwordStrength <= 2 && "bg-destructive",
                        passwordStrength === 3 && "bg-yellow-500",
                        passwordStrength === 4 && "bg-accent",
                        passwordStrength === 5 && "bg-success"
                      )}
                      style={{ width: `${passwordStrengthPercentage}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 text-xs">
                    {passwordRequirements.map((req, index) => {
                      const met = req.test(password);
                      return (
                        <div key={index} className={cn(
                          "flex items-center gap-2 transition-colors",
                          met ? "text-success" : "text-muted-foreground"
                        )}>
                          {met ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                          <span>{req.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {passwordError && !password && (
                <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm new password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                  disabled={isSubmitting}
                  className={cn(
                    "pl-10 pr-10 h-11 transition-all duration-300",
                    "focus:ring-2 focus:ring-primary/20",
                    confirmPasswordError && "border-destructive focus:ring-destructive/20"
                  )}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {confirmPasswordError}
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
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <span>Reset password</span>
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
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Remember your password? Sign in
              </Button>
            </Link>
          </form>
        )}
      </Card>
    </>
  );
};

export default ResetPassword;
