import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { apiFetch } from '@/services/apiClient';
import { cn } from '@/lib/utils';

interface ReviewInsights {
  days: number;
  reviews: number;
  sent_back: number;
  approved: number;
  rate: number | null;
  reasons: { reason: string; count: number; share: number; examples: string[] }[];
  annotators: { user_id: string; name: string; reviews: number; sent_back: number; rate: number }[];
  weekly: { week: string; approved: number; sent_back: number }[];
}

// Validated pair (dataviz validate_palette.js, light #fff and dark #020817:
// CVD ΔE 26.7). Green/red was rejected: deutan ΔE 7.4.
const APPROVED = 'hsl(var(--chart-1))'; // #3b82f6
const SENT_BACK = 'hsl(var(--chart-5))'; // #ef4444

const RANGES = [7, 30, 90] as const;

const useReviewInsights = (projectId: string, days: number) =>
  useQuery({
    queryKey: ['reviewInsights', projectId, days],
    enabled: !!projectId,
    staleTime: 60_000,
    queryFn: async (): Promise<ReviewInsights> => {
      const response = await apiFetch(`/api/v1/projects/${projectId}/review-insights?days=${days}`);
      if (!response.ok) throw new Error('Failed to load review insights');
      return response.json();
    },
  });

const weekLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-lg border border-border p-4">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</div>
    {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
  </div>
);

const Legend = () => (
  <div className="flex items-center gap-4 text-xs text-muted-foreground">
    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: APPROVED }} />Approved</span>
    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: SENT_BACK }} />Sent back</span>
  </div>
);

/**
 * Why work gets sent back in this project: the rate, the most common reasons
 * (with recent notes), who gets sent back most, and the weekly trend.
 */
export const ReviewInsightsPanel = ({ projectId }: { projectId: string }) => {
  const [days, setDays] = useState<number>(30);
  const { data, isLoading, isError } = useReviewInsights(projectId, days);

  const rangePicker = (
    <div className="flex rounded-md border border-border p-0.5 text-xs" role="group" aria-label="Time range">
      {RANGES.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => setDays(d)}
          className={cn('rounded px-2.5 py-1', d === days ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')}
        >
          {d} days
        </button>
      ))}
    </div>
  );

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !data) return <p className="text-sm text-muted-foreground">Couldn't load review insights.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Every review decision in the last {data.days} days: what reviewers send back, and why.
        </p>
        {rangePicker}
      </div>

      {data.reviews === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No reviews in this period yet.</CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Review decisions" value={data.reviews.toLocaleString()} />
            <Stat label="Approved" value={data.approved.toLocaleString()} />
            <Stat label="Sent back" value={data.sent_back.toLocaleString()} />
            <Stat label="Sent-back rate" value={data.rate != null ? `${data.rate}%` : '—'} hint="of review decisions" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Why images are sent back</CardTitle></CardHeader>
              <CardContent>
                {data.reasons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing was sent back in this period.</p>
                ) : (
                  <ol className="space-y-3">
                    {data.reasons.map((r) => (
                      <li key={r.reason}>
                        <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                          <span className="font-medium text-foreground">{r.reason}</span>
                          <span className="tabular-nums text-muted-foreground">{r.count} · {r.share}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full" style={{ width: `${r.share}%`, background: SENT_BACK }} />
                        </div>
                        {r.examples.length > 0 && (
                          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                            {r.examples.map((e, i) => <li key={i} className="truncate" title={e}>“{e}”</li>)}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Weekly decisions</CardTitle>
                <Legend />
              </CardHeader>
              <CardContent>
                <div className="h-56" role="img" aria-label="Approved and sent-back review decisions per week">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.weekly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="35%" maxBarSize={48}>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                      <XAxis dataKey="week" tickFormatter={weekLabel} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                        labelFormatter={(w) => `Week of ${weekLabel(String(w))}`}
                        contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      {/* 2px card-coloured gap between stacked segments; rounded data-end on top only. */}
                      <Bar dataKey="approved" name="Approved" stackId="d" fill={APPROVED} stroke="hsl(var(--card))" strokeWidth={2} />
                      <Bar dataKey="sent_back" name="Sent back" stackId="d" fill={SENT_BACK} stroke="hsl(var(--card))" strokeWidth={2} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <details className="mt-2 text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Show as table</summary>
                  <table className="mt-2 w-full text-left">
                    <thead><tr><th className="py-1 font-medium">Week of</th><th className="py-1 text-right font-medium">Approved</th><th className="py-1 text-right font-medium">Sent back</th></tr></thead>
                    <tbody>
                      {data.weekly.map((w) => (
                        <tr key={w.week} className="border-t border-border">
                          <td className="py-1">{weekLabel(w.week)}</td>
                          <td className="py-1 text-right tabular-nums">{w.approved}</td>
                          <td className="py-1 text-right tabular-nums">{w.sent_back}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">By annotator</CardTitle></CardHeader>
            <CardContent>
              {data.annotators.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews of assigned work in this period.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2 text-left font-medium">Annotator</th>
                      <th className="py-2 text-right font-medium">Reviews</th>
                      <th className="py-2 text-right font-medium">Sent back</th>
                      <th className="py-2 text-right font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.annotators.map((a) => (
                      <tr key={a.user_id} className="border-t border-border">
                        <td className="py-2 font-medium text-foreground">{a.name}</td>
                        <td className="py-2 text-right tabular-nums">{a.reviews}</td>
                        <td className="py-2 text-right tabular-nums">{a.sent_back}</td>
                        <td className="py-2 text-right tabular-nums">{a.rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
