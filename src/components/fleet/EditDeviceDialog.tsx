// Rename a device, move it to another site, change its labels.
import { useEffect, useState } from 'react';
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
import { useSites, useUpdateDevice } from '@/hooks/useFleet';
import type { DeviceDetail } from '@/types/fleet';
import { parseLabels } from './format';

const NO_SITE = 'none';

export function EditDeviceDialog({ device, open, onOpenChange }: {
  device: DeviceDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: sites = [] } = useSites();
  const update = useUpdateDevice(device.device_id);
  const [name, setName] = useState(device.name);
  const [siteId, setSiteId] = useState(device.site?.site_id ?? NO_SITE);
  const [labels, setLabels] = useState(device.labels.join(', '));

  useEffect(() => {
    if (open) {
      setName(device.name);
      setSiteId(device.site?.site_id ?? NO_SITE);
      setLabels(device.labels.join(', '));
    }
  }, [open, device]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    update.mutate(
      {
        name: name.trim(),
        labels: parseLabels(labels),
        ...(siteId === NO_SITE ? { clear_site: true } : { site_id: siteId }),
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Edit {device.name}</DialogTitle>
            <DialogDescription>Labels and site decide which rollouts reach this device.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-device-name">Name</Label>
            <Input id="edit-device-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-device-site">Site</Label>
            <Select value={siteId} onValueChange={setSiteId}>
              <SelectTrigger id="edit-device-site"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SITE}>No site</SelectItem>
                {sites.map((s) => <SelectItem key={s.site_id} value={s.site_id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-device-labels">Labels</Label>
            <Input id="edit-device-labels" value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="line-2, jetson" />
            <p className="text-xs text-muted-foreground">Separated by commas.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || update.isPending}>Save device</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
