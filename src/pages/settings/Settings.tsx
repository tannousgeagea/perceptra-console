
import { Routes, Route, Navigate } from 'react-router-dom';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { OrganizationSettings } from '@/components/settings/OrganizationSettings';
import { StorageSettings } from '@/components/storage/StorageSettings';
import { ComputeSettings } from '@/components/compute/ComputeSettings';
import { UserManagement } from '@/components/users/UserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { SidebarProvider } from '@/components/ui/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function Settings() {
  const { isLoading: loading } = useAuth();
  const { currentOrganization } = useCurrentOrganization();

  const role = currentOrganization?.role
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="container py-8">
                <Routes>
                  <Route path="/" element={<Navigate to="/settings/account" replace />} />
                  <Route path="/account" element={<AccountSettings />} />
                  <Route 
                      path="/organization" 
                      element={
                      role === 'owner' || role === 'admin' 
                          ? <OrganizationSettings />
                          : <Navigate to="/settings/account" replace />
                      } 
                  />
                  <Route 
                      path="/storage" 
                      element={
                      role === 'owner' || role === 'admin'
                          ? <StorageSettings />
                          : <Navigate to="/settings/account" replace />
                      } 
                  />
                  <Route 
                    path="/compute" 
                    element={
                      role === 'owner' || role === 'admin'
                        ? <ComputeSettings />
                        : <Navigate to="/settings/account" replace />
                    } 
                  />
                  <Route 
                      path="/users" 
                      element={
                      role === 'owner' || role === 'admin'
                          ? <UserManagement />
                          : <Navigate to="/settings/account" replace />
                      } 
                  />
                </Routes>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
