import { useState } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSubmit: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

export const LoginForm = ({ onSubmit, isSubmitting = false, error }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    setFieldErrors(prev => ({ ...prev, email: validateEmail(email) }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    setFieldErrors(prev => ({ ...prev, password: validatePassword(password) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setTouched({ email: true, password: true });
    setFieldErrors({ email: emailError, password: passwordError });
    
    if (emailError || passwordError) return;
    
    await onSubmit(email, password, rememberMe);
  };

  return (
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
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            disabled={isSubmitting}
            className={cn(
              "pl-10 h-11 transition-all duration-300",
              "focus:ring-2 focus:ring-primary/20",
              fieldErrors.email && touched.email && "border-destructive focus:ring-destructive/20"
            )}
            autoComplete="email"
          />
        </div>
        {fieldErrors.email && touched.email && (
          <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onBlur={handlePasswordBlur}
            disabled={isSubmitting}
            className={cn(
              "pl-10 pr-10 h-11 transition-all duration-300",
              "focus:ring-2 focus:ring-primary/20",
              fieldErrors.password && touched.password && "border-destructive focus:ring-destructive/20"
            )}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isSubmitting}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {fieldErrors.password && touched.password && (
          <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            disabled={isSubmitting}
          />
          <Label
            htmlFor="remember"
            className="text-sm font-medium cursor-pointer select-none"
          >
            Remember me
          </Label>
        </div>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => window.location.href = '/forgot-password'}
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
        >
          Forgot password?
        </button>
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
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </span>
      </Button>

      {/* Sign up link */}
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <a
          href="/signup"
          className="font-medium text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
        >
          Sign up
        </a>
      </p>
    </form>
  );
};
