import { Card } from "@/components/ui/ui/card";
import type { ActivityHeatmap } from "@/types/activity";

interface HeatmapTabProps {
  heatmap: ActivityHeatmap;
}

export const HeatmapTab = ({ heatmap }: HeatmapTabProps) => {
  const dates = Object.keys(heatmap);
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const getHeatmapColor = (value: number | undefined) => {
    if (!value) return "bg-muted";
    if (value < 20) return "bg-success/20";
    if (value < 40) return "bg-success/40";
    if (value < 60) return "bg-success/60";
    if (value < 80) return "bg-success/80";
    return "bg-success";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Heatmap Header */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Hourly Activity Heatmap
        </h3>
        <p className="text-sm text-muted-foreground">
          Visual representation of team activity patterns throughout the week
        </p>
      </Card>

      {/* Heatmap */}
      <Card className="p-6 overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-1">
            {/* Time labels */}
            <div className="flex flex-col gap-1 pr-2">
              <div className="h-8" />
              {dates.map((date) => (
                <div key={date} className="h-8 flex items-center">
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatDate(date)}
                  </span>
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex-1">
              <div className="flex gap-1 mb-1">
                {hours.map((hour) => (
                  <div key={hour} className="w-8 text-center">
                    <span className="text-xs text-muted-foreground">{hour}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {dates.map((date) => (
                  <div key={date} className="flex gap-1">
                    {hours.map((hour) => {
                      const value = heatmap[date]?.[hour];
                      return (
                        <div
                          key={`${date}-${hour}`}
                          className={`w-8 h-8 rounded ${getHeatmapColor(
                            value
                          )} hover:ring-2 hover:ring-ring cursor-pointer transition-all`}
                          title={`${formatDate(date)} ${hour}:00 - ${
                            value || 0
                          } events`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-6 justify-center">
            <span className="text-xs text-muted-foreground">Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-muted rounded" />
              <div className="w-4 h-4 bg-success/20 rounded" />
              <div className="w-4 h-4 bg-success/40 rounded" />
              <div className="w-4 h-4 bg-success/60 rounded" />
              <div className="w-4 h-4 bg-success/80 rounded" />
              <div className="w-4 h-4 bg-success rounded" />
            </div>
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </Card>

      {/* Peak Hours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-light to-primary-light/50 rounded-lg shadow-sm border border-border p-6">
          <h4 className="text-sm font-medium text-primary-foreground mb-2">
            Peak Hour
          </h4>
          <p className="text-3xl font-bold text-primary">2:00 PM</p>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Highest activity period
          </p>
        </div>

        <div className="bg-gradient-to-br from-success-light to-success-light/50 rounded-lg shadow-sm border border-border p-6">
          <h4 className="text-sm font-medium text-success-foreground mb-2">
            Most Active Day
          </h4>
          <p className="text-3xl font-bold text-success">Thursday</p>
          <p className="text-sm text-success-foreground/80 mt-1">
            101 total events
          </p>
        </div>

        <div className="bg-gradient-to-br from-warning-light to-warning-light/50 rounded-lg shadow-sm border border-border p-6">
          <h4 className="text-sm font-medium text-warning-foreground mb-2">
            Avg Events/Hour
          </h4>
          <p className="text-3xl font-bold text-warning">64</p>
          <p className="text-sm text-warning-foreground/80 mt-1">
            During work hours
          </p>
        </div>
      </div>
    </div>
  );
};
