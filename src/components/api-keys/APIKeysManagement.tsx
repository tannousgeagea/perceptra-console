import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Skeleton } from '@/components/ui/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/ui/alert-dialog';
import { Plus, Key } from 'lucide-react';
import { useAPIKeys, useDeleteAPIKey } from '@/hooks/useAPIKeys';
import { useToast } from '@/hooks/use-toast';
import { APIKeyCard } from './APIKeyCard';
import { CreateAPIKeyModal } from './CreateAPIKeyModal';
import { KeyCreatedModal } from './KeyCreatedModal';
import { EditAPIKeyModal } from './EditAPIKeyModal';
import { KeyDetailsModal } from './KeyDetailsModal';
import { RevokeAPIKeyModal } from './RevokeAPIKeyModal';
import { RenewAPIKeyModal } from './RenewAPIKeyModal';
import type { APIKey, APIKeyStatusFilter, APIKeyScopeFilter, APIKeyPermissionFilter, CreateAPIKeyResponse } from '@/types/api-keys';

export function APIKeysManagement() {
  const { toast } = useToast();
  const { data: keys, isLoading } = useAPIKeys();
  const deleteMutation = useDeleteAPIKey();

  // Filters
  const [statusFilter, setStatusFilter] = useState<APIKeyStatusFilter>('all');
  const [scopeFilter, setScopeFilter] = useState<APIKeyScopeFilter>('all');
  const [permissionFilter, setPermissionFilter] = useState<APIKeyPermissionFilter>('all');

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [createdResponse, setCreatedResponse] = useState<CreateAPIKeyResponse | null>(null);
  const [editKey, setEditKey] = useState<APIKey | null>(null);
  const [detailsKey, setDetailsKey] = useState<APIKey | null>(null);
  const [revokeKey, setRevokeKey] = useState<APIKey | null>(null);
  const [renewKey, setRenewKey] = useState<APIKey | null>(null);
  const [deleteKey, setDeleteKey] = useState<APIKey | null>(null);

  const filteredKeys = useMemo(() => {
    if (!keys) return [];
    return keys.filter((k) => {
      if (statusFilter === 'active' && !k.is_active) return false;
      if (statusFilter === 'inactive' && k.is_active) return false;
      if (scopeFilter !== 'all' && k.scope !== scopeFilter) return false;
      if (permissionFilter !== 'all' && k.permission !== permissionFilter) return false;
      return true;
    });
  }, [keys, statusFilter, scopeFilter, permissionFilter]);

  const handleDelete = async () => {
    if (!deleteKey) return;
    try {
      await deleteMutation.mutateAsync(deleteKey.id);
      toast({ title: 'API key deleted' });
      setDeleteKey(null);
    } catch {
      toast({ title: 'Failed to delete API key', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">API Keys</h2>
          <p className="text-sm text-muted-foreground">Manage programmatic access to your platform.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Key
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as APIKeyStatusFilter)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={scopeFilter} onValueChange={(v) => setScopeFilter(v as APIKeyScopeFilter)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Scope" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scopes</SelectItem>
            <SelectItem value="organization">Organization</SelectItem>
            <SelectItem value="user">User-specific</SelectItem>
          </SelectContent>
        </Select>
        <Select value={permissionFilter} onValueChange={(v) => setPermissionFilter(v as APIKeyPermissionFilter)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Permission" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Permissions</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="write">Write</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      ) : filteredKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Key className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No API Keys Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Create your first API key to enable programmatic access to your projects.
          </p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create API Key
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredKeys.map((key) => (
            <APIKeyCard
              key={key.id}
              apiKey={key}
              onView={() => setDetailsKey(key)}
              onEdit={() => setEditKey(key)}
              onRevoke={() => setRevokeKey(key)}
              onRenew={() => setRenewKey(key)}
              onDelete={() => setDeleteKey(key)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateAPIKeyModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onKeyCreated={(res) => {
          setCreateOpen(false);
          setCreatedResponse(res);
        }}
      />

      <KeyCreatedModal
        open={!!createdResponse}
        response={createdResponse}
        onConfirm={() => setCreatedResponse(null)}
      />

      <EditAPIKeyModal
        open={!!editKey}
        onOpenChange={(open) => { if (!open) setEditKey(null); }}
        apiKey={editKey}
      />

      <KeyDetailsModal
        open={!!detailsKey}
        onOpenChange={(open) => { if (!open) setDetailsKey(null); }}
        apiKey={detailsKey}
        onEdit={() => { setEditKey(detailsKey); setDetailsKey(null); }}
        onRenew={() => { setRenewKey(detailsKey); setDetailsKey(null); }}
        onRevoke={() => { setRevokeKey(detailsKey); setDetailsKey(null); }}
      />

      <RevokeAPIKeyModal
        open={!!revokeKey}
        onOpenChange={(open) => { if (!open) setRevokeKey(null); }}
        apiKey={revokeKey}
      />

      <RenewAPIKeyModal
        open={!!renewKey}
        onOpenChange={(open) => { if (!open) setRenewKey(null); }}
        apiKey={renewKey}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteKey} onOpenChange={(open) => { if (!open) setDeleteKey(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete <strong>{deleteKey?.name}</strong> ({deleteKey?.prefix}...). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
