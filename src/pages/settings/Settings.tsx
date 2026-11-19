
import { Routes, Route, Navigate } from 'react-router-dom';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { OrganizationSettings } from '@/components/settings/OrganizationSettings';
import { StorageSettings } from '@/components/storage/StorageSettings';
import { ComputeSettings } from '@/components/compute/ComputeSettings';
import { UserManagement } from '@/components/users/UserManagement';
import { APIKeysManagement } from '@/components/api-keys/APIKeysManagement';
import { TagSettings } from '@/components/tags/TagSettings';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function Settings() {
  const { isLoading: loading } = useAuth();
  const { hasAdminPermission, permissionsLoading } = useCurrentOrganization();

  // Admin pages: the server's org "admin" permission. Wait for it before
  // deciding, so admins aren't bounced to Account while roles load.
  const isAdmin = hasAdminPermission;
  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    // (The theme provider lives in main.tsx; a second one here was redundant.)
        <div className="flex min-h-full w-full flex-col bg-background md:flex-row">
          <AppSidebar />
          <main className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8">
                <Routes>
                  <Route path="/" element={<Navigate to="/settings/account" replace />} />
                  <Route path="/account" element={<AccountSettings />} />
                  <Route path="/tags" element={<TagSettings />} />
                  <Route 
                      path="/organization" 
                      element={
                      isAdmin
                          ? <OrganizationSettings />
                          : <Navigate to="/settings/account" replace />
                      } 
                  />
                  <Route 
                      path="/storage" 
                      element={
                      isAdmin
                          ? <StorageSettings />
                          : <Navigate to="/settings/account" replace />
                      } 
                  />
                  <Route 
                    path="/compute" 
                    element={
                      isAdmin
                        ? <ComputeSettings />
                        : <Navigate to="/settings/account" replace />
                    } 
                  />
                  <Route 
                      path="/users" 
                      element={
                      isAdmin
                          ? <UserManagement />
                          : <Navigate to="/settings/account" replace />
                      } 
                  />
                  <Route 
                    path="/api-keys" 
                    element={
                      isAdmin
                        ? <APIKeysManagement />
                        : <Navigate to="/settings/account" replace />
                    } 
                  />
                </Routes>
            </div>
          </main>
        </div>
  );
}
