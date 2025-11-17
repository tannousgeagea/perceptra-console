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
        navigate('/', { replace: true });
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

      {/* Form Card */}
      <Card className="p-6 sm:p-8 shadow-xl border-border/50 backdrop-blur-sm bg-card/95 transition-all duration-300 hover:shadow-2xl">
        <OAuthButtons className="mb-6" />
        <LoginForm 
          onSubmit={handleLogin}
          isSubmitting={isSubmitting}
          error={error}
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