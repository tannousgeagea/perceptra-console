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
import { Switch } from '@/components/ui/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';
import { Loader2 } from 'lucide-react';
import { useUpdateAPIKey } from '@/hooks/useAPIKeys';
import { useToast } from '@/hooks/use-toast';
import type { APIKey } from '@/types/api-keys';

interface EditAPIKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: APIKey | null;
}

export function EditAPIKeyModal({ open, onOpenChange, apiKey }: EditAPIKeyModalProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateAPIKey();

  const [name, setName] = useState(apiKey?.name || '');
  const [description, setDescription] = useState(apiKey?.description || '');
  const [permission, setPermission] = useState(apiKey?.permission || 'write');
  const [isActive, setIsActive] = useState(apiKey?.is_active ?? true);
  const [rateLimitMin, setRateLimitMin] = useState(apiKey?.rate_limit_per_minute || 60);
  const [rateLimitHour, setRateLimitHour] = useState(apiKey?.rate_limit_per_hour || 1000);

  // Sync state when apiKey changes
  if (apiKey && name !== apiKey.name && !updateMutation.isPending) {
    setName(apiKey.name);
    setDescription(apiKey.description || '');
    setPermission(apiKey.permission);
    setIsActive(apiKey.is_active);
    setRateLimitMin(apiKey.rate_limit_per_minute);
    setRateLimitHour(apiKey.rate_limit_per_hour);
  }

  const handleSave = async () => {
    if (!apiKey) return;
    try {
      await updateMutation.mutateAsync({
        keyId: apiKey.id,
        data: {
          name,
          description,
          permission: permission as 'read' | 'write' | 'admin',
          is_active: isActive,
          rate_limit_per_minute: rateLimitMin,
          rate_limit_per_hour: rateLimitHour,
        },
      });
      toast({ title: 'API key updated successfully' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Failed to update API key', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogDescription>
            {apiKey?.name} ({apiKey?.prefix}...)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={255} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Permission Level</Label>
            <Select value={permission} onValueChange={(v) => setPermission(v as 'read' | 'write' | 'admin')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="write">Write</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="text-sm font-medium">Active</Label>
              <p className="text-xs text-muted-foreground">Enable or disable this key</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Requests / minute</Label>
              <Input
                type="number"
                min={0}
                value={rateLimitMin}
                onChange={(e) => setRateLimitMin(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Requests / hour</Label>
              <Input
                type="number"
                min={0}
                value={rateLimitHour}
                onChange={(e) => setRateLimitHour(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            ⚠️ Cannot change: Scope, User, Expiration
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
