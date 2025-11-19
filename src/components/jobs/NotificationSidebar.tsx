import { Bell, Clock, Package, X, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import { ScrollArea } from "@/components/ui/ui/scroll-area";
import { Job, JobStatus } from "@/types/jobs";
import { cn } from "@/lib/utils";

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
}

const JobItem: FC<JobItemProps> = ({ job }) => {
  const navigate = useNavigate();

  const handleJobClick = () => {
    navigate(`/projects/${job.project_id}/annotate/job/${job.id}`);
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
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", getStatusColor(job.status))}
        >
          {getStatusLabel(job.status)}
        </Badge>
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

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
}

export const NotificationSidebar: FC<NotificationSidebarProps> = ({
  isOpen,
  onClose,
  jobs,
}) => {
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
              <h2 className="font-semibold text-base text-foreground">My Jobs</h2>
              <p className="text-xs text-muted-foreground">
                {activeJobs.length} active {activeJobs.length === 1 ? "job" : "jobs"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Jobs List */}
        <ScrollArea className="flex-1">
          {jobs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-border">
              {jobs.map((job) => (
                <JobItem key={job.id} job={job} />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {jobs.length > 0 && (
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
