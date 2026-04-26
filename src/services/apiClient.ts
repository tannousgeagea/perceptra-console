// services/apiClient.ts
//
// Fix #7 — Central fetch wrapper with automatic 401 handling.
//
// Why this file exists:
//   The timer-based refresh only guards against predictable expiry. It cannot
//   handle server-side token revocation, clock skew, or a tab waking up after
//   the system was suspended. In those cases the timer may have already fired
//   (or never fired) and the next API call returns 401. Without an interceptor
//   that 401 surfaces as an unhandled error in whichever component made the
//   request, rather than triggering a clean refresh-then-retry or logout.
//
// How it works:
//   1. Attach the current access token to every request automatically.
//   2. On 401: attempt one silent token refresh.
//   3. If the refresh succeeds, retry the original request with the new token.
//   4. If the refresh fails, refreshToken() calls logout() internally —
//      the user is redirected to /login with no further action needed here.
//
// Usage — replace bare fetch() calls in your feature services with apiFetch():
//
//   import { apiFetch } from '@/services/apiClient';
//
//   const data = await apiFetch('/api/v1/projects').then(r => r.json());
//
// The wrapper is intentionally thin — it only handles auth concerns. All other
// error handling (4xx, 5xx, network errors) remains the responsibility of the
// calling service, exactly as before.

import { baseURL } from '@/components/api/base';
import { authStorage } from '@/services/authService';

// ---------------------------------------------------------------------------
// Ref injection
//
// apiClient needs to call refreshToken() from AuthContext, but it lives outside
// React so it cannot call useAuth(). We bridge this with a module-level ref
// that AuthContext writes to once on mount.
//
// AuthContext sets this up in a useEffect:
//
//   useEffect(() => { setApiClientRefreshHandler(refreshToken); }, [refreshToken]);
//
// ---------------------------------------------------------------------------

type RefreshHandler = () => Promise<boolean>;
let _refreshHandler: RefreshHandler | null = null;

export function setApiClientRefreshHandler(handler: RefreshHandler): void {
  _refreshHandler = handler;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

type FetchInput = string | URL;

export async function apiFetch(
  path: FetchInput,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${baseURL}${path}`;
  const { accessToken } = authStorage.getAuthData();

  const buildHeaders = (token: string | null): HeadersInit => {
    // Do not set Content-Type for FormData — the browser must set it with the boundary.
    const base: Record<string, string> =
      options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    return {
      ...base,
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // First attempt
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(accessToken),
  });

  // Happy path
  if (response.status !== 401) {
    return response;
  }

  // --- 401 received ---

  if (!_refreshHandler) {
    // Context not mounted yet (unlikely in practice) — return as-is
    return response;
  }

  const refreshed = await _refreshHandler();

  if (!refreshed) {
    // refreshToken() already called logout() — return the 401 so the caller
    // can handle it gracefully if needed (e.g. abort pending requests)
    return response;
  }

  // Retry with the new token
  const { accessToken: newToken } = authStorage.getAuthData();

  return fetch(url, {
    ...options,
    headers: buildHeaders(newToken),
  });
}