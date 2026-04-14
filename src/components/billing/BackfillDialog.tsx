import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/ui/dialog";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Progress } from "@/components/ui/ui/progress";
import { Contractor } from "@/types/billing";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { useBackfillUserInOrg, useBackfillTaskStatus } from "@/hooks/useBackfill";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: Contractor | null;
}

export function BackfillDialog({ open, onOpenChange, contractor }: Props) {
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [state, setState] = useState<"form" | "running" | "done" | "error">("form");

  // Reset on open
  useEffect(() => {
    if (open) {
      setState("form");
      setTaskId(null);
    }
  }, [open]);

  const { mutate: startBackfill, isPending: starting } = useBackfillUserInOrg({
    showToast: false,
    onSuccess: (data) => {
      setTaskId(data.task_id);
      setState("running");
    },
    onError: () => {
      setState("error");
    },
  });

  const { data: taskStatus } = useBackfillTaskStatus(taskId || "", {
    enabled: !!taskId && state === "running",
  });

  // React to task completion
  useEffect(() => {
    if (!taskStatus) return;
    if (taskStatus.state === "SUCCESS") {
      setState("done");
    } else if (taskStatus.state === "FAILURE") {
      setState("error");
    }
  }, [taskStatus]);

  const handleStart = () => {
    if (!startDate || !endDate || !contractor) return;
    startBackfill({
      userId: contractor.user_id,
      payload: { start_date: startDate, end_date: endDate },
    });
  };

  // Derive a rough progress value from task state for the progress bar
  const progressValue = (() => {
    if (!taskStatus) return 10;
    if (taskStatus.state === "PENDING") return 15;
    if (taskStatus.state === "STARTED") return 60;
    if (taskStatus.state === "SUCCESS") return 100;
    return 10;
  })();

  if (!contractor) return null;

  const result = taskStatus?.result;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Backfill Billing History</DialogTitle>
          <DialogDescription>
            Calculate billing for historical activities for {contractor.full_name}
          </DialogDescription>
        </DialogHeader>

        {state === "form" && (
          <>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p><span className="font-medium">Contractor:</span> {contractor.full_name}</p>
                <p><span className="font-medium">Scope:</span> Organization</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-yellow-800 dark:text-yellow-400">
                  Backfill processes historical annotation events and creates billable records. This runs in the background.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleStart} disabled={!startDate || !endDate || starting}>
                {starting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Start Backfill
              </Button>
            </DialogFooter>
          </>
        )}

        {state === "running" && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
              <p className="font-medium">Backfill In Progress</p>
              <p className="text-sm text-muted-foreground mt-1">Status: {taskStatus?.state ?? "PENDING"}</p>
            </div>
            <Progress value={progressValue} className="h-3" />
            <p className="text-center text-xs text-muted-foreground">Processing historical activities — this may take a moment...</p>
          </div>
        )}

        {state === "done" && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-lg">Backfill Complete</p>
            </div>
            {result && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Events Processed:</span>
                  <span className="font-semibold">{result.total_events.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billable Actions Created:</span>
                  <span className="font-semibold text-green-600">{result.created.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actions Skipped:</span>
                  <span className="font-semibold">{result.skipped.toLocaleString()}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <XCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
              <p className="font-semibold">Backfill Failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                {taskStatus?.error || "An error occurred. Please try again."}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button onClick={() => { setState("form"); setTaskId(null); }}>Retry</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
