// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, authStorage, ApiError } from '@/services/authService';
import { User, Organization } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  getCurrentOrganization: () => Organization | null;
  switchOrganization: (organizationId: string) => boolean;
  hasPermission: (organizationId: string, requiredRole: 'owner' | 'admin') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const navigate = useNavigate();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Setup automatic token refresh
   */
  const setupTokenRefresh = useCallback((expiresIn: number) => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Calculate when to refresh (5 minutes before expiry)
    const bufferTime = 5 * 60 * 1000; // 5 minutes in ms
    const refreshTime = (expiresIn * 1000) - bufferTime;

    if (refreshTime <= 0) {
      console.warn('Token already expired or too close to expiry');
      return;
    }

    console.log(`Token refresh scheduled in ${refreshTime / 1000 / 60} minutes`);

    refreshTimeoutRef.current = setTimeout(async () => {
      console.log('Auto-refreshing token...');
      await refreshToken();
    }, refreshTime);
  }, []);

  /**
   * Initialize auth state from storage
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { accessToken, refreshToken: refreshTokenConst, user, tokenExpiry } = authStorage.getAuthData();

        if (!accessToken || !refreshTokenConst || !user || !tokenExpiry) {
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        const now = Date.now();
        const expiryTime = new Date(tokenExpiry).getTime();

        console.log(expiryTime)
        if (expiryTime <= now) {
          console.log('Token expired, attempting refresh...');
          const refreshSuccess = await refreshToken();
          if (!refreshSuccess) {
            authStorage.clear();
            setUser(null);
          }
        } else {
          setUser(user);
          // Set up refresh for existing token
          const timeUntilExpiry = Math.floor((expiryTime - now) / 1000);
          setupTokenRefresh(timeUntilExpiry);
          
          // Set primary organization as current
          if (user.organizations.length > 0) {
            const primaryOrg = user.organizations.find(org => org.role === 'owner') || user.organizations[0];
            setCurrentOrgId(primaryOrg.id);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authStorage.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [setupTokenRefresh]);

  /**
   * Login user
   */
  const login = async (
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const response = await authService.login(email, password);
      
      // Store auth data
      authStorage.setAuthData(
        response.access_token,
        response.refresh_token,
        response.user,
        response.expires_in,
        rememberMe
      );

      setUser(response.user);
      
      // Set primary organization
      if (response.user.organizations.length > 0) {
        const primaryOrg = response.user.organizations.find(org => org.role === 'owner') || response.user.organizations[0];
        setCurrentOrgId(primaryOrg.id);
      }

      // Setup auto-refresh
      setupTokenRefresh(response.expires_in);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Clear storage and state
    authStorage.clear();
    setUser(null);
    setCurrentOrgId(null);
    
    navigate('/login');
  }, [navigate]);

  /**
   * Refresh access token
   */
  const refreshToken = async (): Promise<boolean> => {
    try {
      const { refreshToken: currentRefreshToken } = authStorage.getAuthData();

      if (!currentRefreshToken) {
        console.error('No refresh token available');
        return false;
      }

      const response = await authService.refreshToken(currentRefreshToken);
      
      // Update tokens in storage
      authStorage.updateTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in
      );

      console.log('Token refreshed successfully');

      // Setup next refresh
      setupTokenRefresh(response.expires_in);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If refresh fails, log the user out
      logout();
      return false;
    }
  };

  /**
   * Get current organization
   */
  const getCurrentOrganization = useCallback((): Organization | null => {
    if (!user || !currentOrgId) return null;
    
    return user.organizations.find(org => org.id === currentOrgId) || null;
  }, [user, currentOrgId]);

  /**
   * Switch to a different organization
   */
  const switchOrganization = useCallback((organizationId: string): boolean => {
    if (!user) return false;
    
    const org = user.organizations.find(o => o.id === organizationId);
    if (!org) return false;
    
    setCurrentOrgId(organizationId);
    return true;
  }, [user]);

  /**
   * Check if user has required permission in organization
   */
  const hasPermission = useCallback(
    (organizationId: string, requiredRole: 'owner' | 'admin'): boolean => {
      if (!user) return false;

      const org = user.organizations.find(o => o.id === organizationId);
      if (!org) return false;

      if (requiredRole === 'owner') {
        return org.role === 'owner';
      }

      if (requiredRole === 'admin') {
        return org.role === 'owner' || org.role === 'admin';
      }

      return false;
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    login,
    logout,
    refreshToken,
    getCurrentOrganization,
    switchOrganization,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};