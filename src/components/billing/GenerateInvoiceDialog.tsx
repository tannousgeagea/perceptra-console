import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/ui/dialog";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Textarea } from "@/components/ui/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { Invoice } from "@/types/billing";
import { mockBillingReport } from "./mockBillingData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (invoice: Invoice) => void;
}

const clientOrgs = [
  { id: "org-10", name: "Acme Corp" },
  { id: "org-11", name: "TechStart Inc" },
  { id: "org-12", name: "MedVision Health" },
];

export function GenerateInvoiceDialog({ open, onOpenChange, onGenerate }: Props) {
  const [clientId, setClientId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [taxRate, setTaxRate] = useState("10");
  const [dueDays, setDueDays] = useState("30");
  const [autoIssue, setAutoIssue] = useState(false);
  const [notes, setNotes] = useState("");

  const client = clientOrgs.find(c => c.id === clientId);

  const handleGenerate = () => {
    if (!clientId || !periodStart || !periodEnd) return;

    const subtotal = mockBillingReport.total_amount;
    const tax = subtotal * (parseFloat(taxRate) / 100);
    const total = subtotal + tax;
    const dueDate = new Date(Date.now() + parseInt(dueDays) * 86400000).toISOString().split("T")[0];

    const invoice: Invoice = {
      invoice_id: `inv-${Date.now()}`,
      invoice_number: `INV-DAC-${String(Date.now()).slice(-6)}`,
      vendor_organization_id: "org-1",
      vendor_organization_name: "DataAnnotation Corp",
      client_organization_id: clientId,
      client_organization_name: client?.name || "",
      period_start: periodStart,
      period_end: periodEnd,
      subtotal,
      tax_rate: parseFloat(taxRate),
      tax_amount: tax,
      total_amount: total,
      currency: "USD",
      total_annotations: 543,
      total_reviews: 687,
      total_actions: mockBillingReport.total_actions,
      action_breakdown: mockBillingReport.breakdown,
      status: autoIssue ? "pending" : "draft",
      issued_at: autoIssue ? new Date().toISOString() : undefined,
      due_date: dueDate,
      notes,
      created_at: new Date().toISOString(),
    };

    onGenerate(invoice);
    resetForm();
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
            <Label>Client Organization *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {clientOrgs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
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

          {clientId && periodStart && periodEnd && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">Preview</p>
              <p>Estimated unbilled actions: <span className="font-semibold">{mockBillingReport.total_actions.toLocaleString()}</span></p>
              <p>Estimated subtotal: <span className="font-semibold">${mockBillingReport.total_amount.toFixed(2)}</span></p>
              <p>Tax ({taxRate}%): <span className="font-semibold">${(mockBillingReport.total_amount * parseFloat(taxRate || "0") / 100).toFixed(2)}</span></p>
            </div>
          )}

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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={!clientId || !periodStart || !periodEnd}>Generate Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
