import { useEffect, useState } from 'react';
import { Loader, RefreshCw, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/ui/tooltip';
import { PresenceStack } from '@/components/realtime/PresenceStack';
import { useAnnotationCommands } from '@/contexts/AnnotationCommandsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOthersPresence, useRealtime, useRealtimeEvent } from '@/contexts/RealtimeContext';
import { CLIENT_ID } from '@/services/apiClient';

/** Who else is on the project, and a warning when someone is on this very image. */
export const AnnotatorPresence = ({ imageUid, jobId }: { imageUid?: string; jobId?: string }) => {
  const others = useOthersPresence();
  const { presence } = useRealtime();
  const { user } = useAuth();
  const me = user?.id != null ? String(user.id) : undefined;

  const sameImage = presence.filter(
    (p) => p.view === 'annotate' && imageUid && p.image_uid === imageUid && String(p.user_id) !== me,
  );
  const names = [...new Set(sameImage.map((p) => p.name))];

  return (
    <div className="flex items-center gap-2">
      {names.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex cursor-default items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
              <Users className="h-3.5 w-3.5" />
              {names.length === 1 ? `${names[0]} is here too` : `${names.length} others here`}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">
            {names.join(', ')} {names.length === 1 ? 'has' : 'have'} this image open. Edits are saved per box,
            but you may be labeling the same objects. You will see a notice if they change it.
          </TooltipContent>
        </Tooltip>
      )}
      <PresenceStack people={others} context={{ imageUid, jobId }} ring="ring-card" />
    </div>
  );
};

/**
 * Someone else changed the image that is open (annotations, status, empty
 * flag): offer to reload it, rather than silently replacing the canvas.
 */
export const RemoteChangeNotice = ({
  projectImageId,
  onReload,
}: {
  projectImageId: number;
  onReload: () => Promise<void>;
}) => {
  const { hasUnsavedWork } = useAnnotationCommands();
  const { presence } = useRealtime();
  const [changedBy, setChangedBy] = useState<{ imageId: number; name: string } | null>(null);
  const [reloading, setReloading] = useState(false);

  // A notice belongs to the image it was raised on.
  useEffect(() => setChangedBy(null), [projectImageId]);

  useRealtimeEvent((event) => {
    if (event.origin === CLIENT_ID) return; // this tab's own save
    if (event.type !== 'annotation.changed' && event.type !== 'image.changed') return;
    const data = event.data as { project_image_id?: number };
    if (Number(data.project_image_id) !== projectImageId) return;
    const name = presence.find((p) => event.actor != null && String(p.user_id) === String(event.actor))?.name ?? 'Someone';
    setChangedBy((current) => ({
      imageId: projectImageId,
      name: current && current.imageId === projectImageId && current.name !== name ? 'Others' : name,
    }));
  });

  if (!changedBy || changedBy.imageId !== projectImageId) return null;

  const reload = async () => {
    setReloading(true);
    try {
      await onReload();
      setChangedBy(null);
    } finally {
      setReloading(false);
    }
  };

  return (
    <div
      role="status"
      className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-sky-500/40 bg-slate-950/90 px-4 py-2 text-sm text-sky-100 shadow-lg backdrop-blur"
    >
      <RefreshCw className="h-4 w-4 shrink-0 text-sky-400" />
      <span>
        <strong>{changedBy.name}</strong> changed this image
        {hasUnsavedWork && <span className="text-sky-200/70"> · reloading replaces your unsaved edits</span>}
      </span>
      <Button
        size="sm"
        variant="outline"
        className="h-7 gap-1.5 border-sky-500/40 bg-transparent text-sky-100 hover:bg-sky-500/20"
        disabled={reloading}
        onClick={() => void reload()}
      >
        {reloading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        Reload
      </Button>
      <button
        type="button"
        onClick={() => setChangedBy(null)}
        className="rounded p-0.5 text-sky-200/70 hover:bg-sky-500/20 hover:text-sky-100"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
