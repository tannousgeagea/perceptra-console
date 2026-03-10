// context/AuthContext.tsx
import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useRef 
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, authStorage, ApiError } from '@/services/authService';
import { User, Organization, OAuthProviderType, UserCreate, OAUTH_STORAGE_KEYS, getPrimaryOrganization } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  /** True only during the initial boot check — NOT during login/signup actions */
  isInitializing: boolean;
  setUser: (user: User) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (data: UserCreate) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  getCurrentOrganization: () => Organization | null;
  switchOrganization: (organizationId: string) => boolean;
  hasPermission: (organizationId: string, requiredRole: 'owner' | 'admin') => boolean;
  loginWithOAuth: (provider: OAuthProviderType) => Promise<void>;
  handleOAuthCallback: (provider: OAuthProviderType, code: string, state: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  /**
   * Fix #9 — split the single isLoading flag into two concerns:
   *   isInitializing: the one-time boot check (drives ProtectedRoute spinner)
   *   The login/signup forms own their own local isSubmitting state.
   * This prevents the full-screen spinner from flashing on every login attempt.
   */

  const [isInitializing, setIsInitializing] = useState(true);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const navigate = useNavigate();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Fix — stable ref that always points to the latest refreshToken function.
   * This breaks the stale-closure cycle: setupTokenRefresh can safely use an
   * empty dependency array while still calling the current refreshToken.
   */
  const refreshTokenRef = useRef<() => Promise<boolean>>();

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------
  /**
   * Fix #8 — extracted from login / signup / handleOAuthCallback to avoid
   * duplicating the org-selection logic in three places.
   */
  const initializeUserSession = useCallback(
    (sessionUser: User, expiresIn: number) => {
      setUser(sessionUser);

      // Use the shared helper from auth.ts (owner preferred, else first)
      const primaryOrg = getPrimaryOrganization(sessionUser);
      if (primaryOrg) {
        setCurrentOrgId(primaryOrg.id);
      }

      // Timer is scheduled via the stable ref — no dep needed here
      refreshTokenRef.current && setupTokenRefreshInternal(expiresIn);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // intentionally empty — setupTokenRefreshInternal is stable via ref
  );

  /**
   * Fix (stale closure) — setupTokenRefresh reads refreshToken through the ref
   * so it is safe to memoize with an empty dep array. The ref is always kept
   * current by the effect below.
   *
   * Fix #4 — when refreshTime <= 0 (token is already too close to expiry on
   * tab resume) we trigger a refresh immediately instead of silently returning.
   */
  const setupTokenRefreshInternal = useCallback((expiresIn: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const BUFFER_MS = 5 * 60 * 1000; // refresh 5 minutes before expiry
    const refreshTime = expiresIn * 1000 - BUFFER_MS;

    if (refreshTime <= 0) {
      // Token is already inside the buffer window — refresh now
      refreshTokenRef.current?.();
      return;
    }

    refreshTimeoutRef.current = setTimeout(() => {
      console.log('Auto-refreshing token...');
      refreshTokenRef.current?.();
    }, refreshTime);
  }, []); // safe — only touches refs, no closed-over state

  // Keep the ref in sync with the latest refreshToken implementation
  // (the effect runs after every render in which refreshToken identity changes)
  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  });


  /**
   * Fix #9 — removed setIsLoading(true/false). The login form should own its
   * own isSubmitting state; the global flag is only for the boot check.
   */
  const login = async (
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login(email, password);
      
      // Store auth data
      authStorage.setAuthData(
        response.access_token,
        response.refresh_token,
        response.user,
        response.expires_in,
        rememberMe
      );

      // Fix #8 — use shared helper instead of inline org-selection logic
      initializeUserSession(response.user, response.expires_in);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
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
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const { refreshToken: currentRefreshToken } = authStorage.getAuthData();

      if (!currentRefreshToken) {
        logout();
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
      setupTokenRefreshInternal(response.expires_in);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If refresh fails, log the user out
      logout();
      return false;
    }
  }, [logout, setupTokenRefreshInternal])

  // ---------------------------------------------------------------------------
  // Boot — initialize auth state from storage on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { accessToken, refreshToken: refreshTokenConst, user: storedUser, tokenExpiry } = authStorage.getAuthData();

        if (!accessToken || !refreshTokenConst || !storedUser || !tokenExpiry) {
          return;
        }

        // Check if token is expired
        const now = Date.now();
        const expiryTime = new Date(tokenExpiry).getTime();

        if (expiryTime <= now) {
          console.log('Token expired, attempting refresh...');
          await refreshTokenRef.current?.();
        } else {
          setUser(user);
          // Set up refresh for existing token
          const timeUntilExpiry = Math.floor((expiryTime - now) / 1000);
          setupTokenRefreshInternal(timeUntilExpiry);

          const primaryOrg = getPrimaryOrganization(storedUser);
          if (primaryOrg) setCurrentOrgId(primaryOrg.id);
          
          // Set primary organization as current
          // if (user.organizations.length > 0) {
          //   const primaryOrg = user.organizations.find(org => org.role === 'owner') || user.organizations[0];
          //   setCurrentOrgId(primaryOrg.id);
          // }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authStorage.clear();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [setupTokenRefreshInternal]);

  // ---------------------------------------------------------------------------
  // Organization helpers
  // ---------------------------------------------------------------------------

  const getCurrentOrganization = useCallback((): Organization | null => {
    if (!user || !currentOrgId) return null;
    return user.organizations.find(org => org.id === currentOrgId) || null;
  }, [user, currentOrgId]);

  const switchOrganization = useCallback(
    (organizationId: string): boolean => {
      if (!user) return false;
      const org = user.organizations.find(o => o.id === organizationId);
      if (!org) return false;
      setCurrentOrgId(organizationId);
      return true;
    },
    [user]
  );

  const hasPermission = useCallback(
    (organizationId: string, requiredRole: 'owner' | 'admin'): boolean => {
      if (!user) return false;
      const org = user.organizations.find(o => o.id === organizationId);
      if (!org) return false;
      if (requiredRole === 'owner') return org.role === 'owner';
      if (requiredRole === 'admin') return org.role === 'owner' || org.role === 'admin';
      return false;
    },
    [user]
  );

  /**
   * Initiate OAuth login flow
   */
  const loginWithOAuth = async (provider: OAuthProviderType) => {
    try {
      const response = await authService.initiateOAuth(provider);
      
      sessionStorage.setItem(OAUTH_STORAGE_KEYS.STATE, response.state);
      sessionStorage.setItem(OAUTH_STORAGE_KEYS.PROVIDER, provider);

      // Redirect to OAuth provider
      window.location.href = response.authorization_url;
    } catch (error) {
      console.error('OAuth initiation failed:', error);
      throw error;
    }
  };

  /**
   * Handle OAuth callback
   */
  const handleOAuthCallback = async (
    provider: OAuthProviderType,
    code: string,
    state: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsInitializing(true);

      // Verify state matches (CSRF protection)
      const storedState = sessionStorage.getItem(OAUTH_STORAGE_KEYS.STATE);
      const storedProvider = sessionStorage.getItem(OAUTH_STORAGE_KEYS.PROVIDER);
      
      if (storedState !== state || storedProvider !== provider) {
        throw new Error('Invalid OAuth state - possible CSRF attack');
      }

      // Complete OAuth flow
      const response = await authService.completeOAuth(provider, code, state);
      
      // Store auth data (always use sessionStorage for OAuth to be safe)
      authStorage.setAuthData(
        response.access_token,
        response.refresh_token,
        response.user,
        response.expires_in,
        false // Don't persist OAuth logins by default
      );

      setUser(response.user);
      
      // Set primary organization
      if (response.user.organizations.length > 0) {
        const primaryOrg = response.user.organizations.find(org => org.role === 'owner') 
          || response.user.organizations[0];
        setCurrentOrgId(primaryOrg.id);
      }

      // Setup auto-refresh
      initializeUserSession(response.user, response.expires_in)

      // Clean up OAuth state
      authStorage.clear();
      // Re-persist auth data cleared by the line above
      authStorage.setAuthData(
        response.access_token,
        response.refresh_token,
        response.user,
        response.expires_in,
        false
      );
      return { success: true };
    } catch (error) {
      console.error('OAuth callback failed:', error);
      
      // Clean up on error
      sessionStorage.removeItem(OAUTH_STORAGE_KEYS.STATE);
      sessionStorage.removeItem(OAUTH_STORAGE_KEYS.PROVIDER);
      
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Authentication failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setIsInitializing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // signup
  // ---------------------------------------------------------------------------

  /**
   * Fix #6 — the original discarded the LoginResponse, forcing users to log in
   * manually after signing up. We now persist the tokens and log them in
   * immediately, matching standard UX expectations.
   *
   * Fix #9 — removed setIsLoading; form owns its own submission state.
   */
  const signup = async (data: UserCreate): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.signup(data);

      authStorage.setAuthData(
        response.access_token,
        response.refresh_token,
        response.user,
        response.expires_in,
        false // OAuth and signup sessions use sessionStorage by default
      );

      initializeUserSession(response.user, response.expires_in);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Sign up failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  // ---------------------------------------------------------------------------
  // Password reset
  // ---------------------------------------------------------------------------

  const requestPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await authService.requestPasswordReset(email);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Failed to send reset email. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await authService.resetPassword(token, newPassword);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Failed to reset password. The link may have expired.';
      return { success: false, error: errorMessage };
    }
  };
  

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isInitializing,
    setUser,
    login,
    signup,
    logout,
    refreshToken,
    getCurrentOrganization,
    switchOrganization,
    hasPermission,
    loginWithOAuth,
    handleOAuthCallback,
    requestPasswordReset,
    resetPassword,
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