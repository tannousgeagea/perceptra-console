import { useState } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, User, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserCreate } from '@/types/auth';

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

export interface SignupFormData extends UserCreate {
  acceptTerms: boolean;
}

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

export const SignupForm = ({ onSubmit, isSubmitting = false, error }: SignupFormProps) => {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    username: false,
    confirmPassword: false,
    acceptTerms: false,
  });

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    const metRequirements = passwordRequirements.filter(req => req.test(value));
    if (metRequirements.length < 4) return 'Password does not meet requirements';
    return '';
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return 'Please confirm your password';
    if (value !== formData.password) return 'Passwords do not match';
    return '';
  };

  const validateName = (value: string, field: string) => {
    if (!value.trim()) return `${field} is required`;
    if (value.trim().length < 2) return `${field} must be at least 2 characters`;
    return '';
  };

  const getFieldError = (field: keyof SignupFormData): string => {
    if (!touched[field]) return '';
    
    switch (field) {
      case 'firstName':
        return validateName(formData.firstName, 'First name');
      case 'lastName':
        return validateName(formData.lastName, 'Last name');
      case 'email':
        return validateEmail(formData.email);
      case 'username':
        return validateEmail(formData.username);
      case 'password':
        return validatePassword(formData.password);
      case 'confirmPassword':
        return validateConfirmPassword(formData.confirmPassword);
      case 'acceptTerms':
        return !formData.acceptTerms ? 'You must accept the terms' : '';
      default:
        return '';
    }
  };

  const passwordStrength = passwordRequirements.filter(req => req.test(formData.password)).length;
  const passwordStrengthPercentage = (passwordStrength / passwordRequirements.length) * 100;

  const handleFieldChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = (field: keyof SignupFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Touch all fields
    const allTouched = Object.keys(touched).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {} as typeof touched);
    setTouched(allTouched);

    // Validate all fields
    const errors = Object.keys(formData).map(key => 
      getFieldError(key as keyof SignupFormData)
    ).filter(Boolean);

    if (errors.length > 0) return;

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Global Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Name Fields - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First name
          </Label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              onBlur={() => handleFieldBlur('firstName')}
              disabled={isSubmitting}
              className={cn(
                "pl-10 h-11 transition-all duration-300",
                "focus:ring-2 focus:ring-primary/20",
                getFieldError('firstName') && "border-destructive focus:ring-destructive/20"
              )}
            />
          </div>
          {getFieldError('firstName') && (
            <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getFieldError('firstName')}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last name
          </Label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              onBlur={() => handleFieldBlur('lastName')}
              disabled={isSubmitting}
              className={cn(
                "pl-10 h-11 transition-all duration-300",
                "focus:ring-2 focus:ring-primary/20",
                getFieldError('lastName') && "border-destructive focus:ring-destructive/20"
              )}
            />
          </div>
          {getFieldError('lastName') && (
            <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getFieldError('lastName')}
            </p>
          )}
        </div>
      </div>

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
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleFieldBlur('email')}
            disabled={isSubmitting}
            className={cn(
              "pl-10 h-11 transition-all duration-300",
              "focus:ring-2 focus:ring-primary/20",
              getFieldError('email') && "border-destructive focus:ring-destructive/20"
            )}
            autoComplete="email"
          />
        </div>
        {getFieldError('email') && (
          <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {getFieldError('email')}
          </p>
        )}
      </div>

      {/* Username Field (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          Username <span className="text-xs text-muted-foreground">(optional)</span>
        </Label>
        <div className="relative group">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            value={formData.username}
            onChange={(e) => handleFieldChange('username', e.target.value)}
            disabled={isSubmitting}
            className={cn(
              "pl-10 h-11 transition-all duration-300",
              "focus:ring-2 focus:ring-primary/20"
            )}
            autoComplete="username"
          />
        </div>
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
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            onFocus={() => setShowPasswordStrength(true)}
            onBlur={() => {
              handleFieldBlur('password');
              setShowPasswordStrength(false);
            }}
            disabled={isSubmitting}
            className={cn(
              "pl-10 pr-10 h-11 transition-all duration-300",
              "focus:ring-2 focus:ring-primary/20",
              getFieldError('password') && "border-destructive focus:ring-destructive/20"
            )}
            autoComplete="new-password"
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
        {(showPasswordStrength || formData.password) && (
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
                const met = req.test(formData.password);
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

        {getFieldError('password') && !showPasswordStrength && (
          <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {getFieldError('password')}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm password
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
            onBlur={() => handleFieldBlur('confirmPassword')}
            disabled={isSubmitting}
            className={cn(
              "pl-10 pr-10 h-11 transition-all duration-300",
              "focus:ring-2 focus:ring-primary/20",
              getFieldError('confirmPassword') && "border-destructive focus:ring-destructive/20"
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
        {getFieldError('confirmPassword') && (
          <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {getFieldError('confirmPassword')}
          </p>
        )}
      </div>

      {/* Terms Acceptance */}
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => {
              handleFieldChange('acceptTerms', checked as boolean);
              handleFieldBlur('acceptTerms');
            }}
            disabled={isSubmitting}
            className={cn(
              "mt-1",
              getFieldError('acceptTerms') && "border-destructive"
            )}
          />
          <Label
            htmlFor="terms"
            className="text-sm leading-relaxed cursor-pointer select-none"
          >
            I agree to the{' '}
            <button type="button" className="text-primary hover:text-primary-hover hover:underline font-medium">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-primary hover:text-primary-hover hover:underline font-medium">
              Privacy Policy
            </button>
          </Label>
        </div>
        {getFieldError('acceptTerms') && (
          <p className="text-sm text-destructive animate-fade-in flex items-center gap-1 ml-7">
            <AlertCircle className="w-3 h-3" />
            {getFieldError('acceptTerms')}
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </span>
      </Button>

      {/* Sign in link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a
          href="/login"
          className="font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Sign in
        </a>
      </p>
    </form>
  );
};
