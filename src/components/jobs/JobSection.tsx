import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/ui/button";
import JobCard from "@/components/jobs/JobCard";
import { Job, JobStatus } from "@/types/jobs";

interface JobsSectionProps {
  title: string;
  description: string;
  jobs: Job[];
  status: JobStatus;
  onAssignJob: (job: Job) => void;
  onViewJob: (job: Job) => void;
  onSplitJob?: (job: Job) => void;
  onStatusChange?: (job: Job, newStatus: JobStatus) => void;
  onEditJob?: (job: Job) => void;
  onDeleteJob?: (job: Job) => void;
  
}

const JobsSection = ({ title, description, jobs, status, onAssignJob, onViewJob, onSplitJob, onStatusChange, onEditJob, onDeleteJob }: JobsSectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle horizontal scrolling
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Get status-specific styling
  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.UNASSIGNED:
        return "border-amber-300";
      case JobStatus.ASSIGNED:
        return "border-blue-300";
      case JobStatus.IN_REVIEW:
        return "border-purple-300";
      case JobStatus.COMPLETED:
        return "border-green-300";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <div className={`w-2 h-5 mr-2 rounded ${getStatusColor(status)}`}></div>
            {title}
          </h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        
        {jobs.length > 3 && (
          <div className="flex gap-1 mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => scroll("left")}
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => scroll("right")}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-500">No jobs in this category</p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto pb-3 -mx-1 px-1"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="flex gap-4" style={{ minWidth: "min-content" }}>
            {jobs.map((job) => (
              <div key={job.id} className="w-[320px] flex-shrink-0">
                <JobCard 
                  job={job} 
                  onAssignJob={onAssignJob} 
                  onViewJob={onViewJob}
                  onSplitJob={onSplitJob}
                  onStatusChange={onStatusChange}
                  onEditJob={onEditJob}
                  onDeleteJob={onDeleteJob}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsSection;