import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/ui/dialog";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { Switch } from "@/components/ui/ui/switch";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { Loader2 } from "lucide-react";
import { BillingRateCard } from "@/types/billing";
import { useEnableOrgMemberBilling } from "@/hooks/useContractors";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rateCards: BillingRateCard[];
  onSuccess?: () => void;
}

export function ContractorEnableDialog({ open, onOpenChange, rateCards, onSuccess }: Props) {
  const [userId, setUserId] = useState("");
  const [company, setCompany] = useState("");
  const [billingEnabled, setBillingEnabled] = useState(true);
  const [rateCardId, setRateCardId] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [backfill, setBackfill] = useState(false);
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");

  const { mutate: enableBilling, isPending } = useEnableOrgMemberBilling({
    onSuccess: () => {
      resetForm();
      onSuccess?.();
    },
  });

  const handleSubmit = () => {
    if (!userId) return;

    enableBilling({
      userId,
      payload: {
        is_external: true,
        billing_enabled: billingEnabled,
        rate_card_id: rateCardId || undefined,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        contractor_company: company || undefined,
        contract_start_date: contractStart || undefined,
        contract_end_date: contractEnd || undefined,
        backfill,
      },
    });
  };

  const resetForm = () => {
    setUserId("");
    setCompany("");
    setBillingEnabled(true);
    setRateCardId("");
    setHourlyRate("");
    setBackfill(false);
    setContractStart("");
    setContractEnd("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add External Contractor</DialogTitle>
          <DialogDescription>Enable billing for an existing organization member</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Member User ID *</Label>
            <Input value={userId} onChange={e => setUserId(e.target.value)} placeholder="Enter the member's user ID" />
          </div>

          <div>
            <Label>Company</Label>
            <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name (optional)" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contract Start Date</Label>
              <Input type="date" value={contractStart} onChange={e => setContractStart(e.target.value)} />
            </div>
            <div>
              <Label>Contract End Date</Label>
              <Input type="date" value={contractEnd} onChange={e => setContractEnd(e.target.value)} />
            </div>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!userId || isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Contractor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
