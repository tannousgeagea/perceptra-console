// services/authService.ts
import { baseURL } from "@/components/api/base";
import { 
  LoginResponse, 
  RefreshTokenResponse, 
  User,
  AUTH_STORAGE_KEYS,
  OAuthInitiateResponse
} from "@/types/auth";

/**
 * Storage utility to handle both localStorage and sessionStorage
 */
class AuthStorage {
  private getStorage(): Storage {
    // Check if we're using localStorage or sessionStorage
    if (localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)) {
      return localStorage;
    }
    return sessionStorage;
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

  clear(): void {
    Object.values(AUTH_STORAGE_KEYS).forEach(key => {
      this.remove(key);
    });
  }

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
 * API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Auth service for all authentication-related API calls
 */
export const authService = {
  /**
   * Login with email and password
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

      const data: LoginResponse = await res.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Network error during login");
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
      throw new ApiError(500, "Network error fetching user");
    }
  },

  /**
   * Refresh access token using refresh token
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

      const data: RefreshTokenResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Network error refreshing token");
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

      return res.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Network error initiating OAuth");
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

      const data: LoginResponse = await res.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Network error completing OAuth");
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