
import { useState } from "react";
import CustomDialog from "./ui/dialog";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Job } from "@/types/jobs";
import { Button } from "@/components/ui/ui/button";
import { Loader } from "lucide-react";

interface DeleteJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onDelete: (job: Job) => void;
  isLoading?:boolean;
}

const DeleteJobModal = ({ isOpen, onClose, job, onDelete, isLoading }: DeleteJobModalProps) => {
  const [confirmationText, setConfirmationText] = useState("");
  
  const expectedText = `DELETE ${job.name}`;
  const isConfirmed = confirmationText === expectedText;

  const handleDelete = () => {
    if (isConfirmed) {
      onDelete(job);
      // onClose();
      resetForm()
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setConfirmationText("");
  };

  return (
    <CustomDialog isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-red-600">Delete Job</h2>

        <p>
          Are you sure you want to delete this job? This action cannot be undone.
        </p>

        <div className="bg-slate-50 p-3 rounded border">
          <p className="font-medium text-slate-800">{job.name}</p>
          <p className="text-sm text-slate-600">ID: {job.id}</p>
          <p className="text-sm text-slate-600">Images: {job.imageCount}</p>
          {job.assignedUser && (
            <p className="text-sm text-slate-600">
              Assigned to: {job.assignedUser.username}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmation">
            Type <span className="font-mono font-bold">{expectedText}</span> to confirm:
          </Label>
          <Input
            id="confirmation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={expectedText}
            className="font-mono"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={!isConfirmed || isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Job"
            )}
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
};

export default DeleteJobModal;