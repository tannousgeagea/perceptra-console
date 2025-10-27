// hooks/useUpdateOrganizationUser.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";

/**
 * Update user payload - both fields are optional
 */
export interface UpdateUserPayload {
  role?: string;
  status?: string;
}

/**
 * API response structure
 */
export interface UpdateUserResponse {
  message: string;
  user_id: string;
  username: string;
  old_role?: string;
  new_role?: string;
  old_status?: string | null;
  new_status?: string | null;
  changes: string[];
}

/**
 * Update organization user role/status
 */
export const updateOrganizationUser = async (
  userId: string,
  organizationId: string,
  payload: UpdateUserPayload
): Promise<UpdateUserResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${baseURL}/api/v1/organizations/users/${userId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update user' }));
    throw new Error(error.message || 'Failed to update user');
  }

  return response.json();
};

/**
 * Hook options
 */
export interface UseUpdateOrganizationUserOptions {
  onSuccess?: (data: UpdateUserResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

/**
 * Hook to update organization user
 */
export const useUpdateOrganizationUser = (
  options: UseUpdateOrganizationUserOptions = {}
) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options;

  const mutation = useMutation({
    mutationFn: ({ 
      userId, 
      payload 
    }: { 
      userId: string; 
      payload: UpdateUserPayload 
    }) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return updateOrganizationUser(userId, currentOrganization.id, payload);
    },

    onSuccess: (data) => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['organizationUsers', currentOrganization?.id] 
      });

      if (showToast) {
        toast.success(data.message || 'User updated successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to update user');
      }

      onError?.(error);
    },
  });

  return {
    updateUser: mutation.mutate,
    updateUserAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: Update user role
import { useUpdateOrganizationUser } from '@/hooks/useUpdateOrganizationUser';

const UserManagement = () => {
  const { updateUser, isLoading } = useUpdateOrganizationUser();

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUser({ 
      userId, 
      payload: { role: newRole } 
    });
  };

  return (
    <Select
      onValueChange={(role) => handleRoleChange(user.id, role)}
      disabled={isLoading}
    >
      <SelectItem value="owner">Owner</SelectItem>
      <SelectItem value="admin">Admin</SelectItem>
      <SelectItem value="member">Member</SelectItem>
      <SelectItem value="viewer">Viewer</SelectItem>
    </Select>
  );
};

// Example 2: Update user status
const DeactivateButton = ({ userId }: { userId: string }) => {
  const { updateUser, isLoading } = useUpdateOrganizationUser();

  const handleDeactivate = () => {
    updateUser({ 
      userId, 
      payload: { status: 'inactive' } 
    });
  };

  return (
    <Button onClick={handleDeactivate} disabled={isLoading}>
      {isLoading ? 'Deactivating...' : 'Deactivate'}
    </Button>
  );
};

// Example 3: Update both role and status
const UpdateUserForm = ({ userId }: { userId: string }) => {
  const { updateUser, isLoading } = useUpdateOrganizationUser({
    onSuccess: (data) => {
      console.log('Changes:', data.changes);
    },
  });

  const [role, setRole] = useState('member');
  const [status, setStatus] = useState('active');

  const handleSubmit = () => {
    updateUser({ 
      userId, 
      payload: { role, status } 
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Select value={role} onValueChange={setRole}>
        {/* role options *\/}
      </Select>
      <Select value={status} onValueChange={setStatus}>
        {/* status options *\/}
      </Select>
      <Button type="submit" disabled={isLoading}>
        Update User
      </Button>
    </form>
  );
};

// Example 4: With custom callbacks (no toast)
const SilentUpdate = ({ userId }: { userId: string }) => {
  const { updateUser } = useUpdateOrganizationUser({
    showToast: false,
    onSuccess: (data) => {
      console.log('User updated:', data.changes);
      // Custom success handling
    },
    onError: (error) => {
      console.error('Update failed:', error);
      // Custom error handling
    },
  });

  return (
    <Button onClick={() => updateUser({ userId, payload: { role: 'viewer' } })}>
      Make Viewer
    </Button>
  );
};

// Example 5: In UserManagement table with dropdown
const UserRow = ({ user }: { user: OrganizationUser }) => {
  const { updateUser, isLoading } = useUpdateOrganizationUser();

  return (
    <TableRow>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Select
          value={user.role}
          onValueChange={(role) => updateUser({ 
            userId: user.id, 
            payload: { role } 
          })}
          disabled={user.role === 'owner' || isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
          {user.status}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => updateUser({ 
                userId: user.id, 
                payload: { status: 'inactive' } 
              })}
              disabled={isLoading}
            >
              Deactivate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateUser({ 
                userId: user.id, 
                payload: { status: 'active' } 
              })}
              disabled={isLoading}
            >
              Activate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

// Example 6: Async version with error handling
const AsyncUpdate = ({ userId }: { userId: string }) => {
  const { updateUserAsync } = useUpdateOrganizationUser({ showToast: false });

  const handleUpdate = async () => {
    try {
      const result = await updateUserAsync({ 
        userId, 
        payload: { role: 'admin' } 
      });
      
      console.log('Success:', result.message);
      console.log('Changes made:', result.changes);
      
      // Do something else after success
    } catch (error) {
      console.error('Failed:', error);
      // Handle error
    }
  };

  return <Button onClick={handleUpdate}>Make Admin</Button>;
};
*/

// ============================================
// INTEGRATION IN UserManagement.tsx
// ============================================

/*
// In your UserManagement component:

import { useUpdateOrganizationUser } from '@/hooks/useUpdateOrganizationUser';

export function UserManagement() {
  const { data, isLoading, error } = useOrganizationUsers();
  const { updateUser, isLoading: isUpdating } = useUpdateOrganizationUser();

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUser({ userId, payload: { role: newRole } });
  };

  const handleDeactivateUser = (userId: string) => {
    updateUser({ userId, payload: { status: 'inactive' } });
  };

  const handleActivateUser = (userId: string) => {
    updateUser({ userId, payload: { status: 'active' } });
  };

  // Use in your table:
  <Select
    value={user.role}
    onValueChange={(role) => handleRoleChange(user.id, role)}
    disabled={user.role === 'owner' || isUpdating}
  >
    {/* options *\/}
  </Select>

  <DropdownMenuItem 
    onClick={() => handleDeactivateUser(user.id)}
    disabled={isUpdating}
  >
    Deactivate
  </DropdownMenuItem>
}
*/