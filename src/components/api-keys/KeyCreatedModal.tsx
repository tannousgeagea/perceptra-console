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
import { Badge } from '@/components/ui/ui/badge';
import { Copy, Check, Download, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CreateAPIKeyResponse } from '@/types/api-keys';
import { format } from 'date-fns';

interface KeyCreatedModalProps {
  open: boolean;
  response: CreateAPIKeyResponse | null;
  onConfirm: () => void;
}

export function KeyCreatedModal({ open, response, onConfirm }: KeyCreatedModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!response) return null;

  const { api_key, key_info } = response;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(api_key);
    setCopied(true);
    toast({ title: 'API key copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadEnv = () => {
    const content = `# API Key: ${key_info.name}\nVISION_API_KEY=${api_key}\nVISION_BASE_URL=https://api.yourplatform.com\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${key_info.name.replace(/\s+/g, '_').toLowerCase()}.env`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '.env file downloaded' });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-success">
            <Check className="h-5 w-5" />
            API Key Created Successfully
          </DialogTitle>
          <DialogDescription className="sr-only">Your new API key has been created. Save it now.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Warning */}
          <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Save this key now!</p>
              <p className="text-xs text-muted-foreground">It will never be shown again.</p>
            </div>
          </div>

          {/* Key display */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Your API Key:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border bg-muted px-3 py-2.5 text-sm font-mono break-all">
                {api_key}
              </code>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownloadEnv}>
                <Download className="h-4 w-4" />
                Download as .env
              </Button>
            </div>
          </div>

          {/* Key Details */}
          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">Key Details:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{key_info.name}</span>
              <span className="text-muted-foreground">Scope</span>
              <span className="capitalize">{key_info.scope === 'organization' ? 'Organization-wide' : `User: ${key_info.user_username}`}</span>
              <span className="text-muted-foreground">Permission</span>
              <Badge variant="outline" className="w-fit capitalize">{key_info.permission}</Badge>
              <span className="text-muted-foreground">Expires</span>
              <span>{format(new Date(key_info.expires_at), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {/* Usage examples */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Usage Example:</p>
            <pre className="rounded-md border bg-muted p-3 text-xs font-mono overflow-x-auto">
{`curl -H "X-API-Key: ${api_key.slice(0, 16)}..." \\
  https://api.platform.com/projects`}
            </pre>
            <pre className="rounded-md border bg-muted p-3 text-xs font-mono overflow-x-auto">
{`from vision_sdk import VisionClient
client = VisionClient(
  api_key="${api_key.slice(0, 16)}..."
)`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onConfirm} className="w-full">I've Saved My Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
