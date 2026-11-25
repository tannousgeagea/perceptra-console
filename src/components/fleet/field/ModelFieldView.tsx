// A model's "Field" tab: how it does at each site (from devices' hourly
// prediction summaries), which frames devices send back, and the samples.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar } from 'lucide-react';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ui/toggle-group';
import { useModelField } from '@/hooks/useFleet';
import { FieldPlaces } from './FieldPlaces';
import { fieldSentence } from './fieldText';
import { SampleGallery } from './SampleGallery';
import { SamplingPolicyCard } from './SamplingPolicyCard';

const RANGES = [7, 14, 30];

export function ModelFieldView({ modelId, projectId, canManage }: { modelId: string; projectId: string; canManage: boolean }) {
  const [days, setDays] = useState(14);
  const { data: field, isLoading, error } = useModelField(modelId, days);
  const sites = (field?.places ?? []).flatMap((p) => (p.site ? [p.site] : []));

  return (
    <div className="space-y-8">
      <section aria-labelledby="field-places" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 id="field-places" className="text-base font-semibold">At each site</h3>
            <p className="text-sm text-muted-foreground">
              {field ? fieldSentence(field) : 'How the model does where it runs, from what devices report.'}
            </p>
          </div>
          <ToggleGroup type="single" size="sm" value={String(days)} onValueChange={(v) => v && setDays(Number(v))} aria-label="Period">
            {RANGES.map((d) => <ToggleGroupItem key={d} value={String(d)}>{d} days</ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">{error instanceof Error ? error.message : 'Could not load field data'}.</p>
        ) : !field || field.places.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed px-6 py-10 text-center">
            <Radar className="mb-3 h-7 w-7 text-muted-foreground" aria-hidden />
            <p className="max-w-xl text-sm text-muted-foreground">
              Devices report what the model sees once your inference service records each result with the agent
              (<code>edge.record(…)</code>, or <code>POST /v1/predictions</code> on the device). Each site is then compared
              with its own first days on a version, and drift raises an alert.{' '}
              <Link to="/fleet" className="font-medium text-[var(--mtx-primary)] hover:underline dark:text-violet-400">Open Fleet</Link>
            </p>
          </div>
        ) : (
          <FieldPlaces field={field} />
        )}
      </section>

      <SamplingPolicyCard modelId={modelId} canManage={canManage} />

      <SampleGallery modelId={modelId} projectId={projectId} sites={sites} canManage={canManage} />
    </div>
  );
}
