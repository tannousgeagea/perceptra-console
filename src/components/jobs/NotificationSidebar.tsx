import { Bell, Clock, User, Package, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FC, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/ui/badge";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { useUserJobs } from "@/hooks/useUserJobs";
import { Job, JobStatus } from "@/types/jobs";
import { cn } from "@/lib/utils";

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.ASSIGNED:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case JobStatus.IN_REVIEW:
      return "bg-purple-100 text-purple-800 border-purple-200";
    case JobStatus.COMPLETED:
      return "bg-green-100 text-green-800 border-green-200";
    case JobStatus.UNASSIGNED:
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
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
    navigate(`/projects/${job.projectId}/annotate/job/${job.id}`);
  };

  return (
    <div
      className="cursor-pointer p-3 border border-transparent rounded hover:bg-slate-100 transition"
      onClick={handleJobClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{job.name}</h4>
          {job.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {job.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <Badge
          variant="outline"
          className={cn("text-xs", getStatusColor(job.status))}
        >
          {getStatusLabel(job.status)}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Package size={12} />
          <span>{job.imageCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
        <Clock size={12} />
        <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-3 p-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-6 text-center">
    <Bell className="h-12 w-12 text-muted-foreground mb-3" />
    <h3 className="font-medium text-sm mb-1">No assigned jobs</h3>
    <p className="text-xs text-muted-foreground">
      You don't have any jobs assigned to you at the moment.
    </p>
  </div>
);

export const NotificationSidebar: FC = () => {
  const { data: jobs, isLoading, error } = useUserJobs();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="fixed top-0 right-0 w-[300px] h-full bg-white shadow-lg border-r border-slate-200 z-50 flex flex-col mb-6">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-700" />
              <h2 className="font-semibold text-sm text-slate-700 px-1 py-4">My Assigned Jobs</h2>
              {jobs && jobs.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {jobs.length}
                </Badge>
              )}
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 px-4 py-4 text-xs text-slate-500 font-semibold">
              <User className="h-3 w-3" />
              Current Tasks
            </div>

            <div className="flex-1 overflow-auto max-h-[calc(100vh-100px)] pb-6">
              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-red-600">Failed to load jobs</p>
                </div>
              ) : !jobs || jobs.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="p-2 space-y-1">
                  {jobs.map((job) => (
                    <JobItem key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          className="fixed top-4 right-4 z-50 bg-yellow-300 p-2 rounded shadow hover:bg-yellow-500 transition"
          onClick={() => setIsOpen(true)}
        >
          <Bell className="h-6 w-6 text-white" />
          {jobs && jobs.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
              {jobs.length}
            </span>
          )}
        </button>
      )}
    </>
  );
};
