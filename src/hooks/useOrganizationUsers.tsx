// hooks/useOrganizationUsers.ts

import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS, User } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";

/**
 * Organization user type (different from auth User type)
 */
export interface OrganizationUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
  last_active: string;
  avatar: string | null;
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
}

/**
 * API response structure
 */
export interface OrganizationUsersResponse {
  total: number;
  page: number;
  page_size: number;
  users: User[];
}

/**
 * Query parameters
 */
export interface OrganizationUsersParams {
  skip?: number;
  limit?: number;
}

/**
 * Fetch organization users
 */
export const fetchOrganizationUsers = async (
  organizationId: string,
  params: OrganizationUsersParams = {}
): Promise<OrganizationUsersResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const { skip = 0, limit = 100 } = params;
  
  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${baseURL}/api/v1/organizations/users?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch organization users");
  }

  return response.json();
};

/**
 * Hook to fetch organization users
 * Automatically uses current organization from auth context
 */
export const useOrganizationUsers = (params: OrganizationUsersParams = {}) => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['organizationUsers', currentOrganization?.id, params],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchOrganizationUsers(currentOrganization.id, params);
    },
    enabled: !!currentOrganization,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};

/**
 * Hook with manual organization ID (useful for admins viewing other orgs)
 */
export const useOrganizationUsersByOrgId = (
  organizationId?: string,
  params: OrganizationUsersParams = {}
) => {
  return useQuery({
    queryKey: ['organizationUsers', organizationId, params],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("No organization ID provided");
      }
      return fetchOrganizationUsers(organizationId, params);
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook for paginated users
 */
export const useOrganizationUsersPaginated = (
  page: number = 1,
  pageSize: number = 20
) => {
  const { currentOrganization } = useCurrentOrganization();
  const skip = (page - 1) * pageSize;

  return useQuery({
    queryKey: ['organizationUsers', currentOrganization?.id, page, pageSize],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchOrganizationUsers(currentOrganization.id, {
        skip,
        limit: pageSize,
      });
    },
    enabled: !!currentOrganization,
    staleTime: 2 * 60 * 1000,
  });
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: Basic usage - all users in current organization
import { useOrganizationUsers } from '@/hooks/useOrganizationUsers';

const TeamPage = () => {
  const { data, isLoading, error } = useOrganizationUsers();

  if (isLoading) return <div>Loading team members...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Team Members ({data?.total})</h2>
      <ul>
        {data?.users.map(user => (
          <li key={user.id}>
            {user.first_name} {user.last_name} - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Example 2: With custom pagination
const TeamPagePaginated = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const { data, isLoading } = useOrganizationUsersPaginated(page, pageSize);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div>
      <h2>Team Members</h2>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul>
            {data?.users.map(user => (
              <li key={user.id}>
                <UserAvatar user={user} size="sm" />
                {user.first_name} {user.last_name}
              </li>
            ))}
          </ul>

          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Example 3: With custom limit
const TeamList = () => {
  const { data, isLoading } = useOrganizationUsers({ 
    skip: 0, 
    limit: 50 
  });

  return (
    <div>
      {data?.users.map(user => (
        <div key={user.id} className="flex items-center gap-2 p-2">
          <UserAvatar user={user} size="md" />
          <div>
            <p className="font-semibold">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          <span 
            className={`ml-auto px-2 py-1 text-xs rounded ${
              user.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {user.status}
          </span>
        </div>
      ))}
    </div>
  );
};

// Example 4: Admin viewing specific organization
const AdminOrgView = ({ orgId }: { orgId: string }) => {
  const { data, isLoading } = useOrganizationUsersByOrgId(orgId);

  return (
    <div>
      <h3>Users in Organization</h3>
      <p>Total: {data?.total}</p>
      {/* ... render users *\/}
    </div>
  );
};

// Example 5: With filtering and searching
const TeamPageWithSearch = () => {
  const { data, isLoading } = useOrganizationUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];

    return data.users.filter(user => {
      const matchesSearch = 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [data?.users, searchTerm, roleFilter]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      
      <select 
        value={roleFilter} 
        onChange={(e) => setRoleFilter(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="all">All Roles</option>
        <option value="owner">Owner</option>
        <option value="admin">Admin</option>
        <option value="member">Member</option>
        <option value="viewer">Viewer</option>
      </select>

      <p className="mb-4">
        Showing {filteredUsers.length} of {data?.total} users
      </p>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {filteredUsers.map(user => (
            <li key={user.id} className="p-2 border-b">
              {user.first_name} {user.last_name} ({user.role})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Example 6: User card component
const UserCard = ({ user }: { user: OrganizationUser }) => {
  const lastActive = new Date(user.last_active);
  const isRecent = Date.now() - lastActive.getTime() < 5 * 60 * 1000; // 5 minutes

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center gap-3">
        <div className="relative">
          <UserAvatar user={user} size="lg" />
          {isRecent && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded capitalize">
              {user.role}
            </span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded capitalize">
              {user.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
*/

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get user's full name
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
 * Get user initials
 */
export const getUserInitials = (user: User): string => {
  const fullName = getUserFullName(user);
  return fullName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user.email[0].toUpperCase();
};

/**
 * Check if user is active recently (within last 5 minutes)
 */
export const isUserActiveRecently = (user: User): boolean => {
  const lastActive = new Date(user.last_active);
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return lastActive.getTime() > fiveMinutesAgo;
};