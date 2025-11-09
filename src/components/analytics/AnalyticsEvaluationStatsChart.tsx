import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import type { EvaluationStats } from "@/types/analytics";

interface EvaluationStatsChartProps {
  data: EvaluationStats;
}

export const EvaluationStatsChart = ({ data }: EvaluationStatsChartProps) => {
  const performanceData = data.by_class.map((item) => ({
    class: item.class_name,
    precision: (item.precision * 100).toFixed(1),
    recall: (item.recall * 100).toFixed(1),
    f1: (item.f1_score * 100).toFixed(1),
  }));

  const overallMetrics = [
    { metric: "Precision", value: data.precision },
    { metric: "Recall", value: data.recall },
    { metric: "F1 Score", value: data.f1_score },
  ];

  const radarData = data.by_class.map((item) => ({
    class: item.class_name,
    precision: item.precision * 100,
    recall: item.recall * 100,
    f1: item.f1_score * 100,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Overall Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>Overall evaluation metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {overallMetrics.map((item) => {
            const percentage = item.value * 100;
            return (
              <div key={item.metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.metric}</span>
                  <span className="text-2xl font-bold">{percentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">True Positives</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {data.true_positives}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">False Positives</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {data.false_positives}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">False Negatives</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {data.false_negatives}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Radar</CardTitle>
          <CardDescription>Multi-dimensional class performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              precision: { label: "Precision", color: "hsl(var(--primary))" },
              recall: { label: "Recall", color: "hsl(var(--success))" },
              f1: { label: "F1 Score", color: "hsl(var(--warning))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="class" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Radar
                  name="Precision"
                  dataKey="precision"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Recall"
                  dataKey="recall"
                  stroke="hsl(var(--success))"
                  fill="hsl(var(--success))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Per-Class Performance */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Per-Class Performance</CardTitle>
          <CardDescription>Detailed metrics for each class</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              precision: { label: "Precision", color: "hsl(var(--primary))" },
              recall: { label: "Recall", color: "hsl(var(--success))" },
              f1: { label: "F1 Score", color: "hsl(var(--warning))" },
            }}
            className="h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="class" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="precision" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f1" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
