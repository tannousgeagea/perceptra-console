// Add a device: name it, place it, then hand its one-time code to the agent.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/ui/dialog';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { useAddDevice, useSites } from '@/hooks/useFleet';
import type { Device, Enrollment } from '@/types/fleet';
import { EnrollmentCode } from './EnrollmentCode';
import { parseLabels } from './format';

const NO_SITE = 'none';

export function AddDeviceDialog({ open, onOpenChange, defaultSiteId }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSiteId?: string;
}) {
  const { data: sites = [] } = useSites();
  const add = useAddDevice();
  const [name, setName] = useState('');
  const [siteId, setSiteId] = useState(defaultSiteId ?? NO_SITE);
  const [labels, setLabels] = useState('');
  const [created, setCreated] = useState<{ device: Device; enrollment: Enrollment } | null>(null);

  const reset = () => {
    setName('');
    setSiteId(defaultSiteId ?? NO_SITE);
    setLabels('');
    setCreated(null);
    add.reset();
  };

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    add.mutate(
      { name: name.trim(), site_id: siteId === NO_SITE ? null : siteId, labels: parseLabels(labels) },
      { onSuccess: setCreated },
    );
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>{created.device.name} is added</DialogTitle>
              <DialogDescription>Start the agent on the device with this code. It shows as online after its first heartbeat.</DialogDescription>
            </DialogHeader>
            <EnrollmentCode enrollment={created.enrollment} deviceName={created.device.name} />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" asChild>
                <Link to={`/fleet/devices/${created.device.device_id}`} onClick={() => close(false)}>Open device</Link>
              </Button>
              <Button onClick={() => close(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Add a device</DialogTitle>
              <DialogDescription>
                A device is a machine at the edge that runs your models: a camera box, an industrial PC, a Jetson.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="device-name">Name</Label>
              <Input id="device-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Line 2 – gate camera" maxLength={120} autoFocus required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device-site">Site</Label>
              <Select value={siteId} onValueChange={setSiteId}>
                <SelectTrigger id="device-site"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SITE}>No site</SelectItem>
                  {sites.map((s) => <SelectItem key={s.site_id} value={s.site_id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {sites.length === 0 && <p className="text-xs text-muted-foreground">Sites group devices by place; add them from the Fleet page.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="device-labels">Labels</Label>
              <Input id="device-labels" value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="line-2, jetson" />
              <p className="text-xs text-muted-foreground">Separated by commas. A rollout can target every device with a label.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => close(false)}>Cancel</Button>
              <Button type="submit" disabled={!name.trim() || add.isPending}>{add.isPending ? 'Adding…' : 'Add device'}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
