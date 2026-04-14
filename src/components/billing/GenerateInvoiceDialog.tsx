import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/ui/dialog";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Textarea } from "@/components/ui/ui/textarea";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useGenerateInvoice } from "@/hooks/useInvoices";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GenerateInvoiceDialog({ open, onOpenChange, onSuccess }: Props) {
  const [clientId, setClientId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [taxRate, setTaxRate] = useState("10");
  const [dueDays, setDueDays] = useState("30");
  const [autoIssue, setAutoIssue] = useState(false);
  const [notes, setNotes] = useState("");

  const { mutate: generateInvoice, isPending } = useGenerateInvoice({
    onSuccess: () => {
      resetForm();
      onSuccess?.();
    },
  });

  const handleGenerate = () => {
    if (!clientId || !periodStart || !periodEnd) return;

    generateInvoice({
      client_organization_id: clientId,
      period_start: periodStart,
      period_end: periodEnd,
      tax_rate: parseFloat(taxRate) || 0,
      due_days: parseInt(dueDays) || 30,
      auto_issue: autoIssue,
      notes: notes || undefined,
    });
  };

  const resetForm = () => {
    setClientId("");
    setPeriodStart("");
    setPeriodEnd("");
    setTaxRate("10");
    setDueDays("30");
    setAutoIssue(false);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
          <DialogDescription>Create a new invoice for a billing period</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Client Organization ID *</Label>
            <Input
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              placeholder="Enter client organization ID"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Period Start *</Label>
              <Input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
            </div>
            <div>
              <Label>Period End *</Label>
              <Input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tax Rate (%)</Label>
              <Input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} min="0" max="100" step="0.5" />
            </div>
            <div>
              <Label>Due Days</Label>
              <Input type="number" value={dueDays} onChange={e => setDueDays(e.target.value)} min="1" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="auto-issue" checked={autoIssue} onCheckedChange={(v) => setAutoIssue(!!v)} />
            <Label htmlFor="auto-issue">Auto-issue invoice after generation</Label>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any notes..." rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={!clientId || !periodStart || !periodEnd || isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Generate Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
