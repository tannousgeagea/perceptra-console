import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { Separator } from "@/components/ui/ui/separator";
import { mockInvoices, actionTypeLabels } from "@/components/billing/mockBillingData";
import { InvoiceStatus } from "@/types/billing";
import { toast } from "sonner";

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: "📝" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: "🟡" },
  paid: { label: "Paid", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: "🟢" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: "🔴" },
};

export default function InvoiceDetails() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const invoice = mockInvoices.find(i => i.invoice_id === invoiceId);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Invoice not found.</p>
            <Link to="/billing/invoices"><Button variant="outline">Back to Invoices</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sc = statusConfig[invoice.status];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/billing/invoices">
                <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
                  <Badge className={sc.color}>{sc.icon} {sc.label}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {invoice.status === "draft" && (
                <Button onClick={() => toast.info("Would issue invoice")}><FileText className="h-4 w-4 mr-1" />Issue Invoice</Button>
              )}
              {invoice.status === "pending" && (
                <Button onClick={() => toast.info("Would mark as paid")}><CheckCircle className="h-4 w-4 mr-1" />Mark Paid</Button>
              )}
              {(invoice.status === "draft" || invoice.status === "pending") && (
                <Button variant="destructive" onClick={() => toast.info("Would cancel")}><XCircle className="h-4 w-4 mr-1" />Cancel</Button>
              )}
              <Button variant="outline" onClick={() => toast.info("PDF download coming soon")}>
                <Download className="h-4 w-4 mr-1" />Download PDF
              </Button>
            </div>
          </div>

          {/* Invoice Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Bill From</h3>
                  <p className="font-semibold text-lg">{invoice.vendor_organization_name}</p>
                  <p className="text-sm text-muted-foreground">billing@{invoice.vendor_organization_name.toLowerCase().replace(/\s/g, "")}.com</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Bill To</h3>
                  <p className="font-semibold text-lg">{invoice.client_organization_name}</p>
                  <p className="text-sm text-muted-foreground">contact@{invoice.client_organization_name.toLowerCase().replace(/\s/g, "")}.com</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Period</span>
                  <p className="font-medium">{new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}</p>
                </div>
                {invoice.project_name && (
                  <div>
                    <span className="text-muted-foreground">Project</span>
                    <p className="font-medium">{invoice.project_name}</p>
                  </div>
                )}
                {invoice.due_date && (
                  <div>
                    <span className="text-muted-foreground">Due Date</span>
                    <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                )}
                {invoice.paid_at && (
                  <div>
                    <span className="text-muted-foreground">Paid On</span>
                    <p className="font-medium text-green-600">{new Date(invoice.paid_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Action Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action Type</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Unit Rate</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.action_breakdown.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{actionTypeLabels[item.action_type] || item.action_type}</td>
                        <td className="text-right py-3 px-4">{item.quantity.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">${item.unit_rate.toFixed(2)}</td>
                        <td className="text-right py-3 px-4 font-semibold">${item.total_amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-col items-end gap-2 text-sm">
                <div className="flex justify-between w-64">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64">
                  <span className="text-muted-foreground">Tax ({invoice.tax_rate}%):</span>
                  <span className="font-medium">${invoice.tax_amount.toFixed(2)}</span>
                </div>
                <Separator className="w-64" />
                <div className="flex justify-between w-64 text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold">${invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{invoice.notes}</p></CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
