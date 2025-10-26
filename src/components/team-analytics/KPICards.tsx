import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { TrendingUp, Users, CheckCircle, Clock, Image, FileCheck } from "lucide-react";
import { AnalyticsKPIs, ImageAnalyticsKPIs } from "@/types/analytics";

interface KPICardsProps {
  jobKpis: AnalyticsKPIs;
  imageKpis: ImageAnalyticsKPIs;
  isLoading?: boolean;
}

export const KPICards = ({ jobKpis, imageKpis, isLoading }: KPICardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpiData = [
    {
      title: "Jobs Annotated",
      value: jobKpis.totalAnnotationsThisWeek.toLocaleString(),
      description: "Jobs in annotation",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Jobs Reviewed",
      value: jobKpis.totalReviewsThisWeek.toLocaleString(),
      description: "Jobs in review",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Jobs Completed",
      value: jobKpis.totalCompletionsThisWeek.toLocaleString(),
      description: "Total jobs finished",
      icon: FileCheck,
      color: "text-purple-600",
    },
    {
      title: "Images Annotated",
      value: imageKpis.totalAnnotatedThisWeek.toLocaleString(),
      description: "Total images annotated",
      icon: Image,
      color: "text-cyan-600",
    },
    {
      title: "Images Finalized",
      value: imageKpis.totalFinalizedThisWeek.toLocaleString(),
      description: `${imageKpis.imageCompletionRate}% completion rate`,
      icon: Users,
      color: "text-indigo-600",
    },
    {
      title: "Avg. Time",
      value: `${Math.round(jobKpis.averageCompletionTimeMinutes / 60 * 10) / 10}h`,
      description: `Top: ${jobKpis.topPerformer.userName}`,
      icon: Clock,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {kpi.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};