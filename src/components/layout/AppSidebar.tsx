import { Database, Users, Building2, User, Cpu, Key, Tags } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';

const navigationItems = [
  {
    title: 'Account',
    url: '/settings/account',
    icon: User,
    adminOnly: false,
  },
  {
    title: 'Organization',
    url: '/settings/organization',
    icon: Building2,
    adminOnly: true,
  },
  {
    // Every member can see the tags; editors can change them (the page says so).
    title: 'Tags',
    url: '/settings/tags',
    icon: Tags,
    adminOnly: false,
  },
  {
    title: 'Storage',
    url: '/settings/storage',
    icon: Database,
    adminOnly: true,
  },
  {
    title: 'Compute',
    url: '/settings/compute',
    icon: Cpu,
    adminOnly: true,
  },
  {
    title: 'Users',
    url: '/settings/users',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'API Keys',
    url: '/settings/api-keys',
    icon: Key,
    adminOnly: true,
  },
];

export function AppSidebar() {
  // "Admin" means the server's org "admin" permission (see usePermissions).
  const { currentOrganization, hasAdminPermission } = useCurrentOrganization();

  const filteredItems = navigationItems.filter(item =>
    !!currentOrganization && (!item.adminOnly || hasAdminPermission)
  );

  // Desktop: a list beside the page. Phones: a row of tabs above it that scrolls sideways.
  return (
    <nav
      aria-label="Settings"
      className="shrink-0 border-b border-border bg-card/50 md:w-56 md:border-b-0 md:border-r md:bg-transparent"
    >
      <h2 className="hidden px-5 pb-2 pt-8 text-sm font-semibold text-foreground md:block">Settings</h2>
      <ul className="flex gap-1 overflow-x-auto px-3 py-2 md:flex-col md:overflow-visible md:py-0">
        {filteredItems.map((item) => (
          <li key={item.title} className="shrink-0">
            <NavLink
              to={item.url}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
