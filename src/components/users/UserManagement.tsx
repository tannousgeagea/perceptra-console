import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Badge } from '@/components/ui/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';
import { UserRole } from '@/types/auth';
import { UserPlus, Search, MoreVertical, Shield, Eye, Pencil, Crown, Loader2 } from 'lucide-react';
import { useOrganizationUsers } from '@/hooks/useOrganizationUsers';
import { InviteMemberDialog } from '@/components/invitations/InviteMemberDialog';
import { PendingInvitations } from '@/components/invitations/PendingInvitations';
import { useUpdateOrganizationUser } from '@/hooks/useUpdateOrganizationUser';
import { useRemoveMember } from '@/hooks/useOrganization';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/ui/dropdown-menu';


type RoleConfig = {
  icon: React.ElementType;
  label: string;
  color: string;
};

const ROLE_CONFIG: Record<string, RoleConfig> = {
  owner: {
    icon: Crown,
    label: 'Owner',
    color: 'bg-accent text-accent-foreground',
  },
  admin: {
    icon: Shield,
    label: 'Admin',
    color: 'bg-primary text-primary-foreground',
  },
  editor: {
    icon: Pencil,
    label: 'Editor',
    color: 'bg-secondary text-secondary-foreground',
  },
  viewer: {
    icon: Eye,
    label: 'Viewer',
    color: 'bg-muted text-muted-foreground',
  },
};

const getRoleConfig = (role?: string): RoleConfig => {
  if (!role) {
    return {
      icon: Eye,
      label: 'Unknown',
      color: 'bg-muted text-muted-foreground',
    };
  }

  const normalized = role.toLowerCase();

  return (
    ROLE_CONFIG[normalized] || {
      icon: Eye,
      label: role, // preserve original
      color: 'bg-muted text-muted-foreground',
    }
  );
};


export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { data, isLoading, error, refetch } = useOrganizationUsers();
  const { updateUser, isLoading: isUpdating } = useUpdateOrganizationUser();
  const { currentOrganization } = useCurrentOrganization();
  const removeMember = useRemoveMember(currentOrganization?.id);

  const users = data?.users || [];

  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    const who = user ? user.email : 'this user';
    if (!window.confirm(`Remove ${who} from the organization? They lose access to its projects.`)) return;
    try {
      await removeMember.mutateAsync(userId);
      toast.success(`${who} removed from the organization`);
      refetch();
    } catch (error) {
      toast.error('Failed to remove user', {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const handleDeactivateUser = (userId: string) => {
    updateUser({ userId, payload: { status: 'inactive' } });
  };

  const handleActivateUser = (userId: string) => {
    updateUser({ userId, payload: { status: 'active' } });
  };


  const handleRoleChange = (userId: string, newRole: string) => {
    updateUser({ 
      userId, 
      payload: { role: newRole.toLowerCase() } // API expects lowercase
    });
  };

  // ✅ Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // ✅ Handle error state
  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading users: {error.message}
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground mt-2">
          Manage user access and permissions for your organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {data?.total} {data?.total === 1 ? 'user' : 'users'} in your organization
              </CardDescription>
            </div>
            <Button onClick={() => setInviteModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite people
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const roleConfig = getRoleConfig(user.role);
                    const RoleIcon = roleConfig.icon;

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(role) => handleRoleChange(user.id, role as UserRole)}
                            disabled={user.role.toLowerCase() === 'owner' || isUpdating}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <RoleIcon className="h-4 w-4" />
                                  <span>{roleConfig.label}</span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  <span>Admin</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Editor">
                                <div className="flex items-center gap-2">
                                  <Pencil className="h-4 w-4" />
                                  <span>Editor</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Viewer">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  <span>Viewer</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className={
                              user.status === 'pending' ? 'bg-warning text-warning-foreground' : ''
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.last_active
                            ? new Date(user.last_active).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          {user.role.toLowerCase() !== 'owner' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {user.status === 'active' ? (
                                  <DropdownMenuItem 
                                    onClick={() => handleDeactivateUser(user.id)}
                                  >
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => handleActivateUser(user.id)}
                                  >
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleRemoveUser(user.id)}
                                  className="text-destructive"
                                >
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <PendingInvitations orgId={currentOrganization?.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <div className="font-medium">Owner</div>
                <div className="text-sm text-muted-foreground">
                  Full access to all features including billing and organization deletion
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium">Admin</div>
                <div className="text-sm text-muted-foreground">
                  Can manage users, storage, and all datasets
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Pencil className="h-5 w-5 text-foreground mt-0.5" />
              <div>
                <div className="font-medium">Editor</div>
                <div className="text-sm text-muted-foreground">
                  Can annotate, review and build datasets in their projects
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Viewer</div>
                <div className="text-sm text-muted-foreground">
                  Read-only access to assigned datasets
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <InviteMemberDialog
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        orgId={currentOrganization?.id}
        orgName={currentOrganization?.name ?? 'your organization'}
      />
    </div>
  );
}
