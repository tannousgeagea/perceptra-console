import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader, MessageSquareWarning, Send, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/ui/dialog';
import { Textarea } from '@/components/ui/ui/textarea';
import { useCanReview } from '@/hooks/useCanReview';
import { useResubmitProjectImage, useReviewProjectImage } from '@/hooks/useProjectImageUpdate';
import type { ProjectImageOut } from '@/types/image';
import { cn } from '@/lib/utils';
import { isTypingTarget } from '../hotkeys';

/** One-click reasons; the reviewer can add detail after picking one. */
const QUICK_REASONS = [
  'Missing objects',
  'Wrong class',
  'Boxes not tight',
  'Should be marked empty',
  'Not empty: objects missed',
];

interface Rejection {
  reason?: string;
  rejected_by?: string;
  rejected_at?: string;
  resolved?: boolean;
}

const rejectionOf = (image: ProjectImageOut): Rejection | null => {
  const rejection = image.metadata?.rejection as Rejection | undefined;
  return image.status === 'rejected' && rejection && !rejection.resolved ? rejection : null;
};

/**
 * Reviewer action: send the image back to its annotator with a reason
 * (Shift+Enter). Offered on annotated and reviewed images to reviewers and up.
 */
export const SendBackButton = ({
  currentImage,
  projectId,
  goToNextImage,
  className,
}: {
  currentImage: ProjectImageOut;
  projectId: string;
  goToNextImage: () => void;
  className?: string;
}) => {
  const canReview = useCanReview(projectId);
  const { mutate: review, isPending } = useReviewProjectImage(projectId);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const textRef = useRef<HTMLTextAreaElement>(null);

  const eligible = canReview && (currentImage.status === 'annotated' || currentImage.status === 'reviewed');

  useEffect(() => {
    if (!eligible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || !event.shiftKey || event.repeat) return;
      if (isTypingTarget(event) || event.defaultPrevented || open) return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [eligible, open]);

  // A fresh reason for every image.
  useEffect(() => setReason(''), [currentImage.id]);

  if (!eligible) return null;

  const trimmed = reason.trim();
  const submit = () => {
    if (!trimmed || isPending) return;
    review(
      { projectImageId: Number(currentImage.id), payload: { approved: false, feedback: trimmed } },
      {
        onSuccess: () => {
          setOpen(false);
          setReason('');
          goToNextImage();
        },
      },
    );
  };

  const addQuick = (text: string) => {
    setReason((current) => (current.trim() ? `${current.trim()}; ${text}` : text));
    textRef.current?.focus();
  };

  return (
    <>
      <Button variant="ghost" className={className} onClick={() => setOpen(true)}>
        <Undo2 className="h-4 w-4" />
        <div className="space-x-2">
          <span>Send back</span>
          <kbd className="rounded border border-rose-500/30 bg-rose-500/20 px-1 text-[9px] leading-4">⇧↵</kbd>
        </div>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send back to the annotator</DialogTitle>
            <DialogDescription>
              The image moves to their “Needs fixes” list with your note. It returns to review when they resubmit it.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_REASONS.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => addQuick(text)}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-rose-500/50 hover:text-foreground"
              >
                {text}
              </button>
            ))}
          </div>

          <Textarea
            ref={textRef}
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="What needs fixing? e.g. two cars in the top-left are missing"
            rows={3}
            maxLength={1000}
          />

          <DialogFooter className="items-center gap-2 sm:justify-between">
            <span className="text-xs text-muted-foreground">⌘/Ctrl + Enter to send</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={!trimmed || isPending} className="gap-1.5 bg-rose-600 text-white hover:bg-rose-500">
                {isPending ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
                Send back
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface ReviewEntry {
  approved?: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  feedback?: string | null;
}

/**
 * Every review decision on this image, newest first: who approved it or sent
 * it back, when, and the note. Repeated problems become visible.
 */
export const ReviewHistory = ({ image }: { image: ProjectImageOut }) => {
  const history = ((image.metadata?.review_history as ReviewEntry[] | undefined) ?? []).slice().reverse();
  if (history.length === 0) return null;
  const sentBack = history.filter((h) => h.approved === false).length;

  return (
    <div className="space-y-2">
      <h3 className="mt-2 border-b border-slate-800 pb-1 text-xs uppercase tracking-wide text-slate-400">
        Review history
        {sentBack > 0 && (
          <span className="ml-2 normal-case tracking-normal text-rose-400">
            sent back {sentBack}×
          </span>
        )}
      </h3>
      <ol className="space-y-2">
        {history.map((entry, i) => (
          <li key={i} className="flex gap-2 text-xs">
            {entry.approved === false ? (
              <Undo2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            )}
            <div className="min-w-0">
              <div className="text-slate-300">
                {entry.approved === false ? 'Sent back' : 'Approved'}
                {entry.reviewed_by && <> by <span className="font-medium">{entry.reviewed_by}</span></>}
              </div>
              {entry.reviewed_at && (
                <div className="text-slate-500">{new Date(entry.reviewed_at).toLocaleString()}</div>
              )}
              {entry.feedback && (
                <div className="mt-0.5 whitespace-pre-wrap break-words text-slate-300">“{entry.feedback}”</div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

/**
 * Banner on an image a reviewer sent back: who, why, and a way to return it
 * to review once fixed. Sits in the annotator's top banner stack.
 */
export const RejectionNotice = ({
  image,
  projectId,
  onResubmitted,
  className,
}: {
  image: ProjectImageOut;
  projectId: string;
  onResubmitted: () => void;
  className?: string;
}) => {
  const { mutate: resubmit, isPending } = useResubmitProjectImage(projectId);
  const rejection = rejectionOf(image);
  if (!rejection) return null;

  const when = rejection.rejected_at ? new Date(rejection.rejected_at).toLocaleString() : null;

  return (
    <div
      role="status"
      className={cn(
        'flex max-w-2xl items-start gap-3 rounded-lg border border-rose-500/50 bg-rose-950/95 px-4 py-2.5 text-sm text-rose-50 shadow-xl backdrop-blur',
        className,
      )}
    >
      <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-rose-200/80">
          Sent back{rejection.rejected_by ? <> by <strong className="text-rose-100">{rejection.rejected_by}</strong></> : null}
          {when ? <> · {when}</> : null}
        </div>
        <div className="mt-0.5 whitespace-pre-wrap break-words">{rejection.reason || 'No reason given'}</div>
      </div>
      <Button
        size="sm"
        className="h-7 shrink-0 gap-1.5 bg-rose-500 text-white hover:bg-rose-400"
        disabled={isPending}
        onClick={() => resubmit(Number(image.id), { onSuccess: onResubmitted })}
      >
        {isPending ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        Send for review
      </Button>
    </div>
  );
};
