import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/ui/dialog";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Progress } from "@/components/ui/ui/progress";
import { Contractor, BackfillState } from "@/types/billing";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: Contractor | null;
}

export function BackfillDialog({ open, onOpenChange, contractor }: Props) {
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [state, setState] = useState<"form" | "running" | "done" | "error">("form");
  const [progress, setProgress] = useState(0);
  const [backfillState, setBackfillState] = useState<BackfillState>("PENDING");
  const [result, setResult] = useState<{ total_events: number; created: number; skipped: number } | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setState("form");
      setProgress(0);
      setResult(null);
      setBackfillState("PENDING");
    }
  }, [open]);

  // Simulate backfill progress
  const simulateProgress = useCallback(() => {
    let p = 0;
    setBackfillState("STARTED");
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setBackfillState("SUCCESS");
        setResult({ total_events: 1247, created: 1189, skipped: 58 });
        setState("done");
        toast.success("Backfill completed successfully");
      }
      setProgress(Math.min(p, 100));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (!startDate || !endDate) return;
    setState("running");
    setBackfillState("PENDING");
    setTimeout(() => simulateProgress(), 500);
  };

  if (!contractor) return null;

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
                  This will process approximately ~1,200 events. Backfill runs in the background.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleStart} disabled={!startDate || !endDate}>Start Backfill</Button>
            </DialogFooter>
          </>
        )}

        {state === "running" && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
              <p className="font-medium">Backfill In Progress</p>
              <p className="text-sm text-muted-foreground mt-1">Status: {backfillState}</p>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-center text-sm text-muted-foreground">{Math.round(progress)}%</p>
            <p className="text-center text-xs text-muted-foreground">Processing historical activities...</p>
          </div>
        )}

        {state === "done" && result && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-lg">Backfill Complete</p>
            </div>
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
              <p className="text-sm text-muted-foreground mt-1">An error occurred. Please try again.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button onClick={() => setState("form")}>Retry</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
