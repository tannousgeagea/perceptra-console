// utils/errorHandling.ts

/**
 * Auth error types
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  REFRESH_FAILED = 'REFRESH_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom auth error class
 */
export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    public message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case AuthErrorType.INVALID_CREDENTIALS:
        return 'Invalid email or password. Please try again.';
      case AuthErrorType.TOKEN_EXPIRED:
        return 'Your session has expired. Please log in again.';
      case AuthErrorType.TOKEN_INVALID:
        return 'Invalid authentication token. Please log in again.';
      case AuthErrorType.REFRESH_FAILED:
        return 'Failed to refresh your session. Please log in again.';
      case AuthErrorType.NETWORK_ERROR:
        return 'Network error. Please check your connection and try again.';
      case AuthErrorType.UNAUTHORIZED:
        return 'You are not authorized to access this resource.';
      case AuthErrorType.FORBIDDEN:
        return 'You do not have permission to perform this action.';
      case AuthErrorType.SERVER_ERROR:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Determine if error should trigger logout
   */
  shouldLogout(): boolean {
    return [
      AuthErrorType.TOKEN_EXPIRED,
      AuthErrorType.TOKEN_INVALID,
      AuthErrorType.REFRESH_FAILED,
    ].includes(this.type);
  }
}

/**
 * Parse API error response into AuthError
 */
export const parseAuthError = (error: any): AuthError => {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AuthError(
      AuthErrorType.NETWORK_ERROR,
      'Network error occurred',
      undefined,
      error
    );
  }

  // Already an AuthError
  if (error instanceof AuthError) {
    return error;
  }

  // HTTP status code based errors
  if (error.statusCode) {
    switch (error.statusCode) {
      case 401:
        return new AuthError(
          AuthErrorType.UNAUTHORIZED,
          error.message || 'Unauthorized',
          401,
          error.details
        );
      case 403:
        return new AuthError(
          AuthErrorType.FORBIDDEN,
          error.message || 'Forbidden',
          403,
          error.details
        );
      case 500:
      case 502:
      case 503:
        return new AuthError(
          AuthErrorType.SERVER_ERROR,
          error.message || 'Server error',
          error.statusCode,
          error.details
        );
      default:
        return new AuthError(
          AuthErrorType.UNKNOWN,
          error.message || 'Unknown error',
          error.statusCode,
          error.details
        );
    }
  }

  // Generic error
  return new AuthError(
    AuthErrorType.UNKNOWN,
    error.message || 'An unknown error occurred',
    undefined,
    error
  );
};

/**
 * React hook for error handling
 */
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthError = () => {
  const [error, setError] = useState<AuthError | null>(null);
  const { logout } = useAuth();

  const handleError = useCallback((err: any) => {
    const authError = parseAuthError(err);
    setError(authError);

    // Auto-logout for certain errors
    if (authError.shouldLogout()) {
      console.warn('Error requires logout:', authError.type);
      setTimeout(() => logout(), 1000); // Small delay to show error message
    }

    return authError;
  }, [logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: !!error,
  };
};

/**
 * Error boundary component for auth errors
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Error Boundary caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleRetry);
      }

      const authError = parseAuthError(this.state.error);
      
      return (
        <div className="error-boundary">
          <h2>Authentication Error</h2>
          <p>{authError.getUserMessage()}</p>
          <button onClick={this.handleRetry}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Toast notification component for errors
 */
export const AuthErrorToast: React.FC<{ error: AuthError | null; onClose: () => void }> = ({ 
  error, 
  onClose 
}) => {
  if (!error) return null;

  return (
    <div className="toast toast-error">
      <div className="toast-content">
        <strong>{error.type}</strong>
        <p>{error.getUserMessage()}</p>
      </div>
      <button onClick={onClose}>×</button>
    </div>
  );
};