import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { mockBillingReport } from "@/components/billing/mockBillingData";
import { Input } from "@/components/ui/ui/input";
import { useUserProjects } from "@/hooks/useUserProjects";
import QueryState from "@/components/common/QueryState";
import { toast } from "sonner";
import { useBillingReport } from "@/hooks/useBillingReport";

const actionTypeLabels: Record<string, string> = {
  new_annotation: "New Annotation",
  untouched_prediction: "Untouched Prediction",
  minor_edit: "Minor Edit",
  major_edit: "Major Edit",
  class_change: "Class Change",
  deletion: "Deletion",
  missed_object: "Missed Object",
  image_review: "Image Review",
  annotation_review: "Annotation Review"
};

export default function BillingReport() {
  const [filterProject, setFilterProject] = useState<string>("all");
  const [startDate, setStartDate] = useState(mockBillingReport.period_start);
  const [endDate, setEndDate] = useState(mockBillingReport.period_end);
  const { data: projects, isLoading, isError, refetch } = useUserProjects();
  // const report = mockBillingReport;

const { data: report } = useBillingReport({
  // project_id: 'project-uuid',
  // user_id: 'user-uuid',
  // start_date: '2024-01-01',
  // end_date: '2024-01-31',
});

  const handleExportCSV = () => {
    const headers = ["Action Type", "Quantity", "Unit Rate", "Total Amount"];
    const rows = report?.breakdown.map(item => [
      actionTypeLabels[item.action_type] || item.action_type,
      item.quantity.toString(),
      `$${item.unit_rate.toFixed(2)}`,
      `$${item.total_amount.toFixed(2)}`
    ]);

    if (!rows) return
    
    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-report-${startDate}-${endDate}.csv`;
    a.click();
    
    toast.success("Report exported successfully");
  };

  const handleExportPDF = () => {
    toast.info("PDF export would be implemented with a PDF library");
  };

  if (isLoading || isError || !projects || !report) {
    return (
      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingMessage="Loading user activity ..."
        errorMessage="Failed to fetch user activity. Please try again."
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/billing">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Billing Report</h1>
                <p className="text-muted-foreground mt-1">View detailed billing breakdown and export invoices</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Report Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Project</label>
                  <Select value={filterProject} onValueChange={setFilterProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="All projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.project_id} value={project.project_id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report?.total_actions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(report?.period_start).toLocaleDateString()} - {new Date(report?.period_end).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold flex items-center gap-1">
                  <DollarSign className="h-6 w-6" />
                  {report.total_amount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Currency: {report?.currency}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${(report?.total_amount / report?.total_actions).toFixed(3)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per action</p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Action Breakdown</CardTitle>
              <CardDescription>Detailed breakdown by action type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Action Type</th>
                      <th className="text-right py-3 px-4">Quantity</th>
                      <th className="text-right py-3 px-4">Unit Rate</th>
                      <th className="text-right py-3 px-4">Total Amount</th>
                      <th className="text-right py-3 px-4">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report?.breakdown.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">
                          {actionTypeLabels[item.action_type] || item.action_type}
                        </td>
                        <td className="text-right py-3 px-4">{item.quantity.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">${item.unit_rate.toFixed(2)}</td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ${item.total_amount}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          {((item.total_amount / report?.total_amount) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-muted/30">
                      <td className="py-3 px-4">Total</td>
                      <td className="text-right py-3 px-4">{report?.total_actions.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">-</td>
                      <td className="text-right py-3 px-4">${report?.total_amount.toFixed(2)}</td>
                      <td className="text-right py-3 px-4">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
