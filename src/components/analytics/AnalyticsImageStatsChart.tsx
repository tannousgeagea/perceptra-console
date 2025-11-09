import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { ImageStats } from "@/types/analytics";

interface ImageStatsChartProps {
  data: ImageStats;
}

const COLORS = {
  train: "hsl(var(--primary))",
  val: "hsl(var(--success))",
  test: "hsl(var(--warning))",
  annotated: "hsl(var(--primary))",
  reviewed: "hsl(var(--success))",
  finalized: "hsl(214 100% 50%)",
  pending: "hsl(var(--muted-foreground))",
};

export const ImageStatsChart = ({ data }: ImageStatsChartProps) => {
  const splitData = Object.entries(data.by_split).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: COLORS[name as keyof typeof COLORS],
  }));

  const statusData = Object.entries(data.by_status).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
    value,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Upload Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Trend</CardTitle>
          <CardDescription>Images uploaded over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Images",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.upload_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Split Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Split</CardTitle>
          <CardDescription>Distribution across train/val/test</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              train: { label: "Train", color: "hsl(var(--primary))" },
              val: { label: "Validation", color: "hsl(var(--success))" },
              test: { label: "Test", color: "hsl(var(--warning))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={splitData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {splitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Image Status</CardTitle>
          <CardDescription>Current annotation status of images</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Images",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
