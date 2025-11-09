import { useState } from "react";

import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { BarChart3, Database, Image, Tag, TrendingUp, GitCompare } from "lucide-react";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import { ImageStatsChart } from "@/components/analytics/AnalyticsImageStatsChart";
import { AnnotationStatsChart } from "@/components/analytics/AnalyticsAnnotationStatsChart";
import { EvaluationStatsChart } from "@/components/analytics/AnalyticsEvaluationStatsChart";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { VersionComparison } from "@/components/analytics/AnalyticsVersionComparison";
import { 
    useImageStats, 
    useAnnotationStats,
    useProjectSummary,
    useEvaluationStats,
    useVersionStats
} from "@/hooks/useAnalytics";
import type { DateRange } from "react-day-picker";

const Analytics = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: summary, isLoading: summaryLoading } = useProjectSummary(projectId!);
  const { data: imageStats, isLoading: imageLoading } = useImageStats(projectId!);
  const { data: annotationStats, isLoading: annotationLoading } = useAnnotationStats(projectId!);
  const { data: evaluationStats, isLoading: evaluationLoading } = useEvaluationStats(projectId!);
  const { data: versionStats } = useVersionStats(projectId!);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timeGranularity, setTimeGranularity] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>();
  const [comparisonVersions, setComparisonVersions] = useState<[string, string]>([
    versionStats?.[0]?.id || "v1",
    versionStats?.[1]?.id || "v2",
  ]);

  const versions = versionStats?.map((v) => ({ id: v.id, name: v.version_name })) || [];

  const handleVersionChange = (index: 0 | 1, versionId: string) => {
    const newVersions: [string, string] = [...comparisonVersions] as [string, string];
    newVersions[index] = versionId;
    setComparisonVersions(newVersions);
  };

  if (summaryLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Dataset Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            {summary.project_name} • {summary.project_type.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      <div className="mx-auto p-6 space-y-6">
        <AnalyticsFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          timeGranularity={timeGranularity}
          onTimeGranularityChange={setTimeGranularity}
          selectedVersion={selectedVersion}
          onVersionChange={setSelectedVersion}
          versions={versions}
        />

        <AnalyticsOverview data={summary} />

        <Tabs defaultValue="images" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="images" className="gap-2">
              <Image className="h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="annotations" className="gap-2">
              <Tag className="h-4 w-4" />
              Annotations
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <GitCompare className="h-4 w-4" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="metadata" className="gap-2">
              <Database className="h-4 w-4" />
              Metadata
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-6">
            {imageLoading ? (
              <Skeleton className="h-96" />
            ) : imageStats ? (
              <ImageStatsChart data={imageStats} />
            ) : null}
          </TabsContent>

          <TabsContent value="annotations" className="space-y-6">
         {annotationLoading ? (
              <Skeleton className="h-96" />
            ) : annotationStats ? (
              <AnnotationStatsChart data={annotationStats} />
            ) : null}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {evaluationLoading ? (
              <Skeleton className="h-96" />
            ) : evaluationStats ? (
              <EvaluationStatsChart data={evaluationStats} />
            ) : null}
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            {versionStats && versionStats.length >= 2 ? (
              <VersionComparison
                versions={versionStats}
                selectedVersions={comparisonVersions}
                onVersionChange={handleVersionChange}
              />
            ) : (
              <div className="p-12 text-center border rounded-lg bg-muted/50">
                <GitCompare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  At least 2 versions are required to compare
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="metadata" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 border rounded-lg bg-card space-y-4">
                <h3 className="text-lg font-semibold">Image Metadata</h3>
                {imageStats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Dimensions</span>
                      <span className="font-medium">
                        {imageStats.average_dimensions.width} × {imageStats.average_dimensions.height}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg File Size</span>
                      <span className="font-medium">{imageStats.average_file_size_mb.toFixed(2)} MB</span>
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border rounded-lg bg-card space-y-4">
                <h3 className="text-lg font-semibold">Project Info</h3>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(summary.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Edited</span>
                  <span className="font-medium">
                    {new Date(summary.last_edited).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latest Version</span>
                  <span className="font-medium">{summary.latest_version || "N/A"}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
