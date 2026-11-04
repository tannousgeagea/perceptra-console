import { useMemo, useState } from "react";
import { X, Scissors, AlertTriangle, Gauge } from "lucide-react";
import { Switch } from "@/components/ui/ui/switch";
import { balanceByPace, formatHours, useTeamPace, type MemberPace } from "@/hooks/useTeamPace";
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
  projectId?: string;
  onSplitJob: (
    job: Job,
    numberOfSlices: number,
    userAssignments: (string | null)[],
    sliceSizes?: number[],
  ) => void;
}

/** "12/h · 40 queued" for a member, or why there is no pace. */
const paceLabel = (m?: MemberPace) => {
  if (!m) return null;
  const pace = m.measured && m.images_per_hour
    ? `${m.images_per_hour}/h`
    : m.images_per_hour
      ? `${m.images_per_hour}/h (few images)`
      : "no recent history";
  return `${pace} · ${m.open_images} queued`;
};

const SplitJobModal = ({ isOpen, onClose, job, users, projectId, onSplitJob }: SplitJobModalProps) => {
  const [numberOfSlices, setNumberOfSlices] = useState(2);
  const [userAssignments, setUserAssignments] = useState<(string | null)[]>(Array(2).fill(null));
  const [balance, setBalance] = useState(true);
  // Sizes typed by hand; null = follow the equal / balanced suggestion.
  const [editedSizes, setEditedSizes] = useState<number[] | null>(null);

  // Calculate minimum slices based on image count
  const minSlices = 2;
  const maxSlices = Math.min(job.image_count, 10);

  const { data: teamPace } = useTeamPace(projectId, isOpen);
  const paceByUser = useMemo(
    () => new Map((teamPace?.members ?? []).map((m) => [m.user_id, m])),
    [teamPace],
  );

  const equalSizes = useMemo(() => {
    const base = Math.floor(job.image_count / numberOfSlices);
    const remainder = job.image_count % numberOfSlices;
    return Array.from({ length: numberOfSlices }, (_, i) => base + (i < remainder ? 1 : 0));
  }, [job.image_count, numberOfSlices]);

  // Sized so everyone finishes about together, given their pace and queue.
  const balancedSizes = useMemo(
    () =>
      balanceByPace(
        job.image_count,
        userAssignments.map((id) => {
          const m = id ? paceByUser.get(id) : undefined;
          return { pace: m?.effective_images_per_hour ?? null, queue: m?.open_images ?? 0 };
        }),
      ),
    [job.image_count, userAssignments, paceByUser],
  );
  const anyAssignee = userAssignments.some(Boolean);
  const canBalance = anyAssignee && !!balancedSizes;
  const sizes = editedSizes ?? (balance && canBalance ? balancedSizes! : equalSizes);
  const sizeTotal = sizes.reduce((a, b) => a + b, 0);
  const sizesValid = sizes.length === numberOfSlices && sizes.every((s) => s >= 1) && sizeTotal === job.image_count;

  /** When slice i would be done: its assignee's queue plus the slice, at their pace. */
  const finishIn = (i: number) => {
    const id = userAssignments[i];
    const m = id ? paceByUser.get(id) : undefined;
    const pace = m?.effective_images_per_hour;
    return pace ? (m!.open_images + sizes[i]) / pace : null;
  };

  const handleNumberOfSlicesChange = (value: number) => {
    const slices = Math.max(minSlices, Math.min(maxSlices, value));
    setEditedSizes(null);
    setNumberOfSlices(slices);
    
    // Adjust user assignments array to match new number of slices
    setUserAssignments((prev) => {
      if (slices > prev.length) {
        return [...prev, ...Array(slices - prev.length).fill(null)];
      } else {
        return prev.slice(0, slices);
      }
    });
  };
  
  const handleUserAssignment = (index: number, userId: string | null) => {
    setEditedSizes(null);
    setUserAssignments((prev) => {
      const newAssignments = [...prev];
      newAssignments[index] = userId;
      return newAssignments;
    });
  };
  
  const handleSizeChange = (index: number, value: number) => {
    setEditedSizes(() => {
      const next = [...sizes];
      next[index] = Math.max(1, Math.floor(value) || 1);
      return next;
    });
  };

  const handleSplitJob = () => {
    if (!sizesValid) return;
    const isEqual = sizes.every((s, i) => s === equalSizes[i]);
    onSplitJob(job, numberOfSlices, userAssignments, isEqual ? undefined : sizes);
    onClose();
  };

  // Check if job can be split (must have at least 2 images)
  const canSplit = job.image_count >= 2;
  
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
              </div>

              <div className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="balanceByPace" className="flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5" /> Balance by pace
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {!anyAssignee
                      ? "Assign people below to size slices by how fast they work."
                      : canBalance
                        ? `Faster people and emptier queues get more, so everyone finishes about together (last ${teamPace?.window_days ?? 14} days).`
                        : "Not enough recent history to measure pace yet: slices stay equal."}
                  </p>
                </div>
                <Switch
                  id="balanceByPace"
                  checked={balance && canBalance}
                  disabled={!canBalance}
                  onCheckedChange={(on) => {
                    setEditedSizes(null);
                    setBalance(on);
                  }}
                />
              </div>
              
              <div className="space-y-4 mt-4">
                <div className="flex items-baseline justify-between">
                  <Label>Slices and assignees (optional)</Label>
                  <span className={`text-xs ${sizesValid ? "text-muted-foreground" : "text-destructive"}`}>
                    {sizeTotal} / {job.image_count} images
                    {editedSizes && (
                      <button type="button" className="ml-2 underline" onClick={() => setEditedSizes(null)}>
                        reset
                      </button>
                    )}
                  </span>
                </div>
                {userAssignments.map((userId, index) => {
                  const member = userId ? paceByUser.get(userId) : undefined;
                  const eta = finishIn(index);
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-20 flex-shrink-0">
                          <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm dark:text-slate-300">
                            Slice {index + 1}
                          </div>
                        </div>
                        <Input
                          type="number"
                          min={1}
                          aria-label={`Images in slice ${index + 1}`}
                          value={sizes[index] ?? 1}
                          onChange={(e) => handleSizeChange(index, parseInt(e.target.value))}
                          className="w-20 flex-shrink-0"
                        />
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
                      {member && (
                        <p className="pl-[5.5rem] text-xs text-muted-foreground">
                          {paceLabel(member)}
                          {eta != null && <> · done in {formatHours(eta)}</>}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} className="gap-2">
                <X size={16} />
                Cancel
              </Button>
              <Button onClick={handleSplitJob} disabled={!sizesValid} className="gap-2">
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
