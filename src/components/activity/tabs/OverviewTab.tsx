import { Users, Tag, Eye, Clock, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "../StatCard";
import { ProgressBar } from "../ProgressBar";
import { Card } from "@/components/ui/ui/card";
import type { UserSummary, ProjectProgress, ActivityTrend } from "@/types/activity";

interface OverviewTabProps {
  userSummary: UserSummary;
  projectProgress: ProjectProgress;
  activityTrend: ActivityTrend[];
}

export const OverviewTab = ({
  userSummary,
  projectProgress,
  activityTrend,
}: OverviewTabProps) => (
  <div className="space-y-6">
    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Annotations"
        value={userSummary.total_annotations.toLocaleString()}
        subtitle="Last 30 days"
        icon={Tag}
        trend="+12.5% from last period"
        variant="primary"
      />
      <StatCard
        title="Images Reviewed"
        value={userSummary.images_reviewed.toLocaleString()}
        subtitle={`${userSummary.images_finalized} finalized`}
        icon={Eye}
        trend="+8.3% from last period"
        variant="success"
      />
      <StatCard
        title="Active Contributors"
        value={projectProgress.active_contributors}
        subtitle="Current project"
        icon={Users}
        variant="warning"
      />
      <StatCard
        title="Avg Annotation Time"
        value={`${userSummary.avg_annotation_time_seconds}s`}
        subtitle="Per annotation"
        icon={Clock}
        trend="-5.2% faster"
        variant="primary"
      />
    </div>

    {/* Project Progress */}
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Project Progress: {projectProgress.project_name}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ProgressBar
            value={projectProgress.images_annotated}
            max={projectProgress.total_images}
            label="Annotated Images"
            variant="primary"
          />
          <ProgressBar
            value={projectProgress.images_reviewed}
            max={projectProgress.total_images}
            label="Reviewed Images"
            variant="success"
          />
          <ProgressBar
            value={projectProgress.images_finalized}
            max={projectProgress.total_images}
            label="Finalized Images"
            variant="warning"
          />
        </div>

        <div>
          <div className="bg-gradient-to-br from-primary-light to-warning-light rounded-lg p-6 border border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Overall Completion
            </h4>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-primary">
                {projectProgress.completion_percentage}%
              </span>
              <span className="text-muted-foreground mb-2">complete</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Images</p>
                <p className="text-xl font-bold text-foreground">
                  {projectProgress.total_images.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining</p>
                <p className="text-xl font-bold text-warning">
                  {projectProgress.images_unannotated.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    {/* Activity Trend Chart */}
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Activity Trend (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={activityTrend}>
          <defs>
            <linearGradient id="colorAnnotations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="annotations"
            stroke="hsl(var(--chart-1))"
            fillOpacity={1}
            fill="url(#colorAnnotations)"
            name="Annotations"
          />
          <Area
            type="monotone"
            dataKey="reviews"
            stroke="hsl(var(--chart-2))"
            fillOpacity={1}
            fill="url(#colorReviews)"
            name="Reviews"
          />
          <Area
            type="monotone"
            dataKey="uploads"
            stroke="hsl(var(--chart-3))"
            fill="hsl(var(--chart-3))"
            fillOpacity={0.1}
            name="Uploads"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  </div>
);
