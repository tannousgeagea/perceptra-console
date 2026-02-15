import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { KPICard } from "./KPICard";
import { ClassPerformanceTable } from "./ClassPerformanceTable";
import type { MetricsSummary, ClassMetrics, EditTypeDistribution } from "@/types/evaluation";

interface EvaluationOverviewProps {
  summary: MetricsSummary;
  classMetrics: ClassMetrics[];
  editDistribution: EditTypeDistribution[];
}

const QUALITY_COLORS = {
  tp: "#10b981", // green
  fp: "#ef4444", // red
  fn: "#f59e0b", // amber
};

const EDIT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export const EvaluationOverview = ({
  summary,
  classMetrics,
  editDistribution,
}: EvaluationOverviewProps) => {
  const qualityData = [
    { name: "True Positives", value: summary.tp, color: QUALITY_COLORS.tp },
    { name: "False Positives", value: summary.fp, color: QUALITY_COLORS.fp },
    { name: "False Negatives", value: summary.fn, color: QUALITY_COLORS.fn },
  ];

  const total = summary.tp + summary.fp + summary.fn;

  return (
    <div className="space-y-6">
      {/* KPI Cards - Top Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Precision"
          value={summary.precision}
          change={summary.precision_change}
        />
        <KPICard
          title="Recall"
          value={summary.recall}
          change={summary.recall_change}
        />
        <KPICard
          title="F1 Score"
          value={summary.f1_score}
          change={summary.f1_change}
        />
      </div>

      {/* KPI Cards - Second Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Edit Rate"
          value={summary.edit_rate}
          change={summary.edit_rate_change}
          isInverse
        />
        <KPICard
          title="Hallucination Rate"
          value={summary.hallucination_rate}
          change={summary.hallucination_change}
          isInverse
        />
        <KPICard
          title="Miss Rate"
          value={summary.miss_rate}
          change={summary.miss_rate_change}
          isInverse
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Donut Chart - Prediction Quality */}
        <Card>
          <CardHeader>
            <CardTitle>Prediction Quality Breakdown</CardTitle>
            <CardDescription>Distribution of TP, FP, and FN</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                tp: { label: "True Positives", color: QUALITY_COLORS.tp },
                fp: { label: "False Positives", color: QUALITY_COLORS.fp },
                fn: { label: "False Negatives", color: QUALITY_COLORS.fn },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, value }) => `${((value / total) * 100).toFixed(0)}%`}
                  >
                    {qualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-6 mt-4">
              {qualityData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Horizontal Bar Chart - Edit Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Type Distribution</CardTitle>
            <CardDescription>How predictions are being modified</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                percentage: { label: "Percentage", color: "hsl(var(--primary))" },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={editDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="type" width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                    {editDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EDIT_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {editDistribution.map((item, index) => (
                <div key={item.type} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: EDIT_COLORS[index] }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.type} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Class Performance</CardTitle>
          <CardDescription>Detailed metrics for each class</CardDescription>
        </CardHeader>
        <CardContent>
          <ClassPerformanceTable data={classMetrics} />
        </CardContent>
      </Card>
    </div>
  );
};
