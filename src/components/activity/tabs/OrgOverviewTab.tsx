import { StatCard } from "../StatCard";
import { Users, FolderKanban, Activity, Award, TrendingUp } from "lucide-react";
import { OrganizationSummary, ActivityTrend } from "@/types/activity";
import { Card } from "@/components/ui/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface OrgOverviewTabProps {
  orgSummary: OrganizationSummary;
  activityTrend: ActivityTrend[];
}

export const OrgOverviewTab = ({ orgSummary, activityTrend }: OrgOverviewTabProps) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Annotations"
          value={orgSummary.total_annotations.toLocaleString()}
          subtitle="Across all projects"
          icon={Activity}
          trend="+15.3% this period"
          variant="primary"
        />
        <StatCard
          title="Active Users"
          value={orgSummary.total_active_users}
          subtitle={`${orgSummary.avg_annotations_per_user.toFixed(0)} avg per user`}
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Active Projects"
          value={orgSummary.active_projects}
          subtitle={`${orgSummary.total_projects} total projects`}
          icon={FolderKanban}
          variant="warning"
        />
        <StatCard
          title="Images Finalized"
          value={orgSummary.images_finalized.toLocaleString()}
          subtitle={`${orgSummary.images_reviewed.toLocaleString()} reviewed`}
          icon={Award}
          trend="+9.7% this period"
          variant="primary"
        />
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Top Annotator</h3>
              <p className="text-sm text-muted-foreground">Highest annotation count</p>
            </div>
          </div>
          {orgSummary.top_annotator ? (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold text-foreground">{orgSummary.top_annotator.full_name}</p>
                <p className="text-sm text-muted-foreground">@{orgSummary.top_annotator.username}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{orgSummary.top_annotator.count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">annotations</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No data available</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Top Reviewer</h3>
              <p className="text-sm text-muted-foreground">Most images reviewed</p>
            </div>
          </div>
          {orgSummary.top_reviewer ? (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold text-foreground">{orgSummary.top_reviewer.full_name}</p>
                <p className="text-sm text-muted-foreground">@{orgSummary.top_reviewer.username}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-success">{orgSummary.top_reviewer.count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">reviews</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No data available</p>
          )}
        </Card>
      </div>

      {/* Organization Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Organization Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Manual Annotations</p>
            <p className="text-2xl font-bold text-foreground">{orgSummary.manual_annotations.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {((orgSummary.manual_annotations / orgSummary.total_annotations) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">AI Predictions Edited</p>
            <p className="text-2xl font-bold text-foreground">{orgSummary.ai_predictions_edited.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Improved by team</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">AI Predictions Accepted</p>
            <p className="text-2xl font-bold text-foreground">{orgSummary.ai_predictions_accepted.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">No edits needed</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg Annotation Time</p>
            <p className="text-2xl font-bold text-foreground">
              {orgSummary.avg_annotation_time_seconds?.toFixed(1) || 'N/A'}s
            </p>
            <p className="text-xs text-muted-foreground mt-1">Per annotation</p>
          </div>
        </div>
      </Card>

      {/* Activity Trend Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Organization Activity Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={activityTrend}>
            <defs>
              <linearGradient id="colorAnnotations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="annotations"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorAnnotations)"
              name="Annotations"
            />
            <Area
              type="monotone"
              dataKey="reviews"
              stroke="hsl(var(--success))"
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
};
