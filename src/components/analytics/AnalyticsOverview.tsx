import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Database, Image, Tag, Briefcase, Package } from "lucide-react";
import type { ProjectSummary } from "@/types/analytics";

interface AnalyticsOverviewProps {
  data: ProjectSummary;
}

export const AnalyticsOverview = ({ data }: AnalyticsOverviewProps) => {
  const stats = [
    {
      title: "Total Images",
      value: data.total_images.toLocaleString(),
      icon: Image,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Total Annotations",
      value: data.total_annotations.toLocaleString(),
      icon: Tag,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Active Jobs",
      value: `${data.active_jobs} / ${data.total_jobs}`,
      icon: Briefcase,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Dataset Versions",
      value: data.total_versions.toString(),
      icon: Package,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  const progressStats = [
    {
      label: "Annotated",
      value: data.annotated_images,
      total: data.total_images,
      color: "bg-primary",
    },
    {
      label: "Reviewed",
      value: data.reviewed_images,
      total: data.total_images,
      color: "bg-green-500",
    },
    {
      label: "Finalized",
      value: data.finalized_images,
      total: data.total_images,
      color: "bg-blue-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Image Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {progressStats.map((stat) => {
            const percentage = (stat.value / stat.total) * 100;
            return (
              <div key={stat.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stat.label}</span>
                  <span className="text-muted-foreground">
                    {stat.value.toLocaleString()} / {stat.total.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
