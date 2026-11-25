// Deleting a class. Unused: one click. In use: move its annotations to another
// class, or delete them with it (type the name to confirm). The dialog stays
// open until the server agrees, so a refusal is never shown as a success.
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/ui/dialog';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import type { AnnotationClass } from '@/types/classes';
import type { DeleteClassChoice } from './api';

interface Props {
  cls: AnnotationClass;
  /** The project's other classes (targets for a move). */
  others: AnnotationClass[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string, choice?: DeleteClassChoice) => Promise<void>;
}

const plural = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;

export default function DeleteClassDialog({ cls, others, open, onOpenChange, onDelete }: Props) {
  const inUse = cls.count > 0;
  const targets = others.filter((o) => o.classId != null);
  const [mode, setMode] = useState<'move' | 'delete'>(targets.length > 0 ? 'move' : 'delete');
  const [moveTo, setMoveTo] = useState<string>(targets[0] ? String(targets[0].classId) : '');
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  const ready = !inUse || (mode === 'move' ? moveTo !== '' : typed.trim() === cls.name);

  const reset = (next: boolean) => {
    if (busy) return;
    if (!next) {
      setTyped('');
      setMode(targets.length > 0 ? 'move' : 'delete');
    }
    onOpenChange(next);
  };

  const submit = async () => {
    if (!ready || busy) return;
    const choice: DeleteClassChoice | undefined = !inUse
      ? undefined
      : mode === 'move' ? { annotations: 'move', moveTo: Number(moveTo) } : { annotations: 'delete' };
    setBusy(true);
    try {
      await onDelete(String(cls.classId), choice);
      setBusy(false);
      reset(false);
    } catch {
      setBusy(false);   // the toast says why; stay open so they can pick again
    }
  };

  const target = targets.find((t) => String(t.classId) === moveTo);

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete “{cls.name}”?</DialogTitle>
          <DialogDescription>
            {inUse
              ? `${plural(cls.count, 'annotation')} ${cls.count === 1 ? 'uses' : 'use'} this class. Choose what happens to ${cls.count === 1 ? 'it' : 'them'}.`
              : 'No annotation uses this class. The other classes keep their numbers.'}
          </DialogDescription>
        </DialogHeader>

        {inUse && (
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'move' | 'delete')} className="gap-3">
            <div className="rounded-md border p-3">
              <div className="flex items-start gap-2.5">
                <RadioGroupItem value="move" id={`move-${cls.id}`} disabled={targets.length === 0} className="mt-0.5" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor={`move-${cls.id}`} className="font-medium">Move them to another class</Label>
                  <p className="text-xs text-muted-foreground">
                    {targets.length === 0
                      ? 'There is no other class to move them to.'
                      : 'Boxes stay where they are; only their label changes. Use this to merge two classes.'}
                  </p>
                  {targets.length > 0 && mode === 'move' && (
                    <Select value={moveTo} onValueChange={setMoveTo}>
                      <SelectTrigger aria-label="Class that receives the annotations" className="h-9">
                        <SelectValue placeholder="Pick a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {targets.map((t) => (
                          <SelectItem key={t.id} value={String(t.classId)}>
                            <span className="inline-flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} aria-hidden />
                              {t.name}
                              <span className="text-muted-foreground">({t.count.toLocaleString()})</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-start gap-2.5">
                <RadioGroupItem value="delete" id={`delete-${cls.id}`} className="mt-0.5" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor={`delete-${cls.id}`} className="font-medium">Delete them with the class</Label>
                  <p className="text-xs text-muted-foreground">
                    Removes {plural(cls.count, 'annotation')} from every image. Images left with none go back to unannotated.
                    This can't be undone.
                  </p>
                  {mode === 'delete' && (
                    <div className="space-y-1">
                      <Label htmlFor={`confirm-${cls.id}`} className="text-xs">Type <span className="font-mono">{cls.name}</span> to confirm</Label>
                      <Input id={`confirm-${cls.id}`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className="h-9" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </RadioGroup>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => reset(false)} disabled={busy}>Cancel</Button>
          <Button variant="destructive" onClick={submit} disabled={!ready || busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
            {!inUse ? 'Delete class'
              : mode === 'move' ? `Move to ${target?.name ?? '…'} and delete`
              : 'Delete class and annotations'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
