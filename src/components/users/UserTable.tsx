
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/ui/table";
import { ProjectMember, Role } from "@/types/membership";
import { UserAvatar } from "./UserAvatar";
import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/ui/ui/button";
import { MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/ui/dropdown-menu";
import { RoleDropdown } from "./RoleDropdown";

interface UserTableProps {
  users: ProjectMember[];
  onRoleChange?: (userId: string, role: Role) => void;
  onRemoveUser?: (userId: string) => void;
  showRoleDropdown?: boolean;
  showActions?: boolean;
}

export function UserTable({ 
  users, 
  onRoleChange, 
  onRemoveUser,
  showRoleDropdown = true,
  showActions = true
}: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          {showActions && <TableHead className="w-[100px]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-4">
                <UserAvatar user={user} />
                <span>{user.username}</span>
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              {showRoleDropdown && onRoleChange ? (
                <RoleDropdown 
                  currentRole={user.role} 
                  onRoleChange={(role) => onRoleChange(user.id, role)} 
                />
              ) : (
                <RoleBadge role={user.role} />
              )}
            </TableCell>
            {showActions && (
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onRemoveUser && (
                      <DropdownMenuItem 
                        onClick={() => onRemoveUser(user.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}