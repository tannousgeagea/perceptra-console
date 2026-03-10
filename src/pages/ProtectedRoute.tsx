import React from "react";
import { Navigate, Outlet, useLocation} from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * Spinner shared between ProtectedRoute and PublicRoute.
 * Extracted to avoid duplication and keep both components readable.
 */
const AuthSpinner: React.FC = () => (
  <div className="flex min-h-screen w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-visionNest-purple border-t-transparent" />
      <p className="text-visionNest-navy font-medium">Loading...</p>
    </div>
  </div>
);


/**
 * Guards routes that require authentication.
 *
 * Reads isInitializing (Fix #9) instead of the old isLoading so that login /
 * signup form submissions no longer trigger the full-screen spinner.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Check if the user is authenticated by verifying the token
  // const isAuthenticated = !!localStorage.getItem("token");
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation(); 

  if (isInitializing) {
    // Show loading state while checking authentication
    return <AuthSpinner />
  }
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    // return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Render children or outlet if authenticated
  return children ? <>{children}</> : <Outlet />;
  
};


/**
 * Guards routes that should only be accessible when NOT authenticated
 * (login, signup, password-reset pages).
 *
 * Fix #11 — `from` is validated to be an internal path before use as a
 * redirect target, preventing an open-redirect via crafted navigation state.
 */
export const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();
  
  /**
   * Only accept `from` values that are clearly internal paths (start with /).
   * Anything else — including javascript: URIs or external URLs — falls back
   * to the root so we cannot be used as an open redirector.
   */

  const rawFrom = location.state?.from;
  const from =
    typeof rawFrom === 'string' && rawFrom.startsWith('/') ? rawFrom : '/';

  
  if (isInitializing) {
    // Show loading state while checking authentication
    return <AuthSpinner />
  }

  if (isAuthenticated) {
    // Redirect to dashboard or intended route if already authenticated
    return <Navigate to={from} replace />;
  }
  
  // Render children or outlet if not authenticated
  return children ? <>{children}</> : <Outlet />;
};



