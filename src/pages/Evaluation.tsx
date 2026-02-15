import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import { Button } from "@/components/ui/ui/button";
import { Badge } from "@/components/ui/ui/badge";
import {
  LayoutDashboard,
  TrendingUp,
  Bell,
  Brain,
  ArrowLeft,
  Download,
  RefreshCw,
} from "lucide-react";
import { EvaluationOverview } from "@/components/evaluation/EvaluationOverview";
import { TemporalAnalysis } from "@/components/evaluation/TemporalAnalysis";
import { AlertsManagement } from "@/components/evaluation/AlertsManagement";
import { ActiveLearning } from "@/components/evaluation/ActiveLearning";
import { useEvaluationData } from "@/hooks/useEvaluationData";
import { cn } from "@/lib/utils";

const Evaluation = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const {
    isLoading,
    summary,
    classMetrics,
    editDistribution,
    trends,
    anomalies,
    alerts,
    thresholds,
    priorityImages,
    fetchTrends,
    acknowledgeAlert,
    updateThresholds,
    generatePriorityQueue,
  } = useEvaluationData();

  const unacknowledgedCount = alerts.filter((a) => !a.is_acknowledged).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Evaluation Dashboard</h1>
                <p className="text-muted-foreground">
                  Monitor model performance and manage reviews
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="temporal" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2 relative">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
              {unacknowledgedCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unacknowledgedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active-learning" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Active Learning</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <EvaluationOverview
              summary={summary}
              classMetrics={classMetrics}
              editDistribution={editDistribution}
            />
          </TabsContent>

          <TabsContent value="temporal" className="space-y-6">
            <TemporalAnalysis
              trends={trends}
              anomalies={anomalies}
              onRangeChange={fetchTrends}
            />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsManagement
              alerts={alerts}
              thresholds={thresholds}
              onAcknowledge={acknowledgeAlert}
              onUpdateThresholds={updateThresholds}
            />
          </TabsContent>

          <TabsContent value="active-learning" className="space-y-6">
            <ActiveLearning
              priorityImages={priorityImages}
              isLoading={isLoading}
              onGenerateQueue={generatePriorityQueue}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Evaluation;
