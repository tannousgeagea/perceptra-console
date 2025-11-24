// hooks/useAuthHelpers.ts
import { useMemo } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_STORAGE_KEYS } from '@/types/auth';
import { 
  getUserFullName, 
  getPrimaryOrganization, 
  hasRole, 
  hasRoleInOrganization,
  isOwnerOrAdmin,
  getOrganizationById,
  OrganizationRole 
} from '@/types/auth';
import { authStorage } from '@/services/authService';

/**
 * Hook for common auth helper functions
 */
export const useAuthHelpers = () => {
  const { user } = useAuth();

  const helpers = useMemo(() => ({
    /**
     * Get user's full name or email fallback
     */
    getUserFullName: () => user ? getUserFullName(user) : '',

    /**
     * Get user's primary organization
     */
    getPrimaryOrganization: () => user ? getPrimaryOrganization(user) : null,

    /**
     * Check if user has specific role in any organization
     */
    hasRole: (role: OrganizationRole) => user ? hasRole(user, role) : false,

    /**
     * Check if user has role in specific organization
     */
    hasRoleInOrganization: (organizationId: string, role: OrganizationRole) => 
      user ? hasRoleInOrganization(user, organizationId, role) : false,

    /**
     * Check if user is owner or admin
     */
    isOwnerOrAdmin: () => user ? isOwnerOrAdmin(user) : false,

    /**
     * Get organization by ID
     */
    getOrganizationById: (organizationId: string) => 
      user ? getOrganizationById(user, organizationId) : undefined,

    /**
     * Get all user organizations
     */
    getAllOrganizations: () => user?.organizations || [],

    /**
     * Get user email
     */
    getUserEmail: () => user?.email || '',

    /**
     * Get user ID
     */
    getUserId: () => user?.id || '',
  }), [user]);

  return helpers;
};

export const getAccessToken = () => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  return token
}

/**
 * Hook for organization-specific operations
 */
export const useCurrentOrganization = () => {
  const { getCurrentOrganization, switchOrganization, hasPermission } = useAuth();

  const currentOrg = getCurrentOrganization();
  return {
    currentOrganization: currentOrg,
    switchOrganization,
    hasOwnerPermission: currentOrg ? hasPermission(currentOrg.id, 'owner') : false,
    hasAdminPermission: currentOrg ? hasPermission(currentOrg.id, 'admin') : false,
    isOwner: currentOrg?.role === 'owner',
    isAdmin: currentOrg?.role === 'admin',
    isMember: currentOrg?.role === 'member',
    isViewer: currentOrg?.role === 'viewer',
  };
};

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook to require specific role
 */
export const useRequireRole = (
  requiredRole: OrganizationRole,
  redirectTo: string = '/unauthorized'
) => {
  const { user, isLoading } = useAuth();
  const helpers = useAuthHelpers();
  const navigate = useNavigate();

  const hasRequiredRole = helpers.hasRole(requiredRole);

  useEffect(() => {
    if (!isLoading && user && !hasRequiredRole) {
      navigate(redirectTo);
    }
  }, [user, isLoading, hasRequiredRole, navigate, redirectTo]);

  return { hasRequiredRole, isLoading };
};