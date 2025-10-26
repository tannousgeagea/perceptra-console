import { useState } from "react";
import { X, Scissors, AlertTriangle } from "lucide-react";
import { Job } from "@/types/jobs";
import { User } from "@/types/membership"
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/ui/dialog";
import { CustomSelect } from "./ui/select";
import { Label } from "@/components/ui/ui/label";
import { Alert, AlertDescription } from "@/components/ui/ui/alert";

interface SplitJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  users: User[];
  onSplitJob: (job: Job, numberOfSlices: number, userAssignments: (string | null)[]) => void;
}

const SplitJobModal = ({ isOpen, onClose, job, users, onSplitJob }: SplitJobModalProps) => {
  const [numberOfSlices, setNumberOfSlices] = useState(2);
  const [userAssignments, setUserAssignments] = useState<(string | null)[]>(Array(2).fill(null));
  
  // Calculate minimum slices based on image count
  const minSlices = 2;
  const maxSlices = Math.min(job.imageCount, 10);
  

  console.log(typeof users[0].id)
  const handleNumberOfSlicesChange = (value: number) => {
    const slices = Math.max(minSlices, Math.min(maxSlices, value));
    setNumberOfSlices(slices);
    
    // Adjust user assignments array to match new number of slices
    setUserAssignments((prev) => {
      const newAssignments = [...prev];
      if (slices > prev.length) {
        return [...prev, ...Array(slices - prev.length).fill(null)];
      } else {
        return prev.slice(0, slices);
      }
    });
  };
  
  const handleUserAssignment = (index: number, userId: string | null) => {
    setUserAssignments((prev) => {
      const newAssignments = [...prev];
      newAssignments[index] = userId;
      return newAssignments;
    });
  };
  
  const handleSplitJob = () => {
    onSplitJob(job, numberOfSlices, userAssignments);
    onClose();
  };

  // Check if job can be split (must have at least 2 images)
  const canSplit = job.imageCount >= 2;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setTimeout(() => {
          onClose();
        }, 10); // even 10ms helps
      }
    }}>
      <DialogContent className="sm:max-w-lg" forceMount>
        <DialogHeader>
          <DialogTitle>Split Job: {job.name}</DialogTitle>
          <DialogDescription>
            Divide this job into multiple slices and optionally assign them to users.
          </DialogDescription>
        </DialogHeader>
        
        {!canSplit ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This job cannot be split because it has fewer than 2 images.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfSlices">Number of slices</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="numberOfSlices"
                    type="number"
                    min={minSlices}
                    max={maxSlices}
                    value={numberOfSlices}
                    onChange={(e) => handleNumberOfSlicesChange(parseInt(e.target.value) || minSlices)}
                    className="w-24"
                  />
                  <span className="text-sm text-slate-500">
                    (Min: {minSlices}, Max: {maxSlices})
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  Each slice will contain approximately {Math.floor(job.imageCount / numberOfSlices)} images.
                </p>
              </div>
              
              <div className="space-y-4 mt-4">
                <Label>Assign users to slices (optional)</Label>
                {userAssignments.map((userId, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-24 flex-shrink-0">
                      <div className="px-2 py-1 bg-slate-100 rounded text-sm">
                        Slice {index + 1}
                      </div>
                    </div>
                    {/* <Select
                      value={userId || "unassigned"}
                      onValueChange={(value) => handleUserAssignment(index, value === "unassigned" ? null : value)}
                      key={`user-select-${index}`}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent position="popper" side="bottom" sideOffset={5}>
                        <SelectItem value="unassigned">
                          <span className="text-slate-500">Unassigned</span>
                        </SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.username} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select> */}
                  <CustomSelect
                    value={userId}
                    onChange={(val) => handleUserAssignment(index, val)}
                    placeholder="Select a user"
                    options={[
                      { value: null, label: "Unassigned" },
                      ...users.map((user) => ({
                        value: user.id,
                        label: `${user.username} (${user.role})`,
                      })),
                    ]}
                  />
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} className="gap-2">
                <X size={16} />
                Cancel
              </Button>
              <Button onClick={handleSplitJob} className="gap-2">
                <Scissors size={16} />
                Split Job
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SplitJobModal;
