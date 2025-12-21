
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import { Model } from "@/types/models";
import { ModelService } from "./ModelService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { ModelDetail } from "@/hooks/useModels";

const ModelMetricsView: React.FC<{ model: ModelDetail }> = ({ model }) => {
  const [selectedVersions, setSelectedVersions] = useState<string[]>(
    model.production_version
      ? [model.production_version.id]
      : model.versions.length > 0
      ? [model.versions[0].id]
      : []
  );

  // Get metrics config based on model type
  const metricsConfig = ModelService.getMetricsConfig(model.task);

  // Only use versions that are trained
  const trainedVersions = model.versions.filter(
    (v) => v.status === "trained" || v.status === "deployed"
  );

  // Get selected version objects
  const selectedVersionObjects = trainedVersions.filter((v) =>
    selectedVersions.includes(v.id)
  );

  // Prepare data for comparison chart
  const prepareComparisonData = () => {
    return metricsConfig.map((metricConfig) => {
      const dataPoint: any = {
        name: metricConfig.label,
      };
      
      selectedVersionObjects.forEach((version) => {
        dataPoint[`v${version.version_number}`] = version.metrics[metricConfig.key] || 0;
      });
      
      return dataPoint;
    });
  };

  // Prepare data for history chart (comparing all versions for a specific metric)
  const prepareHistoryData = (metricKey: string) => {
    return trainedVersions
      .sort((a, b) => a.version_number - b.version_number)
      .map((version) => ({
        name: `v${version.version_number}`,
        value: version.metrics[metricKey] || 0,
      }));
  };

  // Format value for display
  const formatValue = (value: number) => {
    return typeof value === 'number' ? value.toFixed(4) : 'N/A';
  };

  // Handle version selection change
  const handleVersionChange = (value: string) => {
    setSelectedVersions([value]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Metrics Overview</CardTitle>
              <CardDescription>
                Compare metrics across model versions
              </CardDescription>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Version
              </label>
              <Select
                value={selectedVersions[0] || ""}
                onValueChange={handleVersionChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Version" />
                </SelectTrigger>
                <SelectContent>
                  {trainedVersions
                    .sort((a, b) => b.version_number - a.version_number)
                    .map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        v{version.version_number}
                        {version.tags.includes("production")
                          ? " (Production)"
                          : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {trainedVersions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No trained versions available with metrics.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Performance summary table */}
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Metric
                      </th>
                      {selectedVersionObjects.map((version) => (
                        <th
                          key={version.id}
                          className="px-4 py-3 text-left text-sm font-medium"
                        >
                          v{version.version_number}
                          {version.tags.includes("production")
                            ? " (Production)"
                            : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {metricsConfig.map((metricConfig) => (
                      <tr key={metricConfig.key}>
                        <td className="px-4 py-3 text-sm font-medium">
                          <div>{metricConfig.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {metricConfig.description}
                          </div>
                        </td>
                        {selectedVersionObjects.map((version) => (
                          <td
                            key={version.id}
                            className="px-4 py-3 text-sm"
                          >
                            {formatValue(version.metrics[metricConfig.key] || 0)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Charts */}
              <Tabs defaultValue="bar" className="w-full">
                <TabsList>
                  <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="bar" className="pt-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareComparisonData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        {selectedVersionObjects.map((version) => (
                          <Bar
                            key={version.id}
                            dataKey={`v${version.version_number}`}
                            name={`Version ${version.version_number}`}
                            fill={version.tags.includes("production") ? "#8884d8" : "#82ca9d"}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="pt-4">
                  <div className="mb-4">
                    <Select defaultValue={metricsConfig[0]?.key || ""}>
                      <SelectTrigger className="w-[240px]">
                        <SelectValue placeholder="Select metric to track" />
                      </SelectTrigger>
                      <SelectContent>
                        {metricsConfig.map((metricConfig) => (
                          <SelectItem
                            key={metricConfig.key}
                            value={metricConfig.key}
                          >
                            {metricConfig.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={prepareHistoryData(metricsConfig[0]?.key || "")}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelMetricsView;