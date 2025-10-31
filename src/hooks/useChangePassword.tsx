// hooks/useChangePassword.ts

import { useMutation } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";

/**
 * Change password payload
 */
export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

/**
 * API response structure
 */
export interface ChangePasswordResponse {
  message: string;
}

/**
 * Change user's password
 */
export const changePassword = async (
  payload: ChangePasswordPayload,
  organizationId: string
): Promise<ChangePasswordResponse> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${baseURL}/api/v1/auth/change-password`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'Failed to change password' 
    }));
    throw new Error(error.message || 'Failed to change password');
  }

  return response.json();
};

/**
 * Hook options
 */
export interface UseChangePasswordOptions {
  onSuccess?: (data: ChangePasswordResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

/**
 * Hook to change user's password
 */
export const useChangePassword = (
  options: UseChangePasswordOptions = {}
) => {
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options;

  const mutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => {
      // Client-side validation
      if (payload.new_password !== payload.new_password_confirm) {
        throw new Error("New passwords do not match");
      }

      if (payload.new_password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      if (!payload.old_password) {
        throw new Error("Current password is required");
      }

      if (!currentOrganization) {
        throw new Error("No organization selected");
      }

      return changePassword(payload, currentOrganization.id);
    },

    onSuccess: (data) => {
      if (showToast) {
        toast.success(data.message || 'Password changed successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to change password');
      }

      onError?.(error);
    },
  });

  return {
    changePassword: mutation.mutate,
    changePasswordAsync: mutation.mutateAsync,
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
// Example 1: Basic usage in AccountSettings
import { useChangePassword } from '@/hooks/useChangePassword';

export function AccountSettings() {
  const { changePassword, isLoading } = useChangePassword();
  
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const handleChangePassword = () => {
    changePassword(passwordData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="password"
          placeholder="Current Password"
          value={passwordData.old_password}
          onChange={(e) => setPasswordData({ 
            ...passwordData, 
            old_password: e.target.value 
          })}
        />
        <Input
          type="password"
          placeholder="New Password"
          value={passwordData.new_password}
          onChange={(e) => setPasswordData({ 
            ...passwordData, 
            new_password: e.target.value 
          })}
        />
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={passwordData.new_password_confirm}
          onChange={(e) => setPasswordData({ 
            ...passwordData, 
            new_password_confirm: e.target.value 
          })}
        />
        <Button 
          onClick={handleChangePassword} 
          disabled={isLoading}
        >
          {isLoading ? 'Changing...' : 'Change Password'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Example 2: With form validation
const ChangePasswordForm = () => {
  const { changePassword, isLoading } = useChangePassword({
    onSuccess: (data) => {
      // Clear form on success
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    },
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.old_password) {
      newErrors.old_password = 'Current password is required';
    }

    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }

    if (passwordData.new_password !== passwordData.new_password_confirm) {
      newErrors.new_password_confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      changePassword(passwordData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="password"
          placeholder="Current Password"
          value={passwordData.old_password}
          onChange={(e) => setPasswordData({ 
            ...passwordData, 
            old_password: e.target.value 
          })}
        />
        {errors.old_password && (
          <p className="text-sm text-red-600 mt-1">{errors.old_password}</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="New Password"
          value={passwordData.new_password}
          onChange={(e) => setPasswordData({ 
            ...passwordData, 
            new_password: e.target.value 
          })}
        />
        {errors.new_password && (
          <p className="text-sm text-red-600 mt-1">{errors.new_password}</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={passwordData.new_password_confirm}
          onChange={(e) => setPasswordData({ 
            ...passwordData, 
            new_password_confirm: e.target.value 
          })}
        />
        {errors.new_password_confirm && (
          <p className="text-sm text-red-600 mt-1">{errors.new_password_confirm}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Change Password
      </Button>
    </form>
  );
};

// Example 3: Async version with custom handling
const AsyncPasswordChange = () => {
  const { changePasswordAsync } = useChangePassword({ showToast: false });

  const handleChange = async (passwords: ChangePasswordPayload) => {
    try {
      const result = await changePasswordAsync(passwords);
      
      // Custom success handling
      toast.success(result.message);
      
      // Redirect or do something else
      navigate('/profile');
    } catch (error) {
      // Custom error handling
      if (error instanceof Error) {
        if (error.message.includes('incorrect')) {
          toast.error('Current password is incorrect');
        } else {
          toast.error(error.message);
        }
      }
    }
  };

  return <form>{/* ... *\/}</form>;
};

// Example 4: With password strength indicator
const PasswordChangeWithStrength = () => {
  const { changePassword, isLoading } = useChangePassword();
  
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const getPasswordStrength = (password: string) => {
    if (password.length < 8) return { strength: 'weak', color: 'red' };
    if (password.length < 12) return { strength: 'medium', color: 'yellow' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 'medium', color: 'yellow' };
    }
    return { strength: 'strong', color: 'green' };
  };

  const strength = getPasswordStrength(passwordData.new_password);

  return (
    <div className="space-y-4">
      <Input
        type="password"
        placeholder="Current Password"
        value={passwordData.old_password}
        onChange={(e) => setPasswordData({ 
          ...passwordData, 
          old_password: e.target.value 
        })}
      />
      
      <div>
        <Input
          type="password"
          placeholder="New Password (min. 8 characters)"
          value={passwordData.new_password}
          onChange={(e) => setPasswordData({ 
            ...passwordData, 
            new_password: e.target.value 
          })}
        />
        {passwordData.new_password && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${strength.color}-500 transition-all`}
                  style={{ 
                    width: strength.strength === 'weak' ? '33%' : 
                           strength.strength === 'medium' ? '66%' : '100%' 
                  }}
                />
              </div>
              <span className="text-sm capitalize">{strength.strength}</span>
            </div>
          </div>
        )}
      </div>

      <Input
        type="password"
        placeholder="Confirm New Password"
        value={passwordData.new_password_confirm}
        onChange={(e) => setPasswordData({ 
          ...passwordData, 
          new_password_confirm: e.target.value 
        })}
      />

      <Button 
        onClick={() => changePassword(passwordData)} 
        disabled={isLoading || !passwordData.old_password || 
                  passwordData.new_password !== passwordData.new_password_confirm}
      >
        {isLoading ? 'Changing...' : 'Change Password'}
      </Button>
    </div>
  );
};
*/

