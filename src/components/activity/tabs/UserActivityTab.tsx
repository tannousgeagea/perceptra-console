import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/ui/card";
import type { UserSummary } from "@/types/activity";

interface UserActivityTabProps {
  userSummary: UserSummary;
}

export const UserActivityTab = ({ userSummary }: UserActivityTabProps) => {
  const annotationData = [
    {
      name: "Manual",
      value: userSummary.manual_annotations,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "AI Edited",
      value: userSummary.ai_predictions_edited,
      fill: "hsl(var(--chart-4))",
    },
    {
      name: "AI Accepted",
      value: userSummary.ai_predictions_accepted,
      fill: "hsl(var(--chart-2))",
    },
  ];

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-gradient-to-r from-primary to-warning rounded-lg shadow-lg p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center text-2xl font-bold text-primary">
            {userSummary.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{userSummary.full_name}</h2>
            <p className="text-primary-foreground/80">@{userSummary.username}</p>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Last active: {new Date(userSummary.last_activity).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* User Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">
            Manual Annotations
          </p>
          <p className="text-2xl font-bold text-foreground">
            {userSummary.manual_annotations.toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            {(
              (userSummary.manual_annotations / userSummary.total_annotations) *
              100
            ).toFixed(1)}
            % of total
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">AI Edits</p>
          <p className="text-2xl font-bold text-primary">
            {userSummary.ai_predictions_edited.toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            Predictions improved
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">AI Accepted</p>
          <p className="text-2xl font-bold text-success">
            {userSummary.ai_predictions_accepted.toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            No edits needed
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
          <p className="text-2xl font-bold text-warning">
            {userSummary.total_sessions}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            Work sessions
          </div>
        </Card>
      </div>

      {/* Annotation Breakdown Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Annotation Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={annotationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary-light rounded-lg">
              <span className="text-sm font-medium text-foreground">
                Avg Annotation Time
              </span>
              <span className="text-lg font-bold text-primary">
                {userSummary.avg_annotation_time_seconds}s
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning-light rounded-lg">
              <span className="text-sm font-medium text-foreground">
                Avg Edit Magnitude
              </span>
              <span className="text-lg font-bold text-warning">
                {(userSummary.avg_edit_magnitude * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-success-light rounded-lg">
              <span className="text-sm font-medium text-foreground">
                Review Rate
              </span>
              <span className="text-lg font-bold text-success">
                {(
                  (userSummary.images_reviewed / userSummary.total_annotations) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Review Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-foreground">Total Reviewed</span>
              <span className="font-bold text-foreground">
                {userSummary.images_reviewed.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-success h-2 rounded-full"
                style={{ width: "76%" }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground">Finalized</span>
              <span className="font-bold text-success">
                {userSummary.images_finalized.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
