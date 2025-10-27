// types/auth.ts

/**
 * Organization role types
 */
export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Organization interface
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: OrganizationRole;
}

/**
 * User interface matching your API response
 */
export type UserRole = 'owner' | 'admin' | 'annotator' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface InviteUserData {
  email: string;
  role: UserRole;
}

export interface User {
  id: string;
  username: string | null;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  last_active: string;
  avatar: string;
  organizations: Organization[];
}


/**
 * Token information
 */
export interface TokenData {
  access_token: string;
  token_type: 'bearer';
  expires_in: number; // seconds until expiration
  refresh_token: string;
}

/**
 * Login response from API
 */
export interface LoginResponse extends TokenData {
  user: User;
}

/**
 * Refresh token response from API
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * Auth state
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Storage keys
 */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  TOKEN_EXPIRY: 'token_expiry',
} as const;

/**
 * Helper to get user's full name
 */
export const getUserFullName = (user: User): string => {
  const firstName = user.first_name?.trim() || '';
  const lastName = user.last_name?.trim() || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  return firstName || lastName || user.email.split('@')[0];
};

/**
 * Helper to get user's primary organization (first one or owner role)
 */
export const getPrimaryOrganization = (user: User): Organization | null => {
  if (!user.organizations.length) return null;
  
  // Prefer owner role
  const ownerOrg = user.organizations.find(org => org.role === 'owner');
  if (ownerOrg) return ownerOrg;
  
  // Otherwise return first
  return user.organizations[0];
};

/**
 * Helper to check if user has specific role in any organization
 */
export const hasRole = (user: User, role: OrganizationRole): boolean => {
  return user.organizations.some(org => org.role === role);
};

/**
 * Helper to check if user has role in specific organization
 */
export const hasRoleInOrganization = (
  user: User, 
  organizationId: string, 
  role: OrganizationRole
): boolean => {
  const org = user.organizations.find(o => o.id === organizationId);
  return org?.role === role;
};

/**
 * Helper to check if user is owner or admin in any organization
 */
export const isOwnerOrAdmin = (user: User): boolean => {
  return user.organizations.some(org => 
    org.role === 'owner' || org.role === 'admin'
  );
};

/**
 * Helper to get organization by ID
 */
export const getOrganizationById = (
  user: User, 
  organizationId: string
): Organization | undefined => {
  return user.organizations.find(org => org.id === organizationId);
};