// ============================================
// INTEGRATION IN AccountSettings.tsx
// ============================================

/*
// Update your AccountSettings component:

import { useChangePassword } from '@/hooks/useChangePassword';

export function AccountSettings() {
  const { changePassword, isLoading: isChangingPassword } = useChangePassword({
    onSuccess: () => {
      // Clear form on success
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    },
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const handleChangePassword = () => {
    changePassword(passwordData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password & Security</CardTitle>
        <CardDescription>Manage your password and security settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="old_password">Current Password</Label>
          <Input
            id="old_password"
            type="password"
            value={passwordData.old_password}
            onChange={(e) => setPasswordData({ 
              ...passwordData, 
              old_password: e.target.value 
            })}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new_password">New Password</Label>
          <Input
            id="new_password"
            type="password"
            value={passwordData.new_password}
            onChange={(e) => setPasswordData({ 
              ...passwordData, 
              new_password: e.target.value 
            })}
            placeholder="Enter new password (min. 8 characters)"
            autoComplete="new-password"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm New Password</Label>
          <Input
            id="confirm_password"
            type="password"
            value={passwordData.new_password_confirm}
            onChange={(e) => setPasswordData({ 
              ...passwordData, 
              new_password_confirm: e.target.value 
            })}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
        </div>
        
        <Button 
          onClick={handleChangePassword} 
          disabled={
            isChangingPassword || 
            !passwordData.old_password || 
            !passwordData.new_password ||
            passwordData.new_password !== passwordData.new_password_confirm
          }
          variant="outline"
        >
          {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Change Password
        </Button>
      </CardContent>
    </Card>
  );
}
*/