import { Badge } from '@/components/ui/ui/badge';
import { Button } from '@/components/ui/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/ui/dropdown-menu';
import { Eye, Edit2, RefreshCw, Trash2, MoreHorizontal, Clock, Key } from 'lucide-react';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import type { APIKey } from '@/types/api-keys';

interface APIKeyCardProps {
  apiKey: APIKey;
  onView: () => void;
  onEdit: () => void;
  onRevoke: () => void;
  onRenew: () => void;
  onDelete: () => void;
}

function getPermissionColor(permission: string) {
  switch (permission) {
    case 'read': return 'bg-primary/10 text-primary border-primary/20';
    case 'write': return 'bg-accent/10 text-accent border-accent/20';
    case 'admin': return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return '';
  }
}

function getScopeColor(scope: string) {
  return scope === 'organization'
    ? 'bg-success/10 text-success border-success/20'
    : 'bg-primary/10 text-primary border-primary/20';
}

export function APIKeyCard({ apiKey, onView, onEdit, onRevoke, onRenew, onDelete }: APIKeyCardProps) {
  const daysUntilExpiry = differenceInDays(new Date(apiKey.expires_at), new Date());
  const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry < 7;
  const isExpired = daysUntilExpiry <= 0;

  const statusDot = !apiKey.is_active || isExpired
    ? 'bg-destructive'
    : isExpiringSoon
    ? 'bg-warning'
    : 'bg-success';

  return (
    <div className="group rounded-lg border bg-card p-4 hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Info */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusDot}`} />
            <h3 className="font-semibold text-sm truncate">{apiKey.name}</h3>
            <code className="text-xs text-muted-foreground font-mono">({apiKey.prefix}...)</code>
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] ${getScopeColor(apiKey.scope)}`}>
              {apiKey.scope === 'organization' ? 'Organization-wide' : `User: ${apiKey.user_username}`}
            </Badge>
            <Badge variant="outline" className={`text-[10px] capitalize ${getPermissionColor(apiKey.permission)}`}>
              {apiKey.permission}
            </Badge>
            {!apiKey.is_active && <Badge variant="destructive" className="text-[10px]">Revoked</Badge>}
            {apiKey.is_active && isExpired && <Badge variant="destructive" className="text-[10px]">Expired</Badge>}
            {apiKey.is_active && isExpiringSoon && <Badge className="text-[10px] bg-warning text-warning-foreground">Expiring Soon</Badge>}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Key className="h-3 w-3" />
              {apiKey.usage_count.toLocaleString()} requests
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {apiKey.last_used_at
                ? `Last used ${formatDistanceToNow(new Date(apiKey.last_used_at), { addSuffix: true })}`
                : 'Never used'}
            </span>
            <span>
              {isExpired ? 'Expired' : `Expires ${format(new Date(apiKey.expires_at), 'MMM d, yyyy')}`}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" variant="ghost" onClick={onView} className="h-8 px-2">
            <Eye className="h-4 w-4" />
          </Button>
          {apiKey.is_active && (
            <>
              <Button size="sm" variant="ghost" onClick={onEdit} className="h-8 px-2">
                <Edit2 className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 px-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onRenew}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRevoke} className="text-destructive focus:text-destructive">
                    Revoke
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!apiKey.is_active && (
            <Button size="sm" variant="ghost" onClick={onDelete} className="h-8 px-2 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
