// A button that asks first. The dialog stays open until the action succeeds.
import { useState, type ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/ui/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/ui/alert-dialog';

interface ConfirmActionProps {
  /** The button that opens the question. */
  trigger: ReactNode;
  triggerVariant?: ButtonProps['variant'];
  triggerSize?: ButtonProps['size'];
  triggerTitle?: string;
  disabled?: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending: boolean;
  /** Call `done` once the action succeeded to close the dialog. */
  onConfirm: (done: () => void) => void;
}

export function ConfirmAction({
  trigger, triggerVariant = 'outline', triggerSize = 'sm', triggerTitle, disabled,
  title, description, confirmLabel, pendingLabel, cancelLabel = 'Cancel', destructive, pending, onConfirm,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={triggerVariant} size={triggerSize} onClick={() => setOpen(true)} disabled={disabled} title={triggerTitle}>
        {trigger}
      </Button>
      <AlertDialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">{description}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
            <Button variant={destructive ? 'destructive' : 'default'} disabled={pending} onClick={() => onConfirm(() => setOpen(false))}>
              {pending ? pendingLabel : confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
