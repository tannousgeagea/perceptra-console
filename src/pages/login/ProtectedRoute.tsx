import React from "react";
import { Navigate, Outlet, useLocation} from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Check if the user is authenticated by verifying the token
  // const isAuthenticated = !!localStorage.getItem("token");
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-visionNest-purple border-t-transparent"></div>
          <p className="text-visionNest-navy font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Render children or outlet if authenticated
  return children ? <>{children}</> : <Outlet />;
  
};

export const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Get the intended destination or default to dashboard
  const from = location.state?.from || '/';
  
  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex min-h-screen items-center justify-center w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-visionNest-purple border-t-transparent"></div>
          <p className="text-visionNest-navy font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to dashboard or intended route if already authenticated
    return <Navigate to={from} replace />;
  }
  
  // Render children or outlet if not authenticated
  return children ? <>{children}</> : <Outlet />;
};



