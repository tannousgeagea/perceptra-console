import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/ui/tooltip';
import { useRealtime, type PresenceEntry, type RealtimeStatus } from '@/contexts/RealtimeContext';
import { cn } from '@/lib/utils';
import { describeWhere, initials, personColor } from './presence';

export const PersonAvatar = ({
  entry,
  size = 'sm',
  ring,
  className,
}: {
  entry: Pick<PresenceEntry, 'user_id' | 'name'>;
  size?: 'xs' | 'sm';
  ring?: string;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white ring-2',
      ring ?? 'ring-background',
      size === 'xs' ? 'h-5 w-5 text-[9px]' : 'h-7 w-7 text-[11px]',
      personColor(entry.user_id),
      className,
    )}
    aria-hidden
  >
    {initials(entry.name)}
  </span>
);

const STATUS_TEXT: Record<RealtimeStatus, string> = {
  live: 'Live: changes by others appear as they happen',
  connecting: 'Connecting…',
  reconnecting: 'Connection lost, reconnecting…',
  unavailable: 'Live updates unavailable',
  off: 'Live updates off',
};

export const LiveDot = ({ status, className }: { status: RealtimeStatus; className?: string }) => (
  <span className={cn('relative inline-flex h-2 w-2', className)} title={STATUS_TEXT[status]}>
    {status === 'live' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 [animation-duration:2.5s]" />}
    <span
      className={cn(
        'relative inline-flex h-2 w-2 rounded-full',
        status === 'live' ? 'bg-emerald-500' : status === 'reconnecting' ? 'bg-amber-500' : 'bg-muted-foreground/50',
      )}
    />
  </span>
);

/**
 * Overlapping avatars of the people on the project, each with where they are;
 * a hover lists everyone.
 */
export const PresenceStack = ({
  people,
  max = 4,
  context,
  ring,
  showStatus = true,
  emptyLabel,
  className,
}: {
  people: PresenceEntry[];
  max?: number;
  context?: { imageUid?: string; jobId?: string };
  ring?: string;
  showStatus?: boolean;
  /** Shown when nobody else is here; nothing when omitted. */
  emptyLabel?: string;
  className?: string;
}) => {
  const { status } = useRealtime();
  if (status === 'off') return null;
  if (!people.length && !emptyLabel) return showStatus ? <LiveDot status={status} className={className} /> : null;

  const shown = people.slice(0, max);
  const extra = people.length - shown.length;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('flex cursor-default items-center gap-2', className)}>
          {showStatus && <LiveDot status={status} />}
          {people.length ? (
            <div className="flex -space-x-1.5">
              {shown.map((p) => (
                <PersonAvatar key={p.user_id} entry={p} ring={ring} />
              ))}
              {extra > 0 && (
                <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground ring-2', ring ?? 'ring-background')}>
                  +{extra}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">{emptyLabel}</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">
        {people.length ? (
          <ul className="space-y-1">
            {people.map((p) => (
              <li key={p.user_id} className="flex items-center gap-2">
                <PersonAvatar entry={p} size="xs" ring="ring-transparent" />
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground">{describeWhere(p, context)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span>{emptyLabel}</span>
        )}
        <div className="mt-1.5 border-t border-border pt-1.5 text-muted-foreground">{STATUS_TEXT[status]}</div>
      </TooltipContent>
    </Tooltip>
  );
};
