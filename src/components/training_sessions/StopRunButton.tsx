// "Stop run": ends a training run after a confirmation (POST /training-sessions/{id}/cancel).
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Square } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/services/apiClient';
import { Button } from '@/components/ui/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/ui/alert-dialog';
import type { TrainingSession } from '@/types/training_session';

interface CancelResponse {
  status: string;
  compute_stopped: boolean | null;
  stops: 'now' | 'after_epoch';
  detail: string;
}

export default function StopRunButton({ session, prominent }: { session: TrainingSession; prominent?: boolean }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const label = `${session.modelName} ${session.modelVersionName}`;
  const where = session.currentEpoch > 0
    ? ` at epoch ${session.currentEpoch}${session.totalEpochs ? ` of ${session.totalEpochs}` : ''}`
    : '';

  const stop = useMutation({
    mutationFn: async (): Promise<CancelResponse> => {
      const res = await apiFetch(`/api/v1/training-sessions/${session.id}/cancel`, { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof body.detail === 'string' ? body.detail : `Request failed (${res.status})`);
      return body;
    },
    onSuccess: (r) => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['training-session', session.id] });
      queryClient.invalidateQueries({ queryKey: ['project-overview'] });
      if (r.compute_stopped === false) {
        toast.warning(`Stopped ${label}, but the compute didn't confirm`, { description: r.detail });
      } else if (r.stops === 'after_epoch') {
        toast.success(`Stopped ${label}`, { description: 'The agent finishes its current epoch, then stops.' });
      } else {
        toast.success(`Stopped ${label}`);
      }
    },
    onError: (e: Error) => toast.error(`Couldn't stop ${label}`, { description: e.message }),
  });

  return (
    <>
      <Button
        size="sm"
        variant={prominent ? 'destructive' : 'outline'}
        onClick={() => setOpen(true)}
        className="shrink-0"
      >
        <Square className="mr-2 h-3.5 w-3.5" fill="currentColor" aria-hidden />
        Stop run
      </Button>
      <AlertDialog open={open} onOpenChange={(o) => !stop.isPending && setOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop {label}{where}?</AlertDialogTitle>
            <AlertDialogDescription>
              Training ends and nothing from this run is kept: no weights, and {session.modelVersionName} is marked
              cancelled. The epochs so far stay visible here. A run on a compute agent finishes its current epoch first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={stop.isPending}>Keep training</AlertDialogCancel>
            {/* A plain button, not AlertDialogAction: the dialog stays open until the stop succeeds. */}
            <Button variant="destructive" onClick={() => stop.mutate()} disabled={stop.isPending}>
              {stop.isPending ? 'Stopping…' : 'Stop run'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
