import { Settings, Database, Users, Building2, User, Cpu, Key } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/ui/sidebar';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';

const navigationItems = [
  {
    title: 'Account',
    url: '/settings/account',
    icon: User,
    roles: ['owner', 'admin', 'editor', 'annotator', 'viewer']
  },
  {
    title: 'Organization',
    url: '/settings/organization',
    icon: Building2,
    roles: ['owner', 'admin']
  },
  {
    title: 'Storage',
    url: '/settings/storage',
    icon: Database,
    roles: ['owner', 'admin']
  },
  {
    title: 'Compute',
    url: '/settings/compute',
    icon: Cpu,
    roles: ['owner', 'admin']
  },
  {
    title: 'Users',
    url: '/settings/users',
    icon: Users,
    roles: ['owner', 'admin']
  },
  {
    title: 'API Keys',
    url: '/settings/api-keys',
    icon: Key,
    roles: ['owner', 'admin']
  },
];

export function AppSidebar() {
  const { currentOrganization } = useCurrentOrganization();

  const role = currentOrganization?.role
  const filteredItems = navigationItems.filter(item => 
    role && item.roles.includes(role)
  );

  return (
    <Sidebar className="border-r border-sidebar-border relative" collapsible="none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground font-semibold">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        isActive 
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                          : 'hover:bg-sidebar-accent/50'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
