import { Eye, UserPlus, UserX, FileText, Scissors } from "lucide-react";
import { Job, JobStatus, allowedStatusTransitions } from "@/types/jobs";
import { Button } from "@/components/ui/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { renderProgressBar } from "./ui/JobProgress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/ui/dropdown-menu";

interface JobCardProps {
  job: Job;
  onAssignJob: (job: Job) => void;
  onViewJob: (job: Job) => void;
  onSplitJob?: (job: Job) => void;
  onStatusChange?: (job: Job, newStatus: JobStatus) => void;
  onEditJob?: (job: Job) => void;
  onDeleteJob?: (job: Job) => void;
}

const JobCard = ({ job, onAssignJob, onViewJob, onSplitJob, onStatusChange, onEditJob, onDeleteJob }: JobCardProps) => {
  // Get available status transitions for current job
  const availableTransitions = allowedStatusTransitions
    .find(transition => transition.from === job.status)
    ?.to || [];

// Status badge mapping
const getStatusBadge = (status: JobStatus) => {
  switch (status) {
    case JobStatus.UNASSIGNED:
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Unassigned</Badge>;
    case JobStatus.ASSIGNED:
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Assigned</Badge>;
    case JobStatus.IN_REVIEW:
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">In Review</Badge>;
    case JobStatus.COMPLETED:
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
  }
};

  // Show slice info if this is a split job
  const renderSliceInfo = () => {
    if (job.sliceNumber !== undefined && job.parentJobId) {
      return (
        <div className="mt-2 flex items-center">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            Slice #{job.sliceNumber}
          </span>
        </div>
      );
    }
    return null;
  };


  return (
    <Card className="flex flex-col h-full animate-fade-in bg-white hover:shadow-md transition-shadow duration-200">
      <CardContent className="flex-1 p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="max-w-[25%]">
            <h3 className="font-medium text-sm text-slate-00 truncate">{job.name}</h3>
            <p className="text-xs text-slate-500">ID: {job.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {availableTransitions.length > 0 && onStatusChange && (
              <Select
                value={job.status}
                onValueChange={(value) => onStatusChange(job, value as JobStatus)}
              >
                <SelectTrigger className="h-8 w-[125px]">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={job.status}>
                    Current: {job.status.replace(/_/g, ' ').toLowerCase()}
                  </SelectItem>
                  {availableTransitions.map((status) => (
                    <SelectItem key={status} value={status}>
                      Move to: {status.replace(/_/g, ' ').toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {getStatusBadge(job.status)}
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Images:</span>
            <span className="text-sm font-medium">{job.image_count}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Created:</span>
            <span className="text-sm">{formatDistanceToNow(job.created_at, { addSuffix: true })}</span>
          </div>
          {renderProgressBar(job)}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Assigned to:</span>
            {job.assignedUser ? (
              <span className="text-sm font-medium">{job.assignedUser.username}</span>
            ) : (
              <span className="text-sm italic text-slate-400">None</span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="mt-auto p-4 pt-2 flex justify-between gap-2 border-t border-slate-100">
        <TooltipProvider>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onViewJob(job)}>
                  <Eye size={16} className="text-slate-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Images</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <FileText size={16} className="text-slate-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>

            {onSplitJob && job.image_count >= 2 && job.status === JobStatus.UNASSIGNED && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => onSplitJob(job)}
                    >
                      <Scissors size={16} className="text-slate-700" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Split Job</p>
                  </TooltipContent>
                </Tooltip>
              )}

            {(onEditJob || onDeleteJob) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <span className="text-slate-700">⋯</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {onEditJob && (
                    <DropdownMenuItem onClick={() => onEditJob(job)}>
                      Edit Job
                    </DropdownMenuItem>
                  )}
                  {onDeleteJob && (
                    <DropdownMenuItem 
                      onClick={() => onDeleteJob(job)}
                      className="text-red-600 focus:text-red-600"
                    >
                      Delete Job
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={() => onAssignJob(job)}
                >
                  {job.assignedUser ? (
                    <>
                      <UserX size={15} className="mr-1" />
                      <span>Reassign</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} className="mr-1" />
                      <span>Assign</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{job.assignedUser ? "Reassign Job" : "Assign Job"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default JobCard;