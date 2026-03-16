// context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, authStorage, ApiError } from '@/services/authService';
import {
  User,
  Organization,
  OAuthProviderType,
  UserCreate,
  OAUTH_STORAGE_KEYS,
  getPrimaryOrganization,
} from '@/types/auth';

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
  handleOAuthCallback: (
    provider: OAuthProviderType,
    code: string,
    state: string
  ) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  /**
   * isInitializing — true only for the one-time boot check on mount.
   * login / signup / OAuth callback pages must own their own local isSubmitting
   * state. Keeping these separate prevents the full-screen ProtectedRoute
   * spinner from flashing on every form submission (Fix #9).
   */
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const navigate = useNavigate();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Stable ref that always points to the latest refreshToken implementation.
   * This breaks the stale-closure chain: setupTokenRefreshInternal can use an
   * empty dep array while still invoking the current refreshToken at fire time.
   */
  const refreshTokenRef = useRef<() => Promise<boolean>>();

  // ---------------------------------------------------------------------------
  // setupTokenRefreshInternal
  // ---------------------------------------------------------------------------

  /**
   * Schedules the next silent token refresh.
   * Safe with empty deps — it only reads/writes refs, never closed-over state.
   *
   * Fix #4 — when refreshTime <= 0 (tab resumed inside the 5-min buffer window)
   * trigger an immediate refresh instead of silently bailing out.
   */
  const setupTokenRefreshInternal = useCallback((expiresIn: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const BUFFER_MS = 5 * 60 * 1000; // refresh 5 minutes before expiry
    const refreshTime = expiresIn * 1000 - BUFFER_MS;

    if (refreshTime <= 0) {
      refreshTokenRef.current?.();
      return;
    }

    refreshTimeoutRef.current = setTimeout(() => {
      refreshTokenRef.current?.();
    }, refreshTime);
  }, []); // safe — only touches refs, no closed-over state

  // Keep the ref in sync after every render so the timer always calls the
  // latest refreshToken closure.
  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  });

  // ---------------------------------------------------------------------------
  // logout  (defined before refreshToken so the latter can reference it)
  // ---------------------------------------------------------------------------

  const logout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    authStorage.clear();
    setUser(null);
    setCurrentOrgId(null);
    navigate('/login');
  }, [navigate]);

  // ---------------------------------------------------------------------------
  // refreshToken
  // ---------------------------------------------------------------------------

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const { refreshToken: currentRefreshToken } = authStorage.getAuthData();

      if (!currentRefreshToken) {
        logout();
        return false;
      }

      const response = await authService.refreshToken(currentRefreshToken);

      authStorage.updateTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in
      );

      setupTokenRefreshInternal(response.expires_in);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  }, [logout, setupTokenRefreshInternal]);

  // ---------------------------------------------------------------------------
  // initializeUserSession
  // ---------------------------------------------------------------------------

  /**
   * Shared session bootstrap called after login, signup, and OAuth callback.
   * Centralises org-selection that was previously duplicated in three places
   * (Fix #8).
   *
   * FIX (Bug 3) — removed the `refreshTokenRef.current &&` guard that
   * previously could silently skip the timer when this was called before the
   * ref-sync effect had a chance to run. setupTokenRefreshInternal is safe to
   * call unconditionally — it only touches refs, not React state.
   */
  const initializeUserSession = useCallback(
    (sessionUser: User, expiresIn: number) => {
      setUser(sessionUser);

      const primaryOrg = getPrimaryOrganization(sessionUser);
      if (primaryOrg) {
        setCurrentOrgId(primaryOrg.id);
      }

      // No guard needed — always safe to call
      setupTokenRefreshInternal(expiresIn);
    },
    [setupTokenRefreshInternal]
  );

  // ---------------------------------------------------------------------------
  // Boot — restore session from storage on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          accessToken,
          refreshToken: storedRefreshToken,
          user: storedUser,
          tokenExpiry,
        } = authStorage.getAuthData();

        if (!accessToken || !storedRefreshToken || !storedUser || !tokenExpiry) {
          return; // No session — stay logged out
        }

        const now = Date.now();
        const expiryTime = new Date(tokenExpiry).getTime();

        if (expiryTime <= now) {
          // Expired — refreshToken() calls logout() internally on failure,
          // so no additional teardown is needed here.
          await refreshTokenRef.current?.();
        } else {
          /**
           * Token still valid — hydrate state directly.
           *
           * We do NOT use initializeUserSession here because the ref-sync
           * effect hasn't run yet on the very first mount, so the timer inside
           * initializeUserSession would fire against an empty ref.
           * setupTokenRefreshInternal is called directly instead, which is
           * always safe (it only touches refs).
           */
          setUser(storedUser);

          const timeUntilExpiry = Math.floor((expiryTime - now) / 1000);
          setupTokenRefreshInternal(timeUntilExpiry);

          const primaryOrg = getPrimaryOrganization(storedUser);
          if (primaryOrg) setCurrentOrgId(primaryOrg.id);
        }
      } catch (error) {
        // Unexpected error during boot — wipe storage, stay logged out.
        // Do NOT call logout() here: it navigates to /login before
        // isInitializing has flipped, causing a navigation race condition.
        authStorage.clear();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [setupTokenRefreshInternal]);

  // ---------------------------------------------------------------------------
  // login
  // ---------------------------------------------------------------------------

  const login = async (
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login(email, password);

      authStorage.setAuthData(
        response.access_token,
        response.refresh_token,
        response.user,
        response.expires_in,
        rememberMe
      );

      initializeUserSession(response.user, response.expires_in);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  // ---------------------------------------------------------------------------
  // signup
  // ---------------------------------------------------------------------------

  /**
   * Fix #6 — signup now logs the user in immediately by consuming the
   * LoginResponse the API already returns, instead of discarding it.
   */
  const signup = async (data: UserCreate): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.signup(data);

      authStorage.setAuthData(
        response.access_token,
        response.refresh_token,
        response.user,
        response.expires_in,
        false
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
  // OAuth
  // ---------------------------------------------------------------------------

  const loginWithOAuth = async (provider: OAuthProviderType): Promise<void> => {
    try {
      const response = await authService.initiateOAuth(provider);
      sessionStorage.setItem(OAUTH_STORAGE_KEYS.STATE, response.state);
      sessionStorage.setItem(OAUTH_STORAGE_KEYS.PROVIDER, provider);
      window.location.href = response.authorization_url;
    } catch (error) {
      throw error;
    }
  };

  /**
   * FIX (Bug 1 — the direct cause of logout-on-refresh for OAuth users):
   *
   * The previous version called authStorage.clear() after writing the tokens
   * and hydrating React state, then immediately re-called setAuthData() to
   * restore them. This was fragile: clear() also wiped STORAGE_TYPE and the
   * OAuth CSRF keys, and if anything threw between the clear() and the
   * re-persist, the user was left with no tokens in storage. More critically,
   * the clear/re-persist pattern was unnecessary — just write once and leave it.
   *
   * Fix: call setAuthData() exactly once, then removeItem() the two CSRF keys
   * directly. Do NOT call authStorage.clear() inside a successful OAuth flow.
   *
   * FIX (Bug 2):
   * The previous version called setIsInitializing(true) at the top of this
   * function. isInitializing is the boot-guard flag consumed by ProtectedRoute
   * to decide whether to show the full-screen spinner or redirect. Toggling it
   * mid-session caused ProtectedRoute to re-evaluate auth state and flash the
   * spinner during the callback. The OAuth callback page is responsible for its
   * own loading UI — isInitializing must not be reused for that.
   */
  const handleOAuthCallback = async (
    provider: OAuthProviderType,
    code: string,
    state: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const storedState = sessionStorage.getItem(OAUTH_STORAGE_KEYS.STATE);
      const storedProvider = sessionStorage.getItem(OAUTH_STORAGE_KEYS.PROVIDER);

      if (storedState !== state || storedProvider !== provider) {
        throw new Error('Invalid OAuth state — possible CSRF attack');
      }

      const response = await authService.completeOAuth(provider, code, state);

      // Write tokens to storage exactly once
      authStorage.setAuthData(
        response.access_token,
        response.refresh_token,
        response.user,
        response.expires_in,
        false // OAuth sessions use sessionStorage by default
      );

      // Hydrate React state and schedule the refresh timer
      initializeUserSession(response.user, response.expires_in);

      // Clean up CSRF handshake keys — remove directly, do NOT call clear()
      sessionStorage.removeItem(OAUTH_STORAGE_KEYS.STATE);
      sessionStorage.removeItem(OAUTH_STORAGE_KEYS.PROVIDER);

      return { success: true };
    } catch (error) {
      sessionStorage.removeItem(OAUTH_STORAGE_KEYS.STATE);
      sessionStorage.removeItem(OAUTH_STORAGE_KEYS.PROVIDER);

      const errorMessage =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Authentication failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

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

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};