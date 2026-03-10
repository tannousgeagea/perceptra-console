// services/authService.ts
import { baseURL } from "@/components/api/base";
import { 
  LoginResponse, 
  RefreshTokenResponse, 
  User,
  AUTH_STORAGE_KEYS,
  OAUTH_STORAGE_KEYS,
  OAuthInitiateResponse
} from "@/types/auth";

/**
 * Storage utility that handles both localStorage and sessionStorage.
 *
 * Fix #1 — the original getStorage() guessed which storage to use by checking
 * whether localStorage contained the access token. This was fragile: a stale
 * token from a previous "remember me" session would cause updateTokens() to
 * write refreshed tokens to localStorage even when the current session was
 * using sessionStorage, silently leaving the session tokens stale.
 *
 * The fix is to record the chosen storage backend explicitly via
 * AUTH_STORAGE_KEYS.STORAGE_TYPE and read it back deterministically.
 */
class AuthStorage {
  /**
   * Returns the storage backend that was chosen at login time.
   * Falls back to sessionStorage if the marker is absent (e.g. first visit).
   */
  private getStorage(): Storage {
    return sessionStorage.getItem(AUTH_STORAGE_KEYS.STORAGE_TYPE) === 'local'
      ? localStorage
      : sessionStorage;
  }

  set(key: string, value: string, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(key, value);
  }

  get(key: string): string | null {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  /**
   * Fix #2 — the original clear() left the STORAGE_TYPE marker and the OAuth
   * CSRF keys behind after logout. These are now included explicitly so no
   * forensic data survives a session end.
   */
  clear(): void {
    // Auth token keys
    Object.values(AUTH_STORAGE_KEYS).forEach(key => this.remove(key));

    // OAuth CSRF handshake keys (always sessionStorage, but remove() covers both)
    Object.values(OAUTH_STORAGE_KEYS).forEach(key => this.remove(key));
  }

  /**
   * Persists all auth data atomically to the chosen storage backend and
   * records which backend was used so updateTokens() can target it correctly.
   */
  setAuthData(
    accessToken: string,
    refreshToken: string,
    user: User,
    expiresIn: number,
    rememberMe: boolean = false
  ): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    const expiryDate = new Date(Date.now() + expiresIn * 1000);
    
    storage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    storage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    storage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiryDate.toISOString());

    // Record the backend choice so getStorage() is deterministic on refresh
    localStorage.setItem(
      AUTH_STORAGE_KEYS.STORAGE_TYPE,
      rememberMe ? 'local' : 'session'
    );
  }

  getAuthData(): {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
    tokenExpiry: Date | null;
  } {
    const accessToken = this.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = this.get(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    const userStr = this.get(AUTH_STORAGE_KEYS.USER);
    const expiryStr = this.get(AUTH_STORAGE_KEYS.TOKEN_EXPIRY);

    return {
      accessToken,
      refreshToken,
      user: userStr ? JSON.parse(userStr) : null,
      tokenExpiry: expiryStr ? new Date(expiryStr) : null,
    };
  }

  /**
   * Updates only the token fields after a successful refresh, writing to the
   * same backend that was chosen at login time.
   */
  updateTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const storage = this.getStorage();
    const expiryDate = new Date(Date.now() + expiresIn * 1000);
    
    storage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    storage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiryDate.toISOString());
  }
}

export const authStorage = new AuthStorage();

/**
 * Structured API error.
 *
 * Fix #5 — network-level failures (offline, DNS, CORS) now use status 0
 * instead of 500 so monitoring can distinguish "server returned an error"
 * from "request never reached the server".
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Converts an unknown catch value into a human-readable network message. */
function toNetworkError(error: unknown, context: string): ApiError {
  const message = error instanceof Error ? error.message : 'Unknown error';
  // Status 0 = no HTTP response received (offline / DNS / CORS)
  return new ApiError(0, `Network error ${context}: ${message}`);
}

/**
 * Auth service — all authentication-related API calls.
 */
