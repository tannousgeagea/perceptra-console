import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/ui/card';
import { SignupHeader } from '@/components/auth/SignupHeader';
import { SignupForm } from '@/components/auth/SignupForm';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { UserCreate } from '@/types/auth';

const Signup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signup, login } = useAuth();
  const navigate = useNavigate();

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
      });
      
      if (result.success) {
        // Automatically log in the user after successful signup
        const loginResult = await login(data.email, data.password, false);
        
        if (loginResult.success) {
          navigate('/', { replace: true });
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

      {/* Form Card */}
      <Card className="p-6 sm:p-8 shadow-xl border-border/50 backdrop-blur-sm bg-card/95 transition-all duration-300 hover:shadow-2xl">
        <OAuthButtons className="mb-6" />
        <SignupForm 
          onSubmit={handleSignup}
          isSubmitting={isSubmitting}
          error={error}
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
