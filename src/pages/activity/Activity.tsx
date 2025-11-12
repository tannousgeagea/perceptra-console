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
import { useUserActivitySummary, useProjectProgress } from "@/hooks/useActivity";

import QueryState from "@/components/common/QueryState";
import {
  mockUserSummary,
  mockProjectProgress,
  mockLeaderboard,
  mockTimeline,
  mockPredictionQuality,
  mockActivityHeatmap,
  mockActivityTrend,
} from "@/components/activity/mockData";

const ActivityPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: userActivity, isLoading: userActivityLoading, isError: userActivityError, refetch } = useUserActivitySummary("1");
  // const { data: progress, isLoading: progressLoading, isError: progressError } = useProjectProgress(projectId!);

  const isLoading = userActivityLoading //|| progressLoading
  const isError = userActivityError //|| progressError

  if (isLoading || isError || !userActivity) {
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
            projectProgress={mockProjectProgress}
            activityTrend={mockActivityTrend}
          />
        )}
        {activeTab === "user" && <UserActivityTab userSummary={mockUserSummary} />}
        {activeTab === "leaderboard" && (
          <LeaderboardTab leaderboard={mockLeaderboard} />
        )}
        {activeTab === "quality" && (
          <PredictionQualityTab predictionQuality={mockPredictionQuality} />
        )}
        {activeTab === "timeline" && <TimelineTab timeline={mockTimeline} />}
        {activeTab === "heatmap" && <HeatmapTab heatmap={mockActivityHeatmap} />}
      </main>
    </div>
  );
};

export default ActivityPage;
