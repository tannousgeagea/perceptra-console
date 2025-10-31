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
import { UserPlus, Search, MoreVertical, Shield, Eye, Edit3, Crown, Loader2 } from 'lucide-react';
import { useOrganizationUsers } from '@/hooks/useOrganizationUsers';
import { UserInviteModal } from './UserInviteModal';
import { useUpdateOrganizationUser } from '@/hooks/useUpdateOrganizationUser'; // ✅ Add this
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/ui/dropdown-menu';

const roleIcons = {
  owner: Crown,
  admin: Shield,
  annotator: Edit3,
  viewer: Eye,
};

const roleColors = {
  Owner: 'bg-accent text-accent-foreground',
  Admin: 'bg-primary text-primary-foreground',
  Annotator: 'bg-secondary text-secondary-foreground',
  Viewer: 'bg-muted text-muted-foreground',
};

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { data, isLoading, error, refetch } = useOrganizationUsers();
  const { updateUser, isLoading: isUpdating } = useUpdateOrganizationUser();

  const users = data?.users || [];

  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveUser = async (userId: string) => {
    try {
      // await api.deleteUser(userId);
      // setUsers(users.filter((u) => u.id !== userId));
      toast.success('User removed from organization');
    } catch (error) {
      toast.error('Failed to remove user');
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

  const handleInviteUser = async (email: string, role: string) => {
    try {
      // TODO: Add actual API call to invite user
      // await inviteUser({ email, role });
      
      toast.success(`Invitation sent to ${email}`);
      refetch(); // ✅ Refetch to get updated list
      setInviteModalOpen(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    }
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
              Invite User
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
                    const RoleIcon = roleIcons[user.role];
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
                                  <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
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
                              <SelectItem value="Annotator">
                                <div className="flex items-center gap-2">
                                  <Edit3 className="h-4 w-4" />
                                  <span>Annotator</span>
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
              <Edit3 className="h-5 w-5 text-foreground mt-0.5" />
              <div>
                <div className="font-medium">Annotator</div>
                <div className="text-sm text-muted-foreground">
                  Can create and edit annotations on assigned datasets
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

      <UserInviteModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onInvite={handleInviteUser}
      />
    </div>
  );
}
