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
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useRevokeAPIKey } from '@/hooks/useAPIKeys';
import { useToast } from '@/hooks/use-toast';
import type { APIKey } from '@/types/api-keys';

interface RevokeAPIKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: APIKey | null;
}

export function RevokeAPIKeyModal({ open, onOpenChange, apiKey }: RevokeAPIKeyModalProps) {
  const { toast } = useToast();
  const revokeMutation = useRevokeAPIKey();

  const handleRevoke = async () => {
    if (!apiKey) return;
    try {
      await revokeMutation.mutateAsync(apiKey.id);
      toast({ title: 'API key revoked successfully' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Failed to revoke API key', variant: 'destructive' });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Revoke API Key?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span className="block">
              You are about to revoke: <strong>{apiKey?.name}</strong> ({apiKey?.prefix}...)
            </span>
            <span className="block">This will immediately:</span>
            <ul className="list-disc pl-5 space-y-1">
              <li>Stop all requests using this key</li>
              <li>Cannot be undone</li>
              <li>Key cannot be reactivated</li>
            </ul>
            <span className="block text-destructive font-medium">
              Active integrations using this key will fail. Update them with a new key first.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={revokeMutation.isPending}
          >
            {revokeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Yes, Revoke Key
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
