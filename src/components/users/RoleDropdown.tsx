
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/ui/select";
  import { Role } from "@/types/membership";
  import { RoleBadge } from "./RoleBadge";
  
  interface RoleDropdownProps {
    currentRole: Role;
    onRoleChange: (role: Role) => void;
  }
  
  export function RoleDropdown({ currentRole, onRoleChange }: RoleDropdownProps) {
    return (
      <Select defaultValue={currentRole} onValueChange={(value) => onRoleChange(value as Role)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue>
            <RoleBadge role={currentRole} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">
            <RoleBadge role="admin" />
          </SelectItem>
          <SelectItem value="editor">
            <RoleBadge role="editor" />
          </SelectItem>
          <SelectItem value="viewer">
            <RoleBadge role="viewer" />
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }