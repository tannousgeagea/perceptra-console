import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/ui/card";
import { Button } from "@/components/ui/ui/button";
import { Badge } from "@/components/ui/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/ui/collapsible";
import { AlertCircle, AlertTriangle, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert } from "@/types/evaluation";
import { useParams } from "react-router-dom";
import { useProjectPermissions } from "@/hooks/usePermissions";
import { AlertThresholdsCard } from "./AlertThresholdsCard";

interface AlertsManagementProps {
  alerts: Alert[];
  onAcknowledge: (alertId: number) => void;
}

export const AlertsManagement = ({
  alerts,
  onAcknowledge,
}: AlertsManagementProps) => {
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  // Acknowledging an alert: the reviewer role or above in the project (server rule).
  const { projectId } = useParams<{ projectId: string }>();
  const permissions = useProjectPermissions(projectId);
  const cannotAcknowledge = !permissions.isLoading && !permissions.can('review');

  const activeAlerts = alerts.filter((a) => !a.is_acknowledged);
  const acknowledgedAlerts = alerts.filter((a) => a.is_acknowledged);

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Active Alerts
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive">{activeAlerts.length} unacknowledged</Badge>
                )}
              </CardTitle>
              <CardDescription>Alerts requiring attention</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
              No active alerts
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border",
                    alert.severity === "critical"
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-yellow-500/50 bg-yellow-500/5"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {alert.severity === "critical" ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {new Date(alert.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span>
                        {new Date(alert.created_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Threshold: {(alert.threshold * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAcknowledge(alert.id)}
                    disabled={cannotAcknowledge}
                    title={cannotAcknowledge ? "Acknowledging alerts needs the reviewer role in this project" : undefined}
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acknowledged Alerts */}
      <Collapsible open={showAcknowledged} onOpenChange={setShowAcknowledged}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Acknowledged Alerts
                    <Badge variant="secondary">{acknowledgedAlerts.length}</Badge>
                  </CardTitle>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    showAcknowledged && "rotate-180"
                  )}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {acknowledgedAlerts.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No acknowledged alerts
                </p>
              ) : (
                <div className="space-y-2">
                  {acknowledgedAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex-shrink-0">
                        {alert.severity === "critical" ? (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <AlertThresholdsCard projectId={projectId} />
    </div>
  );
};
