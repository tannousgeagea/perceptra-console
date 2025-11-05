
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
import { useAssignJob, useUnassignJob, useUpdateJob, useSplitJob, useDeleteJob } from '@/hooks/useJobs';
import SplitJobModal from "@/components/jobs/SplitJobModal";
import EditJobModal from "@/components/jobs/EditJobodal";
import DeleteJobModal from "@/components/jobs/DeleteJobModal";
// import { useDeleteJob } from "@/hooks/useDeleteJob";
import { JobsHeader } from "@/components/jobs/JobsHeader";
import { toast } from 'sonner';

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
  const { data: jobs, isLoading, error, refetch } = useProjectJobs(projectId || '');
  const { mutate: assignJob } = useAssignJob(projectId!);
  const { mutate: unassignJob } = useUnassignJob(projectId!);
  const { mutate: updateJob, isPending } = useUpdateJob(projectId!);
  const { mutate: splitJob, isPending: splitPending } = useSplitJob(projectId!);
  const { mutate: deleteJob, isPending: deletePending } = useDeleteJob(projectId!);

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
    toast.info("This would redirect to annotation page.");
    navigate(`/projects/${projectId}/annotate/job/${job.id}`)
  }

  const handleAssignUser = async (job: Job, userId: string | null) => {
    if (!job.id) return;
    if (!userId) {
      unassignJob(job.id)
      return
    }

    try {
      await assignJob({ jobId: job.id, assigneeId: userId});
      setIsAssignModalOpen(false);
      
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    }
  };


  const handleStatusChange = (job: Job, newStatus: JobStatus) => {
      updateJob({
      jobId: job.id,
      payload: { status: newStatus },
    });
  };
  

  // Split a job into multiple slices
  const handleSplitJob = (job: Job, numberOfSlices: number, userAssignments: (string | null)[]) => {
    try {
      if (!job.id) {
        toast.error('Job Id is undefined');
        return;
      };
      if (job.imageCount < numberOfSlices) {
        toast.error("Cannot split a job into more slices than it has images");
        return;
      }
    
      splitJob({
        jobId: job.id,
        payload: {
          number_of_slices: numberOfSlices,
          user_assignments: userAssignments,
        },
      });
      
    } catch (error: any) {
      toast.error(error.message || "Failed to split Job");
    }
  };

  const handleEditJob = (job: Job, newName: string, newDescription?: string) => {
    updateJob({
      jobId: job.id,
      payload: {
        name: newName,
        description: newDescription,
      },
    });
  };

  const handleDeleteJob = (job: Job) => {
    if (!job.id) {
      toast.error('Job Id is undefined');
      return;
    };
    deleteJob({ jobId: job.id, hardDelete: false });
  };

  return (
    <div className="space-y-6 p-6 w-full">
      <JobsHeader 
        projectId={projectId!}
        totalJobs={jobs?.length || 0}
        reviewedJobs={jobsByStatus.inReview.length}
        processingJobs={jobsByStatus.assigned.length}
        onRefresh={refetch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

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
          isLoading={isPending}
        />
      )}


      {selectedJob && (
        <DeleteJobModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          job={selectedJob}
          onDelete={handleDeleteJob}
          isLoading={deletePending}
        />
      )}
  
    </div>
  );
};

export default JobPage;