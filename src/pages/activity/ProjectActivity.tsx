// ProjectActivityPage.tsx
import { useState } from "react";
import { Activity } from "lucide-react";
import { TabButton } from "@/components/activity/TabButton";
import { OverviewTab } from "@/components/activity/tabs/OverviewTab";
import { UserActivityTab } from "@/components/activity/tabs/UserActivityTab";
import { LeaderboardTab } from "@/components/activity/tabs/LeaderboardTab";
import { PredictionQualityTab } from "@/components/activity/tabs/PredictionQualityTab";
import { TimelineTab } from "@/components/activity/tabs/TimelineTab";
import { HeatmapTab } from "@/components/activity/tabs/HeatmapTab";
import { useParams } from "react-router-dom";
import { 
  useUserActivitySummary, 
  useProjectProgress, 
  useProjectLeaderboard,
  useProjectTimeline,
  usePredictionQuality,
  useActivityHeatmap,
  useActivityTrend
} from "@/hooks/useActivity";
import QueryState from "@/components/common/QueryState";
import { FilterBar } from "@/components/activity/FilterBar";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { toast } from "sonner";
import {
  exportToCSV,
  exportToPDF,
  prepareLeaderboardForExport,
} from "@/utils/exportUtils";
import type { DateRange } from "react-day-picker";

const ProjectActivityPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProject, setSelectedProject] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [appliedEndDate, setAppliedEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    if (start && end) {
      setDateRange({ from: start, to: end });
      setAppliedStartDate(start.toISOString().split("T")[0]);
      setAppliedEndDate(end.toISOString().split("T")[0]);
    } else {
      setDateRange(undefined);
      // Reset to defaults when cleared
      setAppliedStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
      setAppliedEndDate(new Date().toISOString().split("T")[0]);
    }
  };

  const { data: userActivity, isLoading: userActivityLoading, isError: userActivityError, refetch } = useUserActivitySummary(projectId!, {
    startDate: appliedStartDate,
    endDate: appliedEndDate
  });

  const { data: progress, isLoading: progressLoading, isError: progressError } = useProjectProgress(projectId!);
  const { data: leaderboard, isLoading: leaderboardLoading, isError: leaderboardError } = useProjectLeaderboard(projectId!, { metric: 'annotations_created', periodDays: 30 });
  const { data: timeline, isLoading: timelineLoading, isError: timelineError } = useProjectTimeline(projectId!, { 
    limit: 15,
    startDate: appliedStartDate,
    endDate: appliedEndDate
  });

  const { data: quality, isLoading: qualityLoading, isError: qualityError } = usePredictionQuality(projectId!);
  const { data: trend, isLoading: trendLoading, isError: trendError } = useActivityTrend(projectId!);
  const { data: heatmap, isLoading: heatmapLoading, isError: heatmapError } = useActivityHeatmap(projectId!, appliedStartDate, appliedEndDate);
  
  const { isEnabled, lastUpdated, isRefreshing, toggleAutoRefresh, manualRefresh } = useAutoRefresh(
    refetch,
    30 // 30 seconds
  );

  const isLoading = userActivityLoading || progressLoading || leaderboardLoading || timelineLoading || qualityLoading || heatmapLoading || trendLoading;
  const isError = userActivityError || progressError || leaderboardError || timelineError || qualityError || heatmapError || trendError;

  if (isLoading || isError || !userActivity || !progress || !timeline || !quality || !heatmap || !trend) {
    return (
      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingMessage="Loading user activity ..."
        errorMessage="Failed to fetch user activity. Please try again."
      />
    );
  }

  const handleExport = (type: "csv" | "pdf") => {
    try {
      if (activeTab === "leaderboard") {
        const data = prepareLeaderboardForExport(leaderboard || []);
        if (type === "csv") {
          exportToCSV(data, "leaderboard");
        } else {
          const headers = Object.keys(data[0]);
          const rows = data.map(row => Object.values(row));
          exportToPDF("Leaderboard Report", headers, rows, "leaderboard");
        }
      } else {
        toast.info("Export not available for this view");
        return;
      }
      toast.success(`${type.toUpperCase()} exported successfully`);
    } catch (error) {
      toast.error("Export failed");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-7 h-7 text-primary" />
              Activity Monitoring Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track team progress, quality metrics, and user contributions
            </p>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 overflow-x-auto" aria-label="Dashboard tabs">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            >
              📊 Overview
            </TabButton>
            <TabButton
              active={activeTab === "user"}
              onClick={() => setActiveTab("user")}
            >
              👤 User Activity
            </TabButton>
            <TabButton
              active={activeTab === "leaderboard"}
              onClick={() => setActiveTab("leaderboard")}
            >
              🏆 Leaderboard
            </TabButton>
            <TabButton
              active={activeTab === "quality"}
              onClick={() => setActiveTab("quality")}
            >
              🎯 Prediction Quality
            </TabButton>
            <TabButton
              active={activeTab === "timeline"}
              onClick={() => setActiveTab("timeline")}
            >
              📜 Timeline
            </TabButton>
            <TabButton
              active={activeTab === "heatmap"}
              onClick={() => setActiveTab("heatmap")}
            >
              🔥 Heatmap
            </TabButton>
          </nav>
        </div>
      </header>

      <FilterBar
        viewMode={'project'}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onProjectChange={setSelectedProject}
        onUserSearch={setUserSearchQuery}
        onExport={handleExport}
        onRefresh={manualRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        autoRefreshEnabled={isEnabled}
        onToggleAutoRefresh={toggleAutoRefresh}
        projects={undefined}
        selectedProject={selectedProject}
      />

      {/* Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <OverviewTab
            userSummary={userActivity!}
            projectProgress={progress!}
            activityTrend={trend}
          />
        )}
        {activeTab === "user" && <UserActivityTab userSummary={userActivity} />}
        {activeTab === "leaderboard" && (
          <LeaderboardTab leaderboard={leaderboard!} />
        )}
        {activeTab === "quality" && (
          <PredictionQualityTab predictionQuality={quality} />
        )}
        {activeTab === "timeline" && <TimelineTab timeline={timeline} />}
        {activeTab === "heatmap" && <HeatmapTab heatmap={heatmap} />}
      </main>
    </div>
  );
};

export default ProjectActivityPage;