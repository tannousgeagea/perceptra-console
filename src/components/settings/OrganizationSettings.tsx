// components/OrganizationSettings.tsx - Updated with API integration

import { useState, useEffect } from 'react';
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Label } from '@/components/ui/ui/label';
import { Input } from '@/components/ui/ui/input';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { toast } from 'sonner';
import { Loader2, Upload, Users, FolderOpen, Image } from 'lucide-react';
import { useOrganizationDetails } from '@/hooks/useOrganizationDetails';
import { UserAvatar } from '@/components/users/UserAvatar';
import { 
  useUpdateOrganizationSettings,
  UpdateOrganizationSettingsPayload
} from '@/hooks/useOrganizationSettings';


export function OrganizationSettings() {
  const { currentOrganization } = useCurrentOrganization();
  const { data: orgDetails, isLoading, error } = useOrganizationDetails();
  const { updateSettings, isLoading: isSaving } = useUpdateOrganizationSettings();

  const role = currentOrganization?.role;
  const [saving, setSaving] = useState(false);
  
  // ✅ Match API response structure
  const [organization, setOrganization] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: null as string | null,
  });

  // ✅ Sync with fetched data
  useEffect(() => {
    if (orgDetails) {
      setOrganization({
        name: orgDetails.name,
        description: orgDetails.description || '',
        website: orgDetails.website || '',
        logo_url: orgDetails.logo_url,
      });
    }
  }, [orgDetails]);

  // const handleSave = async () => {
  //   setSaving(true);
    
  //   try {
  //     // TODO: Create useUpdateOrganization hook
  //     // await updateOrganization({
  //     //   name: organization.name,
  //     //   description: organization.description,
  //     //   website: organization.website,
  //     // });

  //     // Mock for now
  //     await new Promise(resolve => setTimeout(resolve, 500));

  //     toast({
  //       title: 'Success',
  //       description: 'Organization settings updated successfully',
  //     });
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to update organization settings',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setSaving(false);
  //   }
  // };


  const handleSave = () => {
    // Only send changed fields
    const changes: UpdateOrganizationSettingsPayload = {};
    
    if (organization.name !== orgDetails?.name) {
      changes.name = organization.name;
    }
    if (organization.description !== orgDetails?.description) {
      changes.description = organization.description;
    }
    if (organization.website !== orgDetails?.website) {
      changes.website = organization.website;
    }

    if (Object.keys(changes).length === 0) {
      toast.info('No changes to save');
      return;
    }

    updateSettings(changes);
  };

  // Permission check
  if (role !== 'owner' && role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">
          You don't have permission to view organization settings.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading organization details</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!orgDetails) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Organization Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage your organization's profile and preferences
        </p>
      </div>

      {/* ✅ Organization Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orgDetails.statistics.total_members}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FolderOpen className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orgDetails.statistics.total_projects}</p>
                <p className="text-sm text-muted-foreground">Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Image className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orgDetails.statistics.total_images}</p>
                <p className="text-sm text-muted-foreground">Images</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Organization Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>Update your organization's information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org_id">Organization ID</Label>
            <Input
              id="org_id"
              value={orgDetails.org_id}
              disabled
              className="bg-muted font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This is your unique organization identifier
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Organization Slug</Label>
            <Input
              id="slug"
              value={orgDetails.slug}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Used in URLs: /org/{orgDetails.slug}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org_name">Organization Name</Label>
            <Input
              id="org_name"
              value={organization.name}
              onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
              placeholder="Enter organization name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={organization.description}
              onChange={(e) => setOrganization({ ...organization, description: e.target.value })}
              placeholder="Brief description of your organization"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={organization.website}
              onChange={(e) => setOrganization({ ...organization, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Organization Logo</Label>
            <div className="flex items-center gap-4">
              {organization.logo_url ? (
                <img 
                  src={organization.logo_url} 
                  alt="Organization logo"
                  className="h-20 w-20 rounded-lg object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <Button variant="outline" size="sm">
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: Square image, at least 200x200px
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* ✅ Recent Members */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Members</CardTitle>
          <CardDescription>
            {orgDetails.statistics.active_members} active members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orgDetails.recent_members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar user={member} size="sm" />
                  <div>
                    <p className="font-medium">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ✅ Billing - Owner Only */}
      {role === 'owner' && (
        <Card>
          <CardHeader>
            <CardTitle>Billing & Subscription</CardTitle>
            <CardDescription>Manage your organization's plan and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Current Plan</Label>
                <p className="text-sm text-muted-foreground">
                  Your organization is on the Free plan
                </p>
              </div>
              <Badge variant="secondary">Free</Badge>
            </div>
            <Button variant="default">
              Upgrade to Enterprise
            </Button>
            <p className="text-xs text-muted-foreground">
              Get access to advanced features, unlimited storage, and priority support
            </p>
          </CardContent>
        </Card>
      )}

      {/* ✅ Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">
              {new Date(orgDetails.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">
              {new Date(orgDetails.updated_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Role</span>
            <Badge className="capitalize">{orgDetails.current_user_role}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">You Joined</span>
            <span className="font-medium">
              {new Date(orgDetails.current_user_joined_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// TODO: Missing API Endpoints
// ============================================

/*
✅ IMPLEMENTED:
- GET /api/v1/organizations/details

❌ NEEDED (Create these hooks):

1. useUpdateOrganization - Update organization details
   curl -X 'PUT' \
     'http://localhost:29085/api/v1/organizations/{org_id}' \
     -H 'Content-Type: application/json' \
     -d '{
       "name": "string",
       "description": "string",
       "website": "string"
     }'

2. useUploadOrganizationLogo - Upload logo
   curl -X 'POST' \
     'http://localhost:29085/api/v1/organizations/logo' \
     -H 'Content-Type: multipart/form-data' \
     -F 'file=@logo.png'

3. useDeleteOrganization - Delete organization (owner only)
   curl -X 'DELETE' \
     'http://localhost:29085/api/v1/organizations/{org_id}'

4. Billing/Subscription endpoints (if applicable)
   - GET /api/v1/organizations/subscription
   - POST /api/v1/organizations/upgrade
*/