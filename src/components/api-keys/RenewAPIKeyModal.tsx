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
import { Calendar, Loader2 } from 'lucide-react';
import { useRenewAPIKey } from '@/hooks/useAPIKeys';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, differenceInDays } from 'date-fns';
import type { APIKey } from '@/types/api-keys';

interface RenewAPIKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: APIKey | null;
}

export function RenewAPIKeyModal({ open, onOpenChange, apiKey }: RenewAPIKeyModalProps) {
  const { toast } = useToast();
  const renewMutation = useRenewAPIKey();
  const [days, setDays] = useState(90);

  if (!apiKey) return null;

  const currentExpiry = new Date(apiKey.expires_at);
  const daysUntilExpiry = differenceInDays(currentExpiry, new Date());
  const newExpiry = addDays(currentExpiry, days);
  const newDaysUntilExpiry = differenceInDays(newExpiry, new Date());

  const handleRenew = async () => {
    try {
      await renewMutation.mutateAsync({ keyId: apiKey.id, days });
      toast({ title: 'API key renewed successfully' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Failed to renew API key', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Renew API Key Expiration
          </DialogTitle>
          <DialogDescription>
            {apiKey.name} ({apiKey.prefix}...)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-sm text-muted-foreground">Current expiration:</p>
            <p className="text-sm font-medium">
              {format(currentExpiry, 'MMMM d, yyyy')} ({daysUntilExpiry > 0 ? `${daysUntilExpiry} days from now` : 'Expired'})
            </p>
          </div>

          <div className="space-y-2">
            <Label>Extend by</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 90)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">days (1-365)</span>
            </div>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
            <p className="text-sm text-muted-foreground">New expiration will be:</p>
            <p className="text-sm font-semibold text-primary">
              {format(newExpiry, 'MMMM d, yyyy')} ({newDaysUntilExpiry} days from now)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleRenew} disabled={renewMutation.isPending}>
            {renewMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Renew Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
