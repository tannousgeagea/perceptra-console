import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/ui/dialog';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Textarea } from '@/components/ui/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/ui/radio-group';
import { Info, Loader2 } from 'lucide-react';
import { useCreateAPIKey } from '@/hooks/useAPIKeys';
import { useToast } from '@/hooks/use-toast';
import type { CreateAPIKeyRequest, CreateAPIKeyResponse } from '@/types/api-keys';

interface CreateAPIKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyCreated: (response: CreateAPIKeyResponse) => void;
}

export function CreateAPIKeyModal({ open, onOpenChange, onKeyCreated }: CreateAPIKeyModalProps) {
  const { toast } = useToast();
  const createMutation = useCreateAPIKey();

  const [form, setForm] = useState<CreateAPIKeyRequest>({
    name: '',
    description: '',
    scope: 'organization',
    permission: 'write',
    expires_in_days: 90,
    rate_limit_per_minute: 60,
    rate_limit_per_hour: 1000,
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    if (form.expires_in_days < 1 || form.expires_in_days > 365) {
      toast({ title: 'Expiration must be 1-365 days', variant: 'destructive' });
      return;
    }
    try {
      const response = await createMutation.mutateAsync(form);
      onKeyCreated(response);
      setForm({
        name: '',
        description: '',
        scope: 'organization',
        permission: 'write',
        expires_in_days: 90,
        rate_limit_per_minute: 60,
        rate_limit_per_hour: 1000,
      });
    } catch {
      toast({ title: 'Failed to create API key', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>Generate a new API key for programmatic access.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Basic Information</h4>
            <div className="space-y-2">
              <Label htmlFor="key-name">Name *</Label>
              <Input
                id="key-name"
                placeholder="Production SDK Key"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-desc">Description (optional)</Label>
              <Textarea
                id="key-desc"
                placeholder="Used for production environment"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={500}
                rows={2}
              />
            </div>
          </div>

          {/* Scope & Permissions */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Scope & Permissions</h4>
            <div className="space-y-3">
              <Label>Scope *</Label>
              <RadioGroup
                value={form.scope}
                onValueChange={(v) => setForm({ ...form, scope: v as 'organization' | 'user' })}
                className="space-y-2"
              >
                <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="organization" id="scope-org" className="mt-0.5" />
                  <div>
                    <Label htmlFor="scope-org" className="font-medium cursor-pointer">Organization-wide</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Key works for entire organization (recommended)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="user" id="scope-user" className="mt-0.5" />
                  <div>
                    <Label htmlFor="scope-user" className="font-medium cursor-pointer">User-specific</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Key tied to a specific user</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Permission Level *</Label>
              <Select
                value={form.permission}
                onValueChange={(v) => setForm({ ...form, permission: v as 'read' | 'write' | 'admin' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="write">Write</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-1 mt-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> <strong>Read:</strong> View data only (GET requests)
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> <strong>Write:</strong> Read + Create/Update data
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> <strong>Admin:</strong> Full access including delete
                </p>
              </div>
            </div>
          </div>

          {/* Expiration & Rate Limits */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Expiration & Rate Limits</h4>
            <div className="space-y-2">
              <Label>Expires in (days)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={form.expires_in_days}
                  onChange={(e) => setForm({ ...form, expires_in_days: parseInt(e.target.value) || 90 })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">days (1-365)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Requests / minute</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.rate_limit_per_minute}
                  onChange={(e) => setForm({ ...form, rate_limit_per_minute: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Requests / hour</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.rate_limit_per_hour}
                  onChange={(e) => setForm({ ...form, rate_limit_per_hour: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <p className="text-xs text-warning flex items-center gap-1.5">
              ⚠️ Set to 0 for unlimited (not recommended)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
