import { Card, CardContent } from '@/components/ui/ui/card';
import type { ScanStats } from '@/types/similarity';
import { BarChart3, CheckCircle2, Layers, Copy } from 'lucide-react';

interface ScanStatsBarProps {
  stats: ScanStats | undefined;
  isLoading: boolean;
}

export function ScanStatsBar({ stats, isLoading }: ScanStatsBarProps) {
  const cards = [
    {
      label: 'Total scans',
      sublabel: 'All time',
      value: stats?.scans.total ?? 0,
      icon: BarChart3,
      accent: false,
      running: stats?.scans.running ?? 0,
    },
    {
      label: 'Completed',
      sublabel: 'Successful runs',
      value: stats?.scans.completed ?? 0,
      icon: CheckCircle2,
      accent: false,
      running: 0,
    },
    {
      label: 'Clusters found',
      sublabel: 'Across all scans',
      value: stats?.clusters.total ?? 0,
      icon: Layers,
      accent: false,
      running: 0,
    },
    {
      label: 'Duplicates found',
      sublabel: 'Images to review',
      value: stats?.total_duplicates ?? 0,
      icon: Copy,
      accent: (stats?.total_duplicates ?? 0) > 0,
      running: 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={card.accent ? 'border-warning/40 bg-warning/5' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              ) : (
                <span className="text-2xl font-bold">{card.value.toLocaleString()}</span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{card.sublabel}</span>
              {card.running > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-success">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  {card.running} running
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
