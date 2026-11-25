// The newest field samples, each with the device's detections drawn on it.
// Open one in the annotator, or pick several for a review job.
import { useState } from 'react';
import { Check, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { CreateJobDialog } from '@/components/evaluation/ActiveLearning';
import { useOpenInAnnotator } from '@/hooks/useOpenInAnnotator';
import { useFieldSamples } from '@/hooks/useFleet';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { FieldSample, SampleReason } from '@/types/fleet';
import { ago, plural } from '../format';

const ALL = 'all';
const REASON_LABEL: Record<SampleReason, string> = {
  low_confidence: 'Low confidence',
  class: 'Class of interest',
  random: 'Random',
};

function Boxes({ sample }: { sample: FieldSample }) {
  const boxes = sample.predictions.filter((p) => p.bbox_xyxyn);
  if (!boxes.length) return null;
  return (
    <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      {boxes.map((p, i) => {
        const [x1, y1, x2, y2] = p.bbox_xyxyn!;
        const low = p.confidence != null && p.confidence < 0.5;
        return (
          <rect key={i} x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill="none"
                stroke={low ? '#f59e0b' : '#a78bfa'} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        );
      })}
    </svg>
  );
}

function SampleCard({ sample, selectable, selected, onToggle, onOpen }: {
  sample: FieldSample; selectable: boolean; selected: boolean; onToggle: () => void; onOpen: () => void;
}) {
  const where = sample.site?.name ?? sample.device.name;
  const top = [...sample.predictions].sort((a, b) => (a.confidence ?? 1) - (b.confidence ?? 1))[0];
  return (
    <li className={cn('overflow-hidden rounded-lg border bg-card', selected && 'ring-2 ring-[var(--mtx-primary)]')}>
      <div className="relative bg-muted">
        <button type="button" onClick={onOpen} disabled={!sample.image_id} className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Open the sample from ${where} in the annotator`}>
          {sample.thumbnail_url ? (
            <span className="relative block">
              <img src={sample.thumbnail_url} alt="" loading="lazy" className="block h-auto w-full" />
              <Boxes sample={sample} />
            </span>
          ) : (
            <span className="flex aspect-video items-center justify-center text-muted-foreground"><ImageOff className="h-6 w-6" aria-hidden /></span>
          )}
        </button>
        {selectable && (
          <label className="absolute left-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-background/90 shadow-sm">
            <Checkbox className="rounded-[4px]" checked={selected} onCheckedChange={onToggle} aria-label="Pick for a review job" />
          </label>
        )}
        {sample.reviewed && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium shadow-sm">
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden />Reviewed
          </span>
        )}
      </div>
      <div className="space-y-0.5 px-3 py-2 text-xs">
        <p className="flex items-baseline justify-between gap-2">
          <span className="truncate font-medium text-sm">{REASON_LABEL[sample.reason]}</span>
          <span className="shrink-0 text-muted-foreground">{ago(sample.captured_at)}</span>
        </p>
        <p className="truncate text-muted-foreground">
          {where}{sample.site ? `, ${sample.device.name}` : ''}{sample.camera ? `, ${sample.camera}` : ''}
        </p>
        <p className="truncate text-muted-foreground">
          {sample.predictions.length === 0 ? 'Nothing detected'
            : `${plural(sample.predictions.length, 'detection')}${top?.confidence != null ? `; lowest ${top.class ?? '?'} ${top.confidence.toFixed(2)}` : ''}`}
        </p>
      </div>
    </li>
  );
}

export function SampleGallery({ modelId, projectId, sites, canManage }: {
  modelId: string;
  projectId: string;
  sites: { site_id: string; name: string }[];
  canManage: boolean;
}) {
  const [site, setSite] = useState(ALL);
  const [reason, setReason] = useState(ALL);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [jobOpen, setJobOpen] = useState(false);
  const orgId = useAuth().getCurrentOrganization()?.id;
  const { open } = useOpenInAnnotator(projectId);
  const { data, isLoading } = useFieldSamples(modelId, {
    site_id: site === ALL ? undefined : site,
    reason: reason === ALL ? undefined : reason,
    limit: 48,
  });
  const samples = data?.samples ?? [];

  const toggle = (id: number | null) => {
    if (id == null) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section aria-labelledby="field-samples" className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 id="field-samples" className="text-base font-semibold">
            Samples {data && <span className="ml-1 text-sm font-normal text-muted-foreground">{data.total.toLocaleString()}</span>}
          </h3>
          <p className="text-sm text-muted-foreground">Newest first. Click one to open it in the annotator; yellow boxes are below 0.5 confidence.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {sites.length > 0 && (
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger className="sm:w-44" aria-label="Site"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All places</SelectItem>
                {sites.map((s) => <SelectItem key={s.site_id} value={s.site_id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="sm:w-44" aria-label="Why it was kept"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Every reason</SelectItem>
              {(Object.keys(REASON_LABEL) as SampleReason[]).map((r) => <SelectItem key={r} value={r}>{REASON_LABEL[r]}</SelectItem>)}
            </SelectContent>
          </Select>
          {canManage && (
            <Button onClick={() => setJobOpen(true)} disabled={selected.size === 0}>
              Create review job{selected.size ? ` (${selected.size})` : ''}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-video w-full" />)}
        </div>
      ) : samples.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No samples{site !== ALL || reason !== ALL ? ' match these filters' : ' yet'}.
        </p>
      ) : (
        <ul className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {samples.map((s) => (
            <SampleCard key={s.sample_id} sample={s} selectable={canManage && !s.reviewed && s.project_image_id != null}
                        selected={s.project_image_id != null && selected.has(s.project_image_id)}
                        onToggle={() => toggle(s.project_image_id)} onOpen={() => s.image_id && open(s.image_id)} />
          ))}
        </ul>
      )}
      {data && data.total > samples.length && (
        <p className="text-xs text-muted-foreground">Showing the newest {samples.length}. Unreviewed samples are deleted after {data.retention_days} days.</p>
      )}

      {jobOpen && (
        <CreateJobDialog
          projectId={projectId}
          orgId={orgId}
          imageIds={[...selected]}
          strategyLabel="field samples"
          onClose={() => setJobOpen(false)}
          onCreated={() => { setSelected(new Set()); setJobOpen(false); }}
        />
      )}
    </section>
  );
}
