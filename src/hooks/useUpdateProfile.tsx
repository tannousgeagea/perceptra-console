// hooks/useUpdateProfile.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/auth";

/**
 * Update profile payload - all fields are optional
 */
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
}

/**
 * Update current user's profile
 */
export const updateProfile = async (
  payload: UpdateProfilePayload,
  organizationId: string
): Promise<User> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${baseURL}/api/v1/auth/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'Failed to update profile' 
    }));
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
};

/**
 * Hook options
 */
export interface UseUpdateProfileOptions {
  onSuccess?: (data: User) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

/**
 * Hook to update current user's profile
 */
export const useUpdateProfile = (
  options: UseUpdateProfileOptions = {}
) => {
  const queryClient = useQueryClient();
  const { setUser } = useAuth()
  const { currentOrganization } = useCurrentOrganization();
  const { onSuccess, onError, showToast = true } = options;

  const mutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return updateProfile(payload, currentOrganization.id);
    },

    onSuccess: (data) => {
      // Update user in auth storage
      // setUser(data)
      authStorage.set(AUTH_STORAGE_KEYS.USER, JSON.stringify(data), true);

      // Invalidate queries to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['user', currentOrganization?.id] });
      queryClient.invalidateQueries({ 
        queryKey: ['organizationUsers', currentOrganization?.id] 
      });

      if (showToast) {
        toast.success('Profile updated successfully');
      }

      onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message || 'Failed to update profile');
      }

      onError?.(error);
    },
  });

  return {
    updateProfile: mutation.mutate,
    updateProfileAsync: mutation.mutateAsync,
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
// Example 1: In AccountSettings component
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { useAuth } from '@/context/AuthContext';

export function AccountSettings() {
  const { user } = useAuth();
  const { updateProfile, isLoading } = useUpdateProfile();
  
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  const handleSaveProfile = () => {
    updateProfile({
      first_name: profile.first_name,
      last_name: profile.last_name,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
      <Input
        value={profile.first_name}
        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
        placeholder="First Name"
      />
      <Input
        value={profile.last_name}
        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
        placeholder="Last Name"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}

// Example 2: Update only first name
const UpdateFirstName = () => {
  const { updateProfile, isLoading } = useUpdateProfile();
  const [firstName, setFirstName] = useState('');

  const handleSubmit = () => {
    updateProfile({ first_name: firstName });
  };

  return (
    <div>
      <Input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
      />
      <Button onClick={handleSubmit} disabled={isLoading}>
        Update
      </Button>
    </div>
  );
};

// Example 3: With custom callbacks
const ProfileForm = () => {
  const { updateProfile, isLoading } = useUpdateProfile({
    onSuccess: (updatedUser) => {
      console.log('Profile updated:', updatedUser);
      // Redirect or show modal
    },
    onError: (error) => {
      console.error('Update failed:', error);
      // Show custom error UI
    },
  });

  const handleSubmit = (data: UpdateProfilePayload) => {
    updateProfile(data);
  };

  return <form>{/* ... *\/}</form>;
};

// Example 4: Async version with validation
const ProfileFormAsync = () => {
  const { updateProfileAsync, isLoading } = useUpdateProfile({ 
    showToast: false 
  });

  const handleSubmit = async (data: UpdateProfilePayload) => {
    // Validate first
    if (!data.first_name || data.first_name.length < 2) {
      toast.error('First name must be at least 2 characters');
      return;
    }

    try {
      const updatedUser = await updateProfileAsync(data);
      toast.success(`Welcome, ${updatedUser.first_name}!`);
      // Do something else
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return <form>{/* ... *\/}</form>;
};

// Example 5: Update email (if allowed)
const UpdateEmail = () => {
  const { updateProfile, isLoading } = useUpdateProfile();
  const [email, setEmail] = useState('');

  const handleUpdateEmail = () => {
    if (!email.includes('@')) {
      toast.error('Invalid email address');
      return;
    }

    updateProfile({ email });
  };

  return (
    <div>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="New Email"
      />
      <Button onClick={handleUpdateEmail} disabled={isLoading}>
        Update Email
      </Button>
    </div>
  );
};

// Example 6: Full profile form with all fields
const CompleteProfileForm = () => {
  const { user } = useAuth();
  const { updateProfile, isLoading } = useUpdateProfile();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  const handleChange = (field: keyof UpdateProfilePayload) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only send changed fields
    const changes: UpdateProfilePayload = {};
    if (formData.first_name !== user?.first_name) {
      changes.first_name = formData.first_name;
    }
    if (formData.last_name !== user?.last_name) {
      changes.last_name = formData.last_name;
    }
    if (formData.email !== user?.email) {
      changes.email = formData.email;
    }

    if (Object.keys(changes).length === 0) {
      toast.info('No changes to save');
      return;
    }

    updateProfile(changes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>First Name</Label>
        <Input
          value={formData.first_name}
          onChange={handleChange('first_name')}
          placeholder="First Name"
        />
      </div>
      <div>
        <Label>Last Name</Label>
        <Input
          value={formData.last_name}
          onChange={handleChange('last_name')}
          placeholder="Last Name"
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder="Email"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
};
*/

// ============================================
// INTEGRATION IN AccountSettings.tsx
// ============================================

/*
// Update your AccountSettings component:

import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { useAuth } from '@/context/AuthContext';

export function AccountSettings() {
  const { user } = useAuth();
  const { updateProfile, isLoading: isSaving } = useUpdateProfile();

  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  // Sync with user changes
  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name,
        last_name: user.last_name,
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    // Only update if there are changes
    const changes: UpdateProfilePayload = {};
    
    if (profile.first_name !== user?.first_name) {
      changes.first_name = profile.first_name;
    }
    if (profile.last_name !== user?.last_name) {
      changes.last_name = profile.last_name;
    }

    if (Object.keys(changes).length === 0) {
      toast.info('No changes to save');
      return;
    }

    updateProfile(changes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              placeholder="Enter your first name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              placeholder="Enter your last name"
            />
          </div>
        </div>
        
        <Button onClick={handleSaveProfile} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
*/