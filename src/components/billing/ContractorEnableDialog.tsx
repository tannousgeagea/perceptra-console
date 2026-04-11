import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/ui/dialog";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { Switch } from "@/components/ui/ui/switch";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { Contractor, BillingRateCard } from "@/types/billing";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rateCards: BillingRateCard[];
  onSuccess: (contractor: Contractor) => void;
}

export function ContractorEnableDialog({ open, onOpenChange, rateCards, onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [billingEnabled, setBillingEnabled] = useState(true);
  const [rateCardId, setRateCardId] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [backfill, setBackfill] = useState(false);
  const [contractStart, setContractStart] = useState("");

  const handleSubmit = () => {
    if (!fullName || !username || !email) return;

    const rc = rateCards.find(r => r.rate_card_id === rateCardId);
    const contractor: Contractor = {
      user_id: `usr-${Date.now()}`,
      username,
      full_name: fullName,
      email,
      is_external_annotator: true,
      billing_enabled: billingEnabled,
      contractor_company: company || undefined,
      contract_start_date: contractStart || undefined,
      total_unbilled_amount: 0,
      total_actions_this_month: 0,
      rate_card_id: rateCardId || undefined,
      rate_card_name: rc?.name,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
    };
    onSuccess(contractor);
    resetForm();
  };

  const resetForm = () => {
    setFullName(""); setUsername(""); setEmail(""); setCompany("");
    setBillingEnabled(true); setRateCardId(""); setHourlyRate("");
    setBackfill(false); setContractStart("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add External Contractor</DialogTitle>
          <DialogDescription>Enable billing for an external annotator</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name *</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <Label>Username *</Label>
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="jane.doe" />
            </div>
          </div>

          <div>
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" />
          </div>

          <div>
            <Label>Company</Label>
            <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name (optional)" />
          </div>

          <div>
            <Label>Contract Start Date</Label>
            <Input type="date" value={contractStart} onChange={e => setContractStart(e.target.value)} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Billing Enabled</Label>
            <Switch checked={billingEnabled} onCheckedChange={setBillingEnabled} />
          </div>

          <div>
            <Label>Rate Card</Label>
            <Select value={rateCardId} onValueChange={setRateCardId}>
              <SelectTrigger><SelectValue placeholder="Select rate card" /></SelectTrigger>
              <SelectContent>
                {rateCards.filter(r => r.is_active).map(rc => (
                  <SelectItem key={rc.rate_card_id} value={rc.rate_card_id}>{rc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Hourly Rate (optional)</Label>
            <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="25.00" min="0" step="0.50" />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="backfill" checked={backfill} onCheckedChange={(v) => setBackfill(!!v)} />
            <Label htmlFor="backfill">Backfill historical work</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!fullName || !username || !email}>Add Contractor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
