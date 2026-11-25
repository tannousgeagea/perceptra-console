// Add or edit a site: a place where devices run (a plant, a store, a line).
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
import { Switch } from '@/components/ui/ui/switch';
import { useSaveSite } from '@/hooks/useFleet';
import type { Site } from '@/types/fleet';

export function SiteDialog({ open, onOpenChange, site }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Editing this site; adding a new one when absent. */
  site?: Site | null;
}) {
  const save = useSaveSite();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [allowImages, setAllowImages] = useState(true);

  useEffect(() => {
    if (open) {
      setName(site?.name ?? '');
      setLocation(site?.location ?? '');
      setAllowImages(site?.allow_images ?? true);
    }
  }, [open, site]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    save.mutate(
      { siteId: site?.site_id, data: { name: name.trim(), location: location.trim(), allow_images: allowImages } },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{site ? `Edit ${site.name}` : 'Add a site'}</DialogTitle>
            <DialogDescription>A place where devices run. Rollouts can target every device at a site.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="site-name">Name</Label>
            <Input id="site-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hamburg plant" maxLength={120} autoFocus required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-location">Location</Label>
            <Input id="site-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional: address or area" maxLength={255} />
          </div>
          <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
            <Switch checked={allowImages} onCheckedChange={setAllowImages} className="mt-0.5" aria-describedby="site-images-hint" />
            <span>
              <span className="block font-medium">Devices here may send images</span>
              <span id="site-images-hint" className="block text-muted-foreground">
                Off for privacy: devices then send only prediction summaries (counts and confidences), so the site is
                still monitored, but no frame leaves it.
              </span>
            </span>
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || save.isPending}>{site ? 'Save site' : 'Add site'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