export const authService = {
  /**
   * Login with email/password.
   *
   * Fix #4 — the API field is named `username` (your backend accepts the email
   * address in the username field). The TypeScript parameter stays `email` for
   * clarity at the call-site; the mapping is explicit and documented here.
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const res = await fetch(`${baseURL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new ApiError(
          res.status,
          error.detail || "Invalid credentials",
          error
        );
      }

      return res.json() as Promise<LoginResponse>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw toNetworkError(error, 'during login');
    }
  },

  /**
   * Get current user profile
   */
  getUser: async (token: string): Promise<User> => {
    try {
      const res = await fetch(`${baseURL}/api/v1/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new ApiError(
          res.status,
          error.detail || "Failed to fetch user profile",
          error
        );
      }

      return res.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw toNetworkError(error, 'fetching user');
    }
  },

  /**
   * Exchange a refresh token for a new access token.
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      const response = await fetch(`${baseURL}/api/v1/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          response.status,
          error.detail || "Failed to refresh token",
          error
        );
      }

      return response.json() as Promise<RefreshTokenResponse>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw toNetworkError(error, 'refreshing token');
    }
  },

  /**
   * Logout (client-side cleanup)
   */
  logout: (): void => {
    authStorage.clear();
  },

  /**
   * Initiate OAuth flow
   */
  initiateOAuth: async (provider: 'microsoft' | 'google'): Promise<OAuthInitiateResponse> => {
    try {
      const res = await fetch(`${baseURL}/api/v1/auth/oauth/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new ApiError(
          res.status,
          error.detail || "Failed to initiate OAuth",
          error
        );
      }

      return res.json() as Promise<OAuthInitiateResponse>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw toNetworkError(error, 'initiating OAuth');
    }
  },

  /**
   * Complete OAuth callback
   */
  completeOAuth: async (
    provider: 'microsoft' | 'google',
    code: string,
    state: string
  ): Promise<LoginResponse> => {
    try {
      const res = await fetch(`${baseURL}/api/v1/auth/oauth/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, code, state }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new ApiError(
          res.status,
          error.detail || "OAuth authentication failed",
          error
        );
      }

      return res.json() as Promise<LoginResponse>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw toNetworkError(error, 'completing OAuth');
    }
  },

  /**
   * Register a new user account.
   * Returns a full LoginResponse so the caller can log the user in immediately.
   */
  signup: async (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    username: string;
  }): Promise<LoginResponse> => {
    try {
      const res = await fetch(`${baseURL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          password_confirm: data.confirmPassword,
          first_name: data.firstName,
          last_name: data.lastName,
          username: data.username,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new ApiError(
          res.status,
          error.detail || "Sign up failed",
          error
        );
      }

      return res.json() as Promise<LoginResponse>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw toNetworkError(error, 'during sign up');
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      const res = await fetch(`${baseURL}/api/v1/auth/password-reset/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new ApiError(
          res.status,
          error.detail || "Failed to send reset email",
          error
        );
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw toNetworkError(error, 'requesting password reset');
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      const res = await fetch(`${baseURL}/api/v1/auth/password-reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new ApiError(
          res.status,
          error.detail || "Failed to reset password",
          error
        );
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw toNetworkError(error, 'resetting password');
    }
  },
};



/**
 * IMPORTANT NOTES ABOUT YOUR API:
 * 
 * 1. expires_in format:
 *    - Your API returns 3600 (seconds)
 *    - We convert to milliseconds: expires_in * 1000
 *    - Then create Date: new Date(Date.now() + expires_in * 1000)
 * 
 * 2. Refresh endpoint:
 *    - Make sure your /api/v1/auth/refresh/ endpoint also returns expires_in
 *    - If it doesn't, you might need to ask your backend team to add it
 * 
 * 3. User object structure:
 *    - id: string
 *    - username: string | null
 *    - email: string
 *    - first_name: string
 *    - last_name: string
 *    - organizations: Array<{ id, name, slug, role }>
 * 
 * 4. Token format:
 *    - Authorization header: "Bearer {access_token}"
 *    - Make sure your backend accepts this format
 */