import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { AnnotationStats } from "@/types/analytics";

interface AnnotationStatsChartProps {
  data: AnnotationStats;
}

export const AnnotationStatsChart = ({ data }: AnnotationStatsChartProps) => {
  const sourceData = Object.entries(data.by_source).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const classData = data.class_distribution.map((item) => ({
    name: item.class_name,
    value: item.count,
    percentage: item.percentage,
    fill: item.color,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Class Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Class Distribution</CardTitle>
          <CardDescription>Annotations per class across dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Annotations",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={100}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number, name: string, props: any) => [
                    `${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`,
                    "Count",
                  ]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Annotation Source */}
      <Card>
        <CardHeader>
          <CardTitle>Annotation Source</CardTitle>
          <CardDescription>Manual vs predicted annotations</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              manual: { label: "Manual", color: "hsl(var(--primary))" },
              prediction: { label: "Prediction", color: "hsl(var(--warning))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                  outerRadius={100}
                  dataKey="value"
                  fill="hsl(var(--primary))"
                >
                  <Cell fill="hsl(var(--primary))" />
                  <Cell fill="hsl(var(--warning))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Annotation Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Annotation Statistics</CardTitle>
          <CardDescription>Key metrics overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Annotations</span>
            <span className="text-xl font-bold">{data.total.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active</span>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">
              {data.active.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Inactive</span>
            <span className="text-xl font-bold text-muted-foreground">
              {data.inactive.toLocaleString()}
            </span>
          </div>
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg per Image</span>
              <span className="text-2xl font-bold">{data.average_per_image.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
