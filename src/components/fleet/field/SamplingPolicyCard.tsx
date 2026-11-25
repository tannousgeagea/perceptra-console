// Which field images devices keep for this model. Project admins change it
// (images leave customer sites); everyone else sees it.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Switch } from '@/components/ui/ui/switch';
import { useSamplingPolicy, useSaveSamplingPolicy, useSites } from '@/hooks/useFleet';
import type { SamplingPolicy } from '@/types/fleet';
import { listNames, parseLabels } from '../format';

export function SamplingPolicyCard({ modelId, canManage }: { modelId: string; canManage: boolean }) {
  const { data: policy } = useSamplingPolicy(modelId);
  const { data: sites = [] } = useSites();
  const save = useSaveSamplingPolicy(modelId);
  const [draft, setDraft] = useState<SamplingPolicy | null>(null);
  const [classes, setClasses] = useState('');

  useEffect(() => {
    if (policy) {
      setDraft(policy);
      setClasses(policy.classes.join(', '));
    }
  }, [policy]);

  if (!draft) return null;
  const refusing = sites.filter((s) => !s.allow_images).map((s) => s.name);
  // The server keeps classes sorted; compare the same way.
  const changed = !!policy && (JSON.stringify({ ...draft, classes: parseLabels(classes).sort() }) !== JSON.stringify(policy));
  const set = (patch: Partial<SamplingPolicy>) => setDraft({ ...draft, ...patch });
  const num = (v: string, min: number, max: number) => Math.min(max, Math.max(min, Number(v) || 0));
  const disabled = !canManage || save.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>Field samples</CardTitle>
          <CardDescription>
            Frames devices send back, with what the model found in them. They land in this project as predictions to
            review, and active learning ranks them.
          </CardDescription>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm font-medium">
          <Switch checked={draft.enabled} onCheckedChange={(enabled) => set({ enabled })} disabled={disabled}
                  title={canManage ? undefined : 'Needs the admin role in this project'} />
          {draft.enabled ? 'On' : 'Off'}
        </label>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate({ ...draft, classes: parseLabels(classes) });
          }}
        >
          <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="sp-low">Keep frames with a detection below</Label>
              <Input id="sp-low" type="number" step="0.05" min={0} max={1} value={draft.low_confidence_below}
                     onChange={(e) => set({ low_confidence_below: num(e.target.value, 0, 1) })} />
              <p className="text-xs text-muted-foreground">Confidence, 0 to turn off.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sp-classes">…or with any of these classes</Label>
              <Input id="sp-classes" value={classes} onChange={(e) => setClasses(e.target.value)} placeholder="forklift, person" />
              <p className="text-xs text-muted-foreground">Separated by commas.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sp-random">Random frames per hour</Label>
              <Input id="sp-random" type="number" min={0} max={60} value={draft.random_per_hour}
                     onChange={(e) => set({ random_per_hour: num(e.target.value, 0, 60) })} />
              <p className="text-xs text-muted-foreground">An unbiased view of what the camera sees.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sp-max">At most, per device and hour</Label>
              <Input id="sp-max" type="number" min={1} max={600} value={draft.max_per_hour}
                     onChange={(e) => set({ max_per_hour: num(e.target.value, 1, 600) })} />
              <p className="text-xs text-muted-foreground">All reasons together.</p>
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {refusing.length
                ? <>No images from {listNames(refusing)}: {refusing.length === 1 ? 'that site refuses' : 'those sites refuse'} them (<Link to="/fleet" className="underline-offset-4 hover:underline">change in Fleet</Link>). They still send prediction summaries.</>
                : 'Each site can refuse images in Fleet; its devices then send only prediction summaries.'}
              {' '}Unreviewed samples are deleted after 30 days.
            </p>
            {canManage && (
              <Button type="submit" size="sm" disabled={!changed || save.isPending}>
                {save.isPending ? 'Saving…' : 'Save'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
