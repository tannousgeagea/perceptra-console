import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/ui/dialog';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Progress } from '@/components/ui/ui/progress';
import { Edit2, RefreshCw, AlertTriangle, Clock, BarChart3, Check, X } from 'lucide-react';
import { useAPIKeyUsage } from '@/hooks/useAPIKeys';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import type { APIKey } from '@/types/api-keys';

interface KeyDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: APIKey | null;
  onEdit: () => void;
  onRenew: () => void;
  onRevoke: () => void;
}

function getPermissionColor(permission: string) {
  switch (permission) {
    case 'read': return 'bg-primary/10 text-primary border-primary/20';
    case 'write': return 'bg-accent/10 text-accent border-accent/20';
    case 'admin': return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return '';
  }
}

function getStatusBadge(apiKey: APIKey) {
  const daysUntilExpiry = differenceInDays(new Date(apiKey.expires_at), new Date());
  if (!apiKey.is_active) return <Badge variant="destructive">Revoked</Badge>;
  if (daysUntilExpiry < 0) return <Badge variant="destructive">Expired</Badge>;
  if (daysUntilExpiry < 7) return <Badge className="bg-warning text-warning-foreground">Expiring Soon</Badge>;
  return <Badge className="bg-success text-success-foreground">Active</Badge>;
}

function getStatusCodeIcon(code: number) {
  if (code >= 200 && code < 300) return <Check className="h-3.5 w-3.5 text-success" />;
  if (code >= 400 && code < 500) return <AlertTriangle className="h-3.5 w-3.5 text-warning" />;
  return <X className="h-3.5 w-3.5 text-destructive" />;
}

export function KeyDetailsModal({ open, onOpenChange, apiKey, onEdit, onRenew, onRevoke }: KeyDetailsModalProps) {
  const { data: usage, isLoading: usageLoading } = useAPIKeyUsage(apiKey?.id ?? null, 7);

  if (!apiKey) return null;

  const daysUntilExpiry = differenceInDays(new Date(apiKey.expires_at), new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            API Key Details
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {apiKey.name} ({apiKey.prefix}...)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Overview */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overview</h4>
            <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <span className="text-muted-foreground">Status</span>
              <div>{getStatusBadge(apiKey)}</div>
              <span className="text-muted-foreground">Scope</span>
              <span>{apiKey.scope === 'organization' ? 'Organization-wide' : `User: ${apiKey.user_username}`}</span>
              <span className="text-muted-foreground">Permission</span>
              <Badge variant="outline" className={`w-fit capitalize ${getPermissionColor(apiKey.permission)}`}>
                {apiKey.permission}
              </Badge>
              <span className="text-muted-foreground">Created by</span>
              <span>{apiKey.created_by_username}</span>
              <span className="text-muted-foreground">Created</span>
              <span>{format(new Date(apiKey.created_at), 'MMM d, yyyy')}</span>
              <span className="text-muted-foreground">Last used</span>
              <span>{apiKey.last_used_at ? formatDistanceToNow(new Date(apiKey.last_used_at), { addSuffix: true }) : 'Never'}</span>
              <span className="text-muted-foreground">Expires</span>
              <span className={daysUntilExpiry < 7 ? 'text-warning font-medium' : ''}>
                {format(new Date(apiKey.expires_at), 'MMM d, yyyy')} ({daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'})
              </span>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage Statistics (Last 7 Days)
            </h4>

            {usageLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : usage ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{usage.total_requests.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Requests</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{usage.avg_response_time_ms?.toFixed(0) ?? '—'}ms</p>
                    <p className="text-xs text-muted-foreground">Avg Response Time</p>
                  </div>
                </div>

                {/* Rate limits */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Rate Limit (per minute)</span>
                      <span>{apiKey.rate_limit_per_minute}/min</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Rate Limit (per hour)</span>
                      <span>{apiKey.rate_limit_per_hour}/hr</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </div>

                {/* Top endpoints */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Top Endpoints:</p>
                  <div className="space-y-1.5">
                    {usage.top_endpoints.map((ep, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-mono text-xs">
                          <Badge variant="outline" className="mr-1.5 text-[10px] px-1 py-0">{ep.method}</Badge>
                          {ep.endpoint}
                        </span>
                        <span className="text-muted-foreground">{ep.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status codes */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Status Codes:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {usage.by_status_code.map((sc) => (
                      <div key={sc.status_code} className="flex items-center gap-1.5 text-sm">
                        {getStatusCodeIcon(sc.status_code)}
                        <span>{sc.status_code}</span>
                        <span className="text-muted-foreground">({sc.count.toLocaleString()})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Actions */}
        {apiKey.is_active && (
          <div className="flex gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit2 className="h-4 w-4" /> Edit
            </Button>
            <Button size="sm" variant="outline" onClick={onRenew}>
              <RefreshCw className="h-4 w-4" /> Renew
            </Button>
            <Button size="sm" variant="destructive" onClick={onRevoke}>
              Revoke
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
