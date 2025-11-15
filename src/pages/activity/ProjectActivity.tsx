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
import {
  mockActivityTrend,
} from "@/components/activity/mockData";

const ProjectActivityPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: userActivity, isLoading: userActivityLoading, isError: userActivityError, refetch } = useUserActivitySummary(projectId!);
  const { data: progress, isLoading: progressLoading, isError: progressError } = useProjectProgress(projectId!);
  const { data: leaderboard, isLoading: leaderboardLoading, isError: leaderboardError } = useProjectLeaderboard(projectId!, { metric: 'annotations_created', periodDays: 30 });
  const { data: timeline, isLoading: timelineLoading, isError: timelineError } = useProjectTimeline(projectId!, { limit: 15 });
  const { data: quality, isLoading: qualityLoading, isError: qualityError } = usePredictionQuality(projectId!);

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { data: heatmap, isLoading: heatmapLoading, isError: heatmapError } = useActivityHeatmap(projectId!, startDate, endDate);
  const { data: trend, isLoading: trendLoading, isError: trendError } = useActivityTrend(projectId!);


  const isLoading = userActivityLoading || progressLoading || leaderboardLoading || timelineLoading || qualityLoading || heatmapLoading || trendLoading
  const isError = userActivityError || progressError || leaderboardError || timelineError || qualityError || heatmapError || trendError


  if (isLoading || isError || !userActivity || !progress || !timeline || !quality || !heatmap || !trend) {
    return (
      <>
        <QueryState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          loadingMessage="Loading user activity ..."
          errorMessage="Failed to fetch user activity. Please try again."
        />
      </>
    )
  }

  console.log(trend)

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
