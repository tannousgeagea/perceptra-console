
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/ui/input";
import JobsSection from "@/components/jobs/JobSection";
import AssignUserModal from "@/components/jobs/AssignUserModel";
import { Job, JobStatus } from "@/types/jobs";
import { useProjectJobs } from "@/hooks/useProjectJobs";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { useAssignUserToJob } from "@/hooks/useAssignUserToJob";
import { useJobStatusUpdate } from "@/hooks/useJobStatusUpdate";
import SplitJobModal from "@/components/jobs/SplitJobModal";
import EditJobModal from "@/components/jobs/EditJobodal";
import DeleteJobModal from "@/components/jobs/DeleteJobModal";
import { useSplitJob } from '@/hooks/useSplitJob';
import { useEditJob } from "@/hooks/useEditJob";
import { useDeleteJob } from "@/hooks/useDeleteJob";
import { toast } from '@/hooks/use-toast';

const JobPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: users } = useProjectMembers(projectId || '')
  const { data: jobs, isLoading, error } = useProjectJobs(projectId || '');
  const assignUserToJob = useAssignUserToJob(projectId || '');
  const { mutate: updateStatus } = useJobStatusUpdate(projectId || '');
  const { mutateAsync: splitJob } = useSplitJob(projectId || '');
  const { mutate: editJob, isPending: editJobPending, error: errorEditjob } = useEditJob(projectId || '');
  const { mutate: deleteJob, isPending: deleteJobPending } = useDeleteJob(projectId || '');


  if (isLoading || !jobs) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 w-full">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-700 text-sm">Loading Jobs ...</div>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red">Error Loading Project jobs</div>;
  }

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(
    (job) =>
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.assignedUser?.username.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  // Group jobs by status
  const jobsByStatus = {
    unassigned: filteredJobs.filter((job) => job.status === JobStatus.UNASSIGNED),
    assigned: filteredJobs.filter((job) => job.status === JobStatus.ASSIGNED),
    inReview: filteredJobs.filter((job) => job.status === JobStatus.IN_REVIEW),
    completed: filteredJobs.filter((job) => job.status === JobStatus.COMPLETED),
  };

  // Open the assign modal
  const handleOpenAssignModal = (job: Job) => {
    setSelectedJob(job);
    setIsAssignModalOpen(true);
  };

  // Open the split job modal
  const handleOpenSplitModal = (job: Job) => {
    setSelectedJob(job);
    setIsSplitModalOpen(true);
  };

  const handleOpenEditModal = (job: Job) => {
    setSelectedJob(job);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteModalOpen(true);
  }


  const handleViewJob = (job: Job) => {
    toast({
      title: "Redirecting",
      description: "This would redirect to annotation page.",
    });
    navigate(`/projects/${projectId}/annotate/job/${job.id}`)
  }

  const handleAssignUser = async (job: Job, userId: string | null) => {
    try {
      await assignUserToJob(job.id, userId);
      toast({
        title: "User assignment updated!",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to assign user.")
      toast({
        title: "Failed to assign user.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (job: Job, newStatus: JobStatus) => {
    updateStatus(
      { jobId: job.id, newStatus },
      {
        onSuccess: () => {
          toast({
            title: "Status Updated",
            description:
              newStatus === JobStatus.IN_REVIEW
                ? "Job moved to review"
                : newStatus === JobStatus.COMPLETED
                ? "Job marked as completed"
                : `Job status updated to ${newStatus}`,
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };
  

  // Split a job into multiple slices
  const handleSplitJob = (job: Job, numberOfSlices: number, userAssignments: (string | null)[]) => {
    try {
      if (job.imageCount < numberOfSlices) {
        toast({
          title: "Error splitting job",
          description: "Cannot split a job into more slices than it has images",
          variant: "destructive",
        });
        return;
      }
    
      const newJobs = splitJob({
        jobId: job.id,
        numberOfSlices,
        userAssignments,
      });
      
      toast({
        title: "Job split successfully",
        description: `${job.name} has been split into ${numberOfSlices} slices.`,
      });
    } catch (error: any) {
      toast({
        title: 'Split failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditJob = (job: Job, newName: string, newDescription?: string) => {
    editJob(
      {
        jobId: job.id,
        name: newName,
        description: newDescription,
      },
      {
        onSuccess: (updatedJob) => {
          toast({
            title: "Job updated",
            description: `"${updatedJob.name}" has been updated successfully.`,
          });
          setIsEditModalOpen(false);
        },
        onError: (err: any) => {
          toast({
            title: "Update failed",
            description: err.message || "Something went wrong.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeleteJob = (job: Job) => {
    deleteJob(job.id, {
      onSuccess: () => {
        toast({
          title: "Job deleted",
          description: `"${job.name}" has been deleted successfully.`,
        });
        setIsDeleteModalOpen(false);
      },
      onError: (err: any) => {
        toast({
          title: "Delete failed",
          description: err.message || "Something went wrong.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-6 p-6 w-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Pre-Annotation Management</h1>
              <p className="text-slate-500">Manage and assign jobs before annotation</p>
            </div>
            
            {/* Search bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Search jobs, users..."
                className="pl-9 bg-slate-100 border-slate-200 focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-8">
          {/* Job Sections */}
          <div className="flex flex-col gap-8">
            <JobsSection
              title="Unassigned"
              description={`${jobsByStatus.unassigned.length} jobs waiting for assignment`}
              jobs={jobsByStatus.unassigned}
              status={JobStatus.UNASSIGNED}
              onAssignJob={handleOpenAssignModal}
              onViewJob={handleViewJob}
              onStatusChange={handleStatusChange}
              onSplitJob={handleOpenSplitModal}
              onEditJob={handleOpenEditModal}
              onDeleteJob={handleOpenDeleteModal}
            />
            
            <JobsSection
              title="Assigned"
              description={`${jobsByStatus.assigned.length} jobs in progress`}
              jobs={jobsByStatus.assigned}
              status={JobStatus.ASSIGNED}
              onAssignJob={handleOpenAssignModal}
              onViewJob={handleViewJob}
              onStatusChange={handleStatusChange}
              onSplitJob={handleOpenSplitModal}
              onEditJob={handleOpenEditModal}
              onDeleteJob={handleOpenDeleteModal}
            />
            
            <JobsSection
              title="In Review"
              description={`${jobsByStatus.inReview.length} jobs waiting for review`}
              jobs={jobsByStatus.inReview}
              status={JobStatus.IN_REVIEW}
              onAssignJob={handleOpenAssignModal}
              onViewJob={handleViewJob}
              onStatusChange={handleStatusChange}
              onEditJob={handleOpenEditModal}
              onDeleteJob={handleOpenDeleteModal}
            />
            
            <JobsSection
              title="Completed"
              description={`${jobsByStatus.completed.length} jobs completed`}
              jobs={jobsByStatus.completed}
              status={JobStatus.COMPLETED}
              onAssignJob={handleOpenAssignModal}
              onViewJob={handleViewJob}
              onStatusChange={handleStatusChange}
              onEditJob={handleOpenEditModal}
              onDeleteJob={handleOpenDeleteModal}
            />
          </div>
        </div>
      </main>

      {/* Assign User Modal */}
      {selectedJob && (
        <AssignUserModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          job={selectedJob}
          users={users || []}
          onAssign={handleAssignUser}
        />
      )}

      {selectedJob && (
        <SplitJobModal
          isOpen={isSplitModalOpen}
          onClose={() => setIsSplitModalOpen(false)}
          job={selectedJob}
          users={users || []}
          onSplitJob={handleSplitJob}
        />
      )}

      {selectedJob && (
        <EditJobModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          job={selectedJob}
          onSave={handleEditJob}
          isLoading={editJobPending}
        />
      )}


      {selectedJob && (
        <DeleteJobModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          job={selectedJob}
          onDelete={handleDeleteJob}
          isLoading={deleteJobPending}
        />
      )}
  
    </div>
  );
};

export default JobPage;