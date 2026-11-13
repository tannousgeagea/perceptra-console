import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TabButton } from "@/components/activity/TabButton";
import { OrgOverviewTab } from "@/components/activity/tabs/OrgOverviewTab";
import { OrgUsersTab } from "@/components/activity/tabs/OrgUsersTab";
import { OrgProjectsTab } from "@/components/activity/tabs/OrgProjectTab";
import { LeaderboardTab } from "@/components/activity/tabs/LeaderboardTab";
import { TimelineTab } from "@/components/activity/tabs/TimelineTab";
import { HeatmapTab } from "@/components/activity/tabs/HeatmapTab";
import { 
  useOrgActivitySummary, 
  useOrgProjectsProgress, 
  useOrgLeaderboard,
  useOrgTimeline,
  useOrgHeatmap,
  useOrgActivityTrend,
  useOrgUsersActivity
} from "@/hooks/useActivity";
import { DateRange } from "react-day-picker";
import QueryState from "@/components/common/QueryState";
import { FilterBar } from "@/components/activity/FilterBar";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { toast } from "sonner";
import {
  exportToCSV,
  exportToPDF,
  prepareLeaderboardForExport,
} from "@/utils/exportUtils";

const OrgActivityPage = () => {
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

  const { data: orgSummary, isLoading: orgSummaryLoading, isError: orgSummaryError, refetch } = useOrgActivitySummary({
    startDate: appliedStartDate,
    endDate: appliedEndDate
  });
  const { data: userActivity, isLoading: userActivityLoading, isError: userActivityError } = useOrgUsersActivity({ 
    sortBy: 'total_annotations',
    startDate: appliedStartDate,
    endDate: appliedEndDate, 
  });
  const { data: projects, isLoading: projecstLoading, isError: projectsError } = useOrgProjectsProgress({ status: 'active' });
  const { data: leaderboard, isLoading: leaderboardLoading, isError: leaderboardError } = useOrgLeaderboard();
  const { data: timeline, isLoading: timelineLoading, isError: timelineError } = useOrgTimeline({ 
    limit: 15,
    startDate: appliedStartDate,
    endDate: appliedEndDate, 
  });


  const { data: heatmap, isLoading: heatmapLoading, isError: heatmapError } = useOrgHeatmap(
    appliedStartDate, appliedEndDate
  );
  const { data: trend, isLoading: trendLoading, isError: trendError } = useOrgActivityTrend();

  const { isEnabled, lastUpdated, isRefreshing, toggleAutoRefresh, manualRefresh } = useAutoRefresh(
    refetch,
    30 // 30 seconds
  );

  const isLoading = userActivityLoading || orgSummaryLoading || projecstLoading || leaderboardLoading || timelineLoading || heatmapLoading || trendLoading
  const isError = userActivityError || orgSummaryError || projectsError || leaderboardError || timelineError || heatmapError || trendError


  if (isLoading || isError || !userActivity || !orgSummary || !projects || !timeline || !heatmap || !trend) {
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
          <PageHeader
            className="py-4"
            title="Activity"
            description="Team progress, quality metrics and contributions across the organization"
            actions={
              <>
                <Link to="/projects">
                  <button className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <FolderKanban className="w-4 h-4" />
                    Manage Projects
                  </button>
                </Link>
                <Link to="/billing">
                  <button className="px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Billing
                  </button>
                </Link>
              </>
            }
          />



          {/* Tabs */}
          <nav className="flex gap-1 overflow-x-auto" aria-label="Dashboard tabs">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </TabButton>
            <TabButton
              active={activeTab === "user"}
              onClick={() => setActiveTab("user")}
            >
              Users
            </TabButton>
            <TabButton
              active={activeTab === "projects"}
              onClick={() => setActiveTab("projects")}
            >
              Projects
            </TabButton>
            <TabButton
              active={activeTab === "leaderboard"}
              onClick={() => setActiveTab("leaderboard")}
            >
              Leaderboard
            </TabButton>
            <TabButton
              active={activeTab === "timeline"}
              onClick={() => setActiveTab("timeline")}
            >
              Timeline
            </TabButton>
            <TabButton
              active={activeTab === "heatmap"}
              onClick={() => setActiveTab("heatmap")}
            >
              Heatmap
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
          <OrgOverviewTab
            orgSummary={orgSummary}
            activityTrend={trend}
          />
        )}
        {activeTab === "user" &&  <OrgUsersTab users={userActivity} />}
        {activeTab === "projects" && (
          <OrgProjectsTab projects={projects} />
        )}
        {activeTab === "leaderboard" && (
          <LeaderboardTab leaderboard={leaderboard!} />
        )}
        {activeTab === "timeline" && <TimelineTab timeline={timeline} />}
        {activeTab === "heatmap" && <HeatmapTab heatmap={heatmap} />}
      </main>
    </div>
  );
};

export default OrgActivityPage;
