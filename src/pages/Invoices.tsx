import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Filter, Download, Eye, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { mockInvoices } from "@/components/billing/mockBillingData";
import { Invoice, InvoiceStatus } from "@/types/billing";
import { GenerateInvoiceDialog } from "@/components/billing/GenerateInvoiceDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/ui/alert-dialog";

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: "📝" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: "🟡" },
  paid: { label: "Paid", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: "🟢" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: "🔴" },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; invoice: Invoice } | null>(null);

  const clients = [...new Set(invoices.map(i => i.client_organization_name))];

  const filtered = invoices.filter(inv => {
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (filterClient !== "all" && inv.client_organization_name !== filterClient) return false;
    return true;
  });

  const handleIssue = (invoice: Invoice) => {
    setInvoices(prev => prev.map(i => 
      i.invoice_id === invoice.invoice_id 
        ? { ...i, status: "pending" as InvoiceStatus, issued_at: new Date().toISOString(), due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] }
        : i
    ));
    toast.success(`Invoice ${invoice.invoice_number} issued`);
    setConfirmAction(null);
  };

  const handleMarkPaid = (invoice: Invoice) => {
    setInvoices(prev => prev.map(i => 
      i.invoice_id === invoice.invoice_id 
        ? { ...i, status: "paid" as InvoiceStatus, paid_at: new Date().toISOString() }
        : i
    ));
    toast.success(`Invoice ${invoice.invoice_number} marked as paid`);
    setConfirmAction(null);
  };

  const handleCancel = (invoice: Invoice) => {
    setInvoices(prev => prev.map(i => 
      i.invoice_id === invoice.invoice_id 
        ? { ...i, status: "cancelled" as InvoiceStatus }
        : i
    ));
    toast.success(`Invoice ${invoice.invoice_number} cancelled`);
    setConfirmAction(null);
  };

  const handleGenerate = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
    setShowGenerateDialog(false);
    toast.success("Invoice generated successfully");
  };

  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.total_amount, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total_amount, 0);

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
                <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
                <p className="text-muted-foreground mt-1">Generate and manage invoices for billing periods</p>
              </div>
            </div>
            <Button onClick={() => setShowGenerateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />Generate Invoice
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Invoices</div>
                <div className="text-2xl font-bold mt-1">{invoices.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Pending Amount</div>
                <div className="text-2xl font-bold mt-1 text-yellow-600">${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Paid Amount</div>
                <div className="text-2xl font-bold mt-1 text-green-600">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Drafts</div>
                <div className="text-2xl font-bold mt-1">{invoices.filter(i => i.status === "draft").length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Filter className="h-4 w-4" />Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Client</label>
                  <Select value={filterClient} onValueChange={setFilterClient}>
                    <SelectTrigger><SelectValue placeholder="All clients" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      {clients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice List */}
          <div className="grid gap-4">
            {filtered.map(invoice => {
              const sc = statusConfig[invoice.status];
              return (
                <Card key={invoice.invoice_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-lg">{invoice.invoice_number}</span>
                          <Badge className={sc.color}>{sc.icon} {sc.label}</Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {invoice.client_organization_name}
                          {invoice.project_name && ` • ${invoice.project_name}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="font-semibold text-lg">${invoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <span className="text-muted-foreground">{invoice.total_actions.toLocaleString()} actions</span>
                          {invoice.due_date && <span className="text-muted-foreground">Due: {new Date(invoice.due_date).toLocaleDateString()}</span>}
                          {invoice.paid_at && <span className="text-green-600">Paid: {new Date(invoice.paid_at).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/billing/invoices/${invoice.invoice_id}`}>
                          <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Details</Button>
                        </Link>
                        {invoice.status === "draft" && (
                          <Button size="sm" onClick={() => setConfirmAction({ type: "issue", invoice })}>
                            <FileText className="h-4 w-4 mr-1" />Issue
                          </Button>
                        )}
                        {invoice.status === "pending" && (
                          <Button size="sm" variant="default" onClick={() => setConfirmAction({ type: "paid", invoice })}>
                            <CheckCircle className="h-4 w-4 mr-1" />Mark Paid
                          </Button>
                        )}
                        {(invoice.status === "draft" || invoice.status === "pending") && (
                          <Button size="sm" variant="destructive" onClick={() => setConfirmAction({ type: "cancel", invoice })}>
                            <XCircle className="h-4 w-4 mr-1" />Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No invoices found.</p></CardContent></Card>
            )}
          </div>
        </div>
      </div>

      <GenerateInvoiceDialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog} onGenerate={handleGenerate} />

      {/* Confirm dialogs */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "issue" && "Issue Invoice"}
              {confirmAction?.type === "paid" && "Mark as Paid"}
              {confirmAction?.type === "cancel" && "Cancel Invoice"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "issue" && `Issue ${confirmAction.invoice.invoice_number}? This will send it to the client.`}
              {confirmAction?.type === "paid" && `Mark ${confirmAction?.invoice.invoice_number} as paid?`}
              {confirmAction?.type === "cancel" && `Cancel ${confirmAction?.invoice.invoice_number}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!confirmAction) return;
              if (confirmAction.type === "issue") handleIssue(confirmAction.invoice);
              if (confirmAction.type === "paid") handleMarkPaid(confirmAction.invoice);
              if (confirmAction.type === "cancel") handleCancel(confirmAction.invoice);
            }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
