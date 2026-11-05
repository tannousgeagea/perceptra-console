import { Bell, Clock, Inbox, MessageSquareWarning, Package, X, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FC, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { noticeScope, useNotificationStore, type Notice } from "@/stores/notificationStore";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import { ScrollArea } from "@/components/ui/ui/scroll-area";
import { Job, JobStatus } from "@/types/jobs";
import { cn } from "@/lib/utils";
import { toFixUrl, useUserJobs } from "@/hooks/useUserJobs";

const EMPTY: Notice[] = [];

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.ASSIGNED:
      return "bg-primary/10 text-primary border-primary/20";
    case JobStatus.IN_REVIEW:
      return "bg-warning/10 text-warning border-warning/20";
    case JobStatus.COMPLETED:
      return "bg-success/10 text-success border-success/20";
    case JobStatus.UNASSIGNED:
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getStatusLabel = (status: JobStatus) => {
  switch (status) {
    case JobStatus.ASSIGNED:
      return "Assigned";
    case JobStatus.IN_REVIEW:
      return "In Review";
    case JobStatus.COMPLETED:
      return "Completed";
    case JobStatus.UNASSIGNED:
      return "Unassigned";
    default:
      return status;
  }
};

interface JobItemProps {
  job: Job;
  onOpened?: () => void;
}

const JobItem: FC<JobItemProps> = ({ job, onOpened }) => {
  const navigate = useNavigate();
  const toFix = job.to_fix ?? 0;

  // Work sent back first: open straight on the "Needs fixes" tab.
  const handleJobClick = () => {
    onOpened?.();
    navigate(toFix > 0 ? toFixUrl(job) : `/projects/${job.project_id}/annotate/job/${job.id}`);
  };

  return (
    <div
      className="group cursor-pointer p-4 border-b border-border hover:bg-accent/5 transition-colors"
      onClick={handleJobClick}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate mb-1">
            {job.name}
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            {job.project_name}
          </p>
          {job.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {job.description}
            </p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", getStatusColor(job.status))}
          >
            {getStatusLabel(job.status)}
          </Badge>
          {toFix > 0 && (
            <Badge variant="destructive" className="text-xs font-medium">
              {toFix} to fix
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span>{job.image_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center h-full">
    <div className="rounded-full bg-muted p-4 mb-4">
      <Bell className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="font-semibold text-sm mb-2 text-foreground">No assigned jobs</h3>
    <p className="text-xs text-muted-foreground max-w-[200px]">
      You don't have any jobs assigned to you at the moment.
    </p>
  </div>
);

const NoticeItem: FC<{ notice: Notice; onOpen: (notice: Notice) => void }> = ({ notice, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(notice)}
    className={cn(
      "flex w-full gap-3 border-b border-border p-4 text-left transition-colors hover:bg-accent/5",
      !notice.read && "bg-primary/5"
    )}
  >
    <div
      className={cn(
        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        notice.kind === "sent_back" ? "bg-rose-500/10 text-rose-600" : "bg-primary/10 text-primary"
      )}
    >
      {notice.kind === "sent_back" ? <MessageSquareWarning className="h-4 w-4" /> : <Inbox className="h-4 w-4" />}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-sm text-foreground", !notice.read && "font-semibold")}>{notice.title}</p>
        {!notice.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
      </div>
      {notice.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{notice.description}</p>}
      <p className="mt-1 text-[11px] text-muted-foreground">{formatDistanceToNow(notice.at, { addSuffix: true })}</p>
    </div>
  </button>
);

/**
 * App-wide panel (opened from the nav bell): recent notices (new jobs, work
 * sent back), kept in this browser, and the jobs assigned to the user.
 */
export const NotificationSidebar: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrganization } = useCurrentOrganization();
  const scope = noticeScope(user?.id, currentOrganization?.id);
  const isOpen = useNotificationStore((s) => s.open);
  const setOpen = useNotificationStore((s) => s.setOpen);
  const notices = useNotificationStore((s) => (scope ? s.byScope[scope] : undefined)) ?? EMPTY;
  const { markAllRead, markRead, clear } = useNotificationStore.getState();
  const { data } = useUserJobs();
  const jobs = data ?? [];
  const unread = notices.filter((n) => !n.read).length;
  const [tab, setTab] = useState<"notifications" | "jobs">("notifications");
  const onClose = () => setOpen(false);

  // Open where there is something new.
  useEffect(() => {
    if (isOpen) setTab(unread > 0 ? "notifications" : "jobs");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the panel opens
  }, [isOpen]);

  const openNotice = (notice: Notice) => {
    if (scope) markRead(scope, notice.id);
    onClose();
    if (notice.url) navigate(notice.url);
  };

  const activeJobs = jobs.filter(
    (job) => job.status === JobStatus.ASSIGNED || job.status === JobStatus.IN_REVIEW
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[380px] bg-card border-l border-border z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-foreground">Notifications</h2>
              <p className="text-xs text-muted-foreground">
                {unread > 0 ? `${unread} unread · ` : ""}
                {activeJobs.length} active {activeJobs.length === 1 ? "job" : "jobs"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border px-4 py-2 text-sm">
          {([
            ["notifications", `Notifications${unread ? ` (${unread})` : ""}`],
            ["jobs", `My jobs (${jobs.length})`],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-md px-2.5 py-1",
                tab === id ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
          {tab === "notifications" && notices.length > 0 && scope && (
            <div className="ml-auto flex gap-2 text-xs">
              {unread > 0 && (
                <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => markAllRead(scope)}>
                  Mark all read
                </button>
              )}
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => clear(scope)}>
                Clear
              </button>
            </div>
          )}
        </div>

        {tab === "notifications" ? (
          <ScrollArea className="flex-1">
            {notices.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">You're all caught up</h3>
                <p className="max-w-[220px] text-xs text-muted-foreground">
                  New jobs and work sent back to you show up here.
                </p>
              </div>
            ) : (
              notices.map((notice) => <NoticeItem key={notice.id} notice={notice} onOpen={openNotice} />)
            )}
          </ScrollArea>
        ) : (
        <ScrollArea className="flex-1">
          {jobs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-border">
              {/* Jobs with work sent back come first (stable otherwise). */}
              {[...jobs]
                .sort((a, b) => Number((b.to_fix ?? 0) > 0) - Number((a.to_fix ?? 0) > 0))
                .map((job) => (
                  <JobItem key={job.id} job={job} onOpened={onClose} />
                ))}
            </div>
          )}
        </ScrollArea>
        )}

        {/* Footer */}
        {tab === "jobs" && jobs.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/30">
            <p className="text-xs text-center text-muted-foreground">
              Showing {jobs.length} total {jobs.length === 1 ? "job" : "jobs"}
            </p>
          </div>
        )}
      </div>
    </>
  );
};
