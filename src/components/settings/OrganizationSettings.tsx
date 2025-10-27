import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthMock';
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Label } from '@/components/ui/ui/label';
import { Input } from '@/components/ui/ui/input';
import { Button } from '@/components/ui/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Badge } from '@/components/ui/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

export function OrganizationSettings() {
//   const { organisationId, role } = useAuth();

  const { currentOrganization } = useCurrentOrganization();
  const organisationId = currentOrganization?.id;
  const role = currentOrganization?.role

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState({
    name: '',
    industry: '',
    contact_email: '',
    default_language: 'english',
  });

  useEffect(() => {
    if (organisationId) {
      fetchOrganization();
    }
  }, [organisationId]);

  const fetchOrganization = async () => {
    // Use mock data
    setOrganization({
      name: 'Mock Organization',
      industry: 'technology',
      contact_email: 'contact@mock.com',
      default_language: 'english',
    });
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: 'Success',
      description: 'Organization settings updated successfully (mock)',
    });
    
    setSaving(false);
  };

  if (role !== 'owner' && role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">You don't have permission to view organization settings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Organization Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage your organization's profile and preferences
        </p>
      </div>

      {/* Organization Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>Update your organization's information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="industry">Industry</Label>
            <Select value={organization.industry} onValueChange={(value) => setOrganization({ ...organization, industry: value })}>
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Organization Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <Button variant="outline" size="sm">
                Upload Logo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: Square image, at least 200x200px
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={organization.contact_email}
              onChange={(e) => setOrganization({ ...organization, contact_email: e.target.value })}
              placeholder="contact@organization.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_language">Default Language</Label>
            <Select value={organization.default_language} onValueChange={(value) => setOrganization({ ...organization, default_language: value })}>
              <SelectTrigger id="default_language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Billing */}
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
                <p className="text-sm text-muted-foreground">Your organization is on the Free plan</p>
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
    </div>
  );
}
