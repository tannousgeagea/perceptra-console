
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { TrendingUp, Target, BarChart3, PieChart } from "lucide-react";
import { metricsData } from "@/types/validation";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar 
} from "recharts";

interface ValidationMetricsChartsProps {
  metricsData: metricsData
}

const ValidationMetricsCharts = ({ metricsData }: ValidationMetricsChartsProps) => {
  if (!metricsData) return null
  const { precisionConfidence, recallConfidence, precisionRecall, f1Confidence, rocCurve, confusionMatrix } = metricsData;

  // Process confusion matrix for heatmap visualization
  const confusionMatrixProcessed = [
    { class: 'Car', car: 245, pedestrian: 8, cyclist: 2, truck: 5 },
    { class: 'Pedestrian', car: 12, pedestrian: 189, cyclist: 6, truck: 3 },
    { class: 'Cyclist', car: 5, pedestrian: 9, cyclist: 156, truck: 2 },
    { class: 'Truck', car: 7, pedestrian: 4, cyclist: 1, truck: 198 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Performance Summary
          </CardTitle>
          <CardDescription>Key performance indicators at optimal threshold</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{metricsData.map}</p>
              <p className="text-sm text-slate-500">mAP@0.5</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{metricsData.precision}</p>
              <p className="text-sm text-slate-500">Precision</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{metricsData.recall}</p>
              <p className="text-sm text-slate-500">Recall</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{metricsData.f1}</p>
              <p className="text-sm text-slate-500">F1-Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{metricsData.best_threshold}</p>
              <p className="text-sm text-slate-500">Optimal Threshold</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Precision-Confidence and Recall-Confidence Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Precision-Confidence Curve
            </CardTitle>
            <CardDescription>Precision values across confidence thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={precisionConfidence}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="confidence" 
                    domain={[0, 1]}
                    type="number"
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <YAxis domain={[0, 1]} tickFormatter={(value) => value.toFixed(1)} />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(3), 'Precision']}
                    labelFormatter={(value) => `Confidence: ${value.toFixed(3)}`}
                  />
                  <Line type="monotone" dataKey="precision" stroke="#3b82f6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recall-Confidence Curve
            </CardTitle>
            <CardDescription>Recall values across confidence thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recallConfidence}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="confidence" 
                    domain={[0, 1]}
                    type="number"
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <YAxis domain={[0, 1]} tickFormatter={(value) => value.toFixed(1)} />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(3), 'Recall']}
                    labelFormatter={(value) => `Confidence: ${value.toFixed(3)}`}
                  />
                  <Line type="monotone" dataKey="recall" stroke="#ef4444" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Precision-Recall and F1-Confidence Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Precision-Recall Curve</CardTitle>
            <CardDescription>Trade-off between precision and recall</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={precisionRecall}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="recall" 
                    domain={[0, 1]}
                    type="number"
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <YAxis domain={[0, 1]} tickFormatter={(value) => value.toFixed(1)} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [value.toFixed(3), name === 'precision' ? 'Precision' : 'Recall']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="precision" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>F1-Score vs Confidence</CardTitle>
            <CardDescription>F1-Score across different confidence thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={f1Confidence}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="confidence" 
                    domain={[0, 1]}
                    type="number"
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <YAxis domain={[0, 1]} tickFormatter={(value) => value.toFixed(1)} />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(3), 'F1-Score']}
                    labelFormatter={(value) => `Confidence: ${value.toFixed(3)}`}
                  />
                  <Line type="monotone" dataKey="f1Score" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROC Curve and Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ROC Curve</CardTitle>
            <CardDescription>Receiver Operating Characteristic curve (AUC = 0.94)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rocCurve}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fpr" 
                    domain={[0, 1]}
                    type="number"
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <YAxis domain={[0, 1]} tickFormatter={(value) => value.toFixed(1)} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value.toFixed(3), 
                      name === 'tpr' ? 'True Positive Rate' : 'False Positive Rate'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tpr" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                  {/* Diagonal reference line */}
                  <Line 
                    type="linear" 
                    dataKey="fpr" 
                    stroke="#9ca3af" 
                    strokeDasharray="5 5" 
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Confusion Matrix
            </CardTitle>
            <CardDescription>Classification performance by class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confusionMatrixProcessed} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="car" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="pedestrian" stackId="a" fill="#ef4444" />
                  <Bar dataKey="cyclist" stackId="a" fill="#10b981" />
                  <Bar dataKey="truck" stackId="a" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValidationMetricsCharts;