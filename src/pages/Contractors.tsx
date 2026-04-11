import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserCheck, Plus, RefreshCw, DollarSign, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { Input } from "@/components/ui/ui/input";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { mockContractors, mockRateCards } from "@/components/billing/mockBillingData";
import { Contractor } from "@/types/billing";
import { ContractorEnableDialog } from "@/components/billing/ContractorEnableDialog";
import { BackfillDialog } from "@/components/billing/BackfillDialog";
import { toast } from "sonner";

export default function Contractors() {
  const [contractors, setContractors] = useState<Contractor[]>(mockContractors);
  const [search, setSearch] = useState("");
  const [filterBillingEnabled, setFilterBillingEnabled] = useState(false);
  const [filterHasUnbilled, setFilterHasUnbilled] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [backfillContractor, setBackfillContractor] = useState<Contractor | null>(null);

  const filtered = contractors.filter(c => {
    if (search && !c.full_name.toLowerCase().includes(search.toLowerCase()) && !c.username.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterBillingEnabled && !c.billing_enabled) return false;
    if (filterHasUnbilled && c.total_unbilled_amount <= 0) return false;
    return true;
  });

  const totalUnbilled = contractors.reduce((s, c) => s + c.total_unbilled_amount, 0);
  const activeCount = contractors.filter(c => c.billing_enabled).length;

  const handleToggleBilling = (contractorId: string) => {
    setContractors(prev => prev.map(c =>
      c.user_id === contractorId ? { ...c, billing_enabled: !c.billing_enabled } : c
    ));
    const c = contractors.find(c => c.user_id === contractorId);
    toast.success(`Billing ${c?.billing_enabled ? "disabled" : "enabled"} for ${c?.full_name}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/billing">
                <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">External Contractors</h1>
                <p className="text-muted-foreground mt-1">Manage billing for external annotators</p>
              </div>
            </div>
            <Button onClick={() => setShowEnableDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />Add Contractor
            </Button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Active Contractors</div>
                <div className="text-2xl font-bold mt-1">{activeCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Unbilled</div>
                <div className="text-2xl font-bold mt-1 text-yellow-600">${totalUnbilled.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Actions This Month</div>
                <div className="text-2xl font-bold mt-1">{contractors.reduce((s, c) => s + c.total_actions_this_month, 0)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search contractors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="billing-enabled" checked={filterBillingEnabled} onCheckedChange={(v) => setFilterBillingEnabled(!!v)} />
              <label htmlFor="billing-enabled" className="text-sm">Billing Enabled</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="has-unbilled" checked={filterHasUnbilled} onCheckedChange={(v) => setFilterHasUnbilled(!!v)} />
              <label htmlFor="has-unbilled" className="text-sm">Has Unbilled</label>
            </div>
          </div>

          {/* Contractor List */}
          <div className="grid gap-4">
            {filtered.map(contractor => (
              <Card key={contractor.user_id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{contractor.full_name}</p>
                          <p className="text-sm text-muted-foreground">@{contractor.username} • {contractor.email}</p>
                        </div>
                      </div>
                      <div className="ml-13 mt-3 flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {contractor.contractor_company || "Freelance"}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          Unbilled: <span className={contractor.total_unbilled_amount > 0 ? "font-semibold text-yellow-600" : "text-muted-foreground"}>${contractor.total_unbilled_amount.toFixed(2)}</span>
                        </span>
                        <span className="text-muted-foreground">This month: {contractor.total_actions_this_month} actions</span>
                        {contractor.billing_enabled ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">✅ Billing Enabled</Badge>
                        ) : (
                          <Badge variant="secondary">⚠️ Billing Disabled</Badge>
                        )}
                        {contractor.rate_card_name && (
                          <span className="text-muted-foreground">Rate Card: {contractor.rate_card_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/billing/contractors/${contractor.user_id}/summary`}>
                        <Button variant="outline" size="sm">View Summary</Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => setBackfillContractor(contractor)}>
                        <RefreshCw className="h-4 w-4 mr-1" />Backfill
                      </Button>
                      <Button
                        variant={contractor.billing_enabled ? "secondary" : "default"}
                        size="sm"
                        onClick={() => handleToggleBilling(contractor.user_id)}
                      >
                        {contractor.billing_enabled ? "Disable Billing" : "Enable Billing"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No contractors found.</p></CardContent></Card>
            )}
          </div>
        </div>
      </div>

      <ContractorEnableDialog
        open={showEnableDialog}
        onOpenChange={setShowEnableDialog}
        rateCards={mockRateCards}
        onSuccess={(newContractor) => {
          setContractors([newContractor, ...contractors]);
          setShowEnableDialog(false);
          toast.success("Contractor added successfully");
        }}
      />

      <BackfillDialog
        open={!!backfillContractor}
        onOpenChange={() => setBackfillContractor(null)}
        contractor={backfillContractor}
      />
    </div>
  );
}
