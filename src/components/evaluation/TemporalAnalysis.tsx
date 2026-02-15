import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceDot } from "recharts";
import { Button } from "@/components/ui/ui/button";
import { Badge } from "@/components/ui/ui/badge";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemporalTrend, Anomaly } from "@/types/evaluation";

interface TemporalAnalysisProps {
  trends: TemporalTrend[];
  anomalies: Anomaly[];
  onRangeChange: (days: number) => void;
}

const METRIC_COLORS = {
  precision: "hsl(var(--primary))",
  recall: "#10b981",
  f1_score: "#f59e0b",
  edit_rate: "#8b5cf6",
};

export const TemporalAnalysis = ({
  trends,
  anomalies,
  onRangeChange,
}: TemporalAnalysisProps) => {
  const [selectedRange, setSelectedRange] = useState(30);
  const [visibleMetrics, setVisibleMetrics] = useState({
    precision: true,
    recall: true,
    f1_score: true,
    edit_rate: false,
  });

  const handleRangeChange = (days: number) => {
    setSelectedRange(days);
    onRangeChange(days);
  };

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics((prev) => ({ ...prev, [metric]: !prev[metric] }));
  };

  // Scale values to percentage for display
  const chartData = trends.map((t) => ({
    ...t,
    precision: t.precision * 100,
    recall: t.recall * 100,
    f1_score: t.f1_score * 100,
    edit_rate: t.edit_rate * 100,
    formattedDate: new Date(t.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Metrics over time</CardDescription>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90].map((days) => (
                <Button
                  key={days}
                  variant={selectedRange === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRangeChange(days)}
                >
                  Last {days} days
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              precision: { label: "Precision", color: METRIC_COLORS.precision },
              recall: { label: "Recall", color: METRIC_COLORS.recall },
              f1_score: { label: "F1 Score", color: METRIC_COLORS.f1_score },
              edit_rate: { label: "Edit Rate", color: METRIC_COLORS.edit_rate },
            }}
            className="h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="formattedDate"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                {visibleMetrics.precision && (
                  <Line
                    type="monotone"
                    dataKey="precision"
                    stroke={METRIC_COLORS.precision}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {visibleMetrics.recall && (
                  <Line
                    type="monotone"
                    dataKey="recall"
                    stroke={METRIC_COLORS.recall}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {visibleMetrics.f1_score && (
                  <Line
                    type="monotone"
                    dataKey="f1_score"
                    stroke={METRIC_COLORS.f1_score}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {visibleMetrics.edit_rate && (
                  <Line
                    type="monotone"
                    dataKey="edit_rate"
                    stroke={METRIC_COLORS.edit_rate}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {/* Anomaly markers */}
                {anomalies.map((anomaly) => {
                  const dataPoint = chartData.find((d) => d.date === anomaly.date);
                  if (!dataPoint) return null;
                  return (
                    <ReferenceDot
                      key={anomaly.id}
                      x={dataPoint.formattedDate}
                      y={anomaly.current_value * 100}
                      r={6}
                      fill={anomaly.severity === "critical" ? "#ef4444" : "#f59e0b"}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Metric toggles */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Toggle:</span>
            {(Object.keys(visibleMetrics) as Array<keyof typeof visibleMetrics>).map(
              (metric) => (
                <div key={metric} className="flex items-center gap-2">
                  <Checkbox
                    id={metric}
                    checked={visibleMetrics[metric]}
                    onCheckedChange={() => toggleMetric(metric)}
                  />
                  <label
                    htmlFor={metric}
                    className="text-sm font-medium cursor-pointer flex items-center gap-1"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: METRIC_COLORS[metric] }}
                    />
                    {metric === "f1_score"
                      ? "F1 Score"
                      : metric === "edit_rate"
                      ? "Edit Rate"
                      : metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </label>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Issues</CardTitle>
          <CardDescription>Anomalies and performance drops</CardDescription>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No anomalies detected in the selected time range
            </p>
          ) : (
            <div className="space-y-3">
              {anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border",
                    anomaly.severity === "critical"
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-yellow-500/50 bg-yellow-500/5"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {anomaly.severity === "critical" ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={anomaly.severity === "critical" ? "destructive" : "secondary"}
                      >
                        {anomaly.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(anomaly.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 font-medium">{anomaly.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      From {(anomaly.previous_value * 100).toFixed(1)}% →{" "}
                      {(anomaly.current_value * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
