import { useParams, Link } from "react-router-dom";
import { ArrowLeft, DollarSign, UserCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { Separator } from "@/components/ui/ui/separator";
import { actionTypeLabels, actionTypeIcons } from "@/components/billing/mockBillingData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useOrgMemberBillingSummary, useUserBillableActions } from "@/hooks/useContractors";
import QueryState from "@/components/common/QueryState";

export default function ContractorSummary() {
  const { userId } = useParams<{ userId: string }>();

  const {
    data: summary,
    isLoading: loadingSummary,
    isError: errorSummary,
    refetch,
  } = useOrgMemberBillingSummary(userId || "");

  const {
    data: actions = [],
    isLoading: loadingActions,
    isError: errorActions,
  } = useUserBillableActions(userId || "");

  const isLoading = loadingSummary || loadingActions;
  const isError = errorSummary || errorActions;

  if (isLoading || isError || !summary) {
    return (
      <div className="min-h-screen bg-background w-full">
        <div className="px-4 py-8">
          <QueryState
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            loadingMessage="Loading billing summary..."
            errorMessage="Failed to load billing summary. Please try again."
          />
        </div>
      </div>
    );
  }

  const chartData = summary.action_breakdown.map(item => ({
    name: actionTypeLabels[item.action_type] || item.action_type,
    amount: item.total_amount,
    count: item.quantity,
  }));

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link to="/billing/contractors">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{summary.full_name} - Billing Summary</h1>
              <p className="text-muted-foreground">Organization: {summary.scope_name}</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Billed</div>
                <div className="text-2xl font-bold text-green-600 mt-1">${summary.total_billed.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Unbilled</div>
                <div className="text-2xl font-bold text-yellow-600 mt-1">${summary.total_unbilled.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Actions</div>
                <div className="text-2xl font-bold mt-1">{summary.total_actions.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Avg Rate</div>
                <div className="text-2xl font-bold mt-1">${summary.avg_rate?.toFixed(2) ?? "—"}</div>
              </CardContent>
            </Card>
          </div>

          {/* Billing Info */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" />Billing Configuration</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="mt-1">
                    {summary.billing_enabled
                      ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">✅ Billing Enabled</Badge>
                      : <Badge variant="secondary">Disabled</Badge>
                    }
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Rate Card</span>
                  <p className="font-medium mt-1 flex items-center gap-1"><CreditCard className="h-4 w-4" />{summary.rate_card_name || "—"}</p>
                </div>
                {summary.hourly_rate && (
                  <div>
                    <span className="text-muted-foreground">Hourly Rate</span>
                    <p className="font-medium mt-1 flex items-center gap-1"><DollarSign className="h-4 w-4" />${summary.hourly_rate}/hr</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Period</span>
                  <p className="font-medium mt-1">
                    {summary.period_start && new Date(summary.period_start).toLocaleDateString()} - {summary.period_end && new Date(summary.period_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader><CardTitle>Action Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 60, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === "amount") return [`$${value.toFixed(2)}`, "Amount"];
                        return [value, "Count"];
                      }}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Separator className="my-4" />

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Action Type</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Count</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Rate</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.action_breakdown.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3">{actionTypeIcons[item.action_type]} {actionTypeLabels[item.action_type]}</td>
                      <td className="text-right py-2 px-3">{item.quantity}</td>
                      <td className="text-right py-2 px-3">${item.unit_rate.toFixed(2)}</td>
                      <td className="text-right py-2 px-3 font-semibold">${item.total_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Recent Actions */}
          <Card>
            <CardHeader><CardTitle>Recent Actions</CardTitle></CardHeader>
            <CardContent>
              {actions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent actions found.</p>
              ) : (
                <div className="space-y-3">
                  {actions.map(action => (
                    <div key={action.action_id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{actionTypeIcons[action.action_type]}</span>
                        <div>
                          <p className="font-medium text-sm">{actionTypeLabels[action.action_type]}</p>
                          <p className="text-xs text-muted-foreground">{new Date(action.created_at).toLocaleDateString()} • {action.project_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">${action.total_amount.toFixed(2)}</span>
                        {action.billed_at ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">✓ Billed</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">⏳ Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
