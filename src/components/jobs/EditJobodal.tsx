
import { useState } from "react";
import CustomDialog from "./ui/dialog";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Job } from "@/types/jobs";
import { Loader } from "lucide-react";

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onSave: (job: Job, newName: string, newDescription?: string) => void;
  isLoading?: boolean;
}

const EditJobModal = ({ isOpen, onClose, job, onSave, isLoading }: EditJobModalProps) => {
  const [jobName, setJobName] = useState(job.name);
  const [jobDescription, setJobDescription] = useState(job.description || "");

  const handleSave = () => {
    if (jobName.trim()) {
      onSave(job, jobName.trim(), jobDescription.trim() || undefined);
      // onClose();
    }
  };

  const handleClose = () => {
    setJobName(job.name);
    setJobDescription(job.description || "");
    onClose();
  };

  return (
    <CustomDialog isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Edit Job</h2>

        <div className="space-y-2">
          <Label htmlFor="job-name">Job Name</Label>
          <Input
            id="job-name"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            placeholder="Enter job name"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-description">Description (Optional)</Label>
          <Input
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Enter job description"
            disabled={isLoading}
          />
        </div>

        <div className="text-sm text-slate-500">
          <p>Job ID: {job.id}</p>
          <p>Images: {job.imageCount}</p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setTimeout(onClose, 0)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!jobName.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
};

export default EditJobModal;