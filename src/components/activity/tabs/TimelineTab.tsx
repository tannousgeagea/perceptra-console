import { Tag, Eye, Image, Activity } from "lucide-react";
import { Card } from "@/components/ui/ui/card";
import { Button } from "@/components/ui/ui/button";
import type { TimelineEvent } from "@/types/activity";

interface TimelineTabProps {
  timeline: TimelineEvent[];
}

export const TimelineTab = ({ timeline }: TimelineTabProps) => {
  const getEventIcon = (eventType: string) => {
    if (eventType.includes("annotation")) return Tag;
    if (eventType.includes("review")) return Eye;
    if (eventType.includes("image")) return Image;
    return Activity;
  };

  const getEventColor = (eventType: string) => {
    if (eventType.includes("annotation"))
      return "bg-primary-light text-primary";
    if (eventType.includes("review")) return "bg-success-light text-success";
    if (eventType.includes("prediction"))
      return "bg-warning-light text-warning";
    if (eventType.includes("finalize")) return "bg-warning-light text-warning";
    return "bg-muted text-muted-foreground";
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - then.getTime()) / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h3>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              All Events
            </Button>
            <Button variant="ghost" size="sm">
              Annotations
            </Button>
            <Button variant="ghost" size="sm">
              Reviews
            </Button>
          </div>
        </div>
      </Card>

      {/* Timeline Events */}
      <Card>
        <div className="divide-y divide-border">
          {timeline.map((event) => {
            const EventIcon = getEventIcon(event.event_type);
            return (
              <div
                key={event.event_id}
                className="p-6 hover:bg-muted/50 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getEventColor(
                      event.event_type
                    )}`}
                  >
                    <EventIcon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          <span className="font-semibold">{event.user}</span>{" "}
                          <span className="text-muted-foreground">
                            {formatEventType(event.event_type).toLowerCase()}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          in {event.project}
                        </p>
                        {Object.keys(event.metadata).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center px-2 py-1 bg-muted text-xs text-muted-foreground rounded"
                              >
                                <span className="font-medium">{key}:</span>
                                <span className="ml-1">{String(value)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {getTimeAgo(event.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Load More */}
      <div className="text-center">
        <Button>Load More Events</Button>
      </div>
    </div>
  );
};
