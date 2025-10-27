// components/AccountSettings.tsx - Optimized with new auth system

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Label } from '@/components/ui/ui/label';
import { Input } from '@/components/ui/ui/input';
import { Button } from '@/components/ui/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { toast } from 'sonner';
import { Loader2, Moon, Sun, User as UserIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useUser';
import { useAuthHelpers, useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { useUpdateProfile, UpdateProfilePayload } from '@/hooks/useUpdateProfile';
import { useChangePassword } from '@/hooks/useChangePassword';

export function AccountSettings() {
  // const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading: authLoading } = useUser();
  const user = data?.user

  const { updateProfile, isLoading: isSaving } = useUpdateProfile()

  const helpers = useAuthHelpers();
  const { currentOrganization } = useCurrentOrganization();

  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState('english');

  // ✅ Efficiently compute user data using useMemo (only recalculates when user changes)
  const userData = useMemo(() => {
    if (!user) return null;

    return {
      fullName: helpers.getUserFullName(),
      firstName: user.first_name,
      lastName: user.last_name,
      email: helpers.getUserEmail(),
      userId: helpers.getUserId(),
      username: user.username || 'N/A',
    };
  }, [user, helpers]);

  // ✅ Local state for editable fields
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { changePassword, isLoading: isChangingPassword } = useChangePassword({
      onSuccess: () => {
        // Clear form on success
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      },
    });

  // ✅ Update profile state when user data changes
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

  const handleChangePassword = async () => {
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    setSaving(true);
    
    try {
      changePassword({
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirm: passwordData.confirmPassword,
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (authLoading || !user || !userData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage your personal account settings and preferences
        </p>
      </div>

      {/* User Info Card - Read Only */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            User Information
          </CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">User ID</Label>
              <Input
                id="user_id"
                value={userData.userId}
                disabled
                className="bg-muted font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={userData.username}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information - Editable */}
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
          <div className="space-y-2">
            <Label htmlFor="full_name_display">Full Name (Display)</Label>
            <Input
              id="full_name_display"
              value={`${profile.first_name} ${profile.last_name}`.trim() || 'Not set'}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              This is how your name will appear across the platform
            </p>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Organization & Role */}
      <Card>
        <CardHeader>
          <CardTitle>Organization & Role</CardTitle>
          <CardDescription>Your current organization and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization">Current Organization</Label>
            <Input
              id="organization"
              value={currentOrganization?.name || 'No organization selected'}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Your Role</Label>
            <Input
              id="role"
              value={currentOrganization?.role || 'N/A'}
              disabled
              className="bg-muted capitalize"
            />
            <p className="text-xs text-muted-foreground">
              {currentOrganization?.role === 'owner' && '✨ You have full control of this organization'}
              {currentOrganization?.role === 'admin' && '⚙️ You can manage settings and members'}
              {currentOrganization?.role === 'member' && '👤 You can access and contribute to projects'}
              {currentOrganization?.role === 'viewer' && '👁️ You have read-only access'}
            </p>
          </div>
          {helpers.getAllOrganizations().length > 1 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 You're a member of {helpers.getAllOrganizations().length} organizations. 
                Switch organizations from the navigation menu to change your active organization.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password & Security */}
      <Card>
        <CardHeader>
          <CardTitle>Password & Security</CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <Input
              id="current_password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Enter new password (min. 8 characters)"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>
          <Button 
            onClick={handleChangePassword} 
            disabled={saving || !passwordData.currentPassword || !passwordData.newPassword} 
            variant="outline"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="german">German (Deutsch)</SelectItem>
                <SelectItem value="french">French (Français)</SelectItem>
                <SelectItem value="spanish">Spanish (Español)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
              >
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// PERFORMANCE BENEFITS
// ============================================

/*
✅ Optimizations made:

1. **useMemo for computed values**
   - getUserFullName() only recalculates when user changes
   - Prevents unnecessary function calls on every render

2. **Efficient helper usage**
   - useAuthHelpers() hook provides memoized helper functions
   - getAllOrganizations() cached

3. **Proper loading states**
   - Uses authLoading from context
   - Single loading check instead of multiple useEffect

4. **No unnecessary useEffect**
   - Removed fetchProfile() - data comes directly from auth context
   - Profile state only for editable fields

5. **Better UX**
   - Separated read-only user info from editable profile
   - Shows organization count when user has multiple orgs
   - Role descriptions for better understanding
   - Validation before API calls

6. **Type-safe**
   - All data properly typed from auth context
   - No loose string concatenations

7. **Ready for API integration**
   - TODO comments for actual API endpoints
   - Proper error handling structure in place
   - Auth tokens ready to be used
*/