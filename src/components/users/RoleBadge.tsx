
import { Role } from '@/types/membership';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

const roleColors = {
  admin: 'bg-role-admin text-white',
  editor: 'bg-role-editor text-white',
  viewer: 'bg-role-viewer text-white'
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      roleColors[role],
      className
    )}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}