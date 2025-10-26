import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { fetchEvaluationStats } from './api';
import { EvaluationStats } from '@/types/dashboard';
import { Gauge } from 'lucide-react';

interface EvaluationAnalyticsPanelProps {
  projectId: string;
}

const STATUS_COLORS = ['#40c057', '#fa5252', '#fab005']; // TP, FP, FN
const METRIC_COLORS = {
  precision: '#4dabf7',
  recall: '#5c7cfa',
  f1: '#7950f2',
};

const EvaluationAnalyticsPanel: React.FC<EvaluationAnalyticsPanelProps> = ({ projectId }) => {
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchEvaluationStats(projectId);
        setStats(data);
      } catch (error) {
        console.error("Error fetching evaluation stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [projectId]);

  if (loading) {
    return (
      <DashboardCard title="Model Evaluation" icon={Gauge}>
        <div className="h-40 flex items-center justify-center animate-pulse">
          Loading evaluation data...
        </div>
      </DashboardCard>
    );
  }

  if (!stats) {
    return (
      <DashboardCard title="Model Evaluation" icon={Gauge}>
        <div className="text-red-500">Failed to load evaluation data.</div>
      </DashboardCard>
    );
  }

  const pieData = [
    { name: 'True Positive', value: stats.tp },
    { name: 'False Positive', value: stats.fp },
    { name: 'False Negative', value: stats.fn },
  ];

  const confusionData = stats.confusion_matrix.map(entry => ({
    class: entry.class_name,
    TP: entry.TP,
    FP: entry.FP,
    FN: entry.FN,
  }));

  return (
    <DashboardCard title="Model Evaluation" icon={Gauge}>
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <h4 className="font-medium mb-2 text-dashboard-text">Detection Accuracy (TP / FP / FN)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col justify-center space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Precision</p>
              <div className="h-3 bg-gray-200 rounded">
                <div className="h-3 rounded" style={{ width: `${(stats.precision * 100).toFixed(1)}%`, backgroundColor: METRIC_COLORS.precision }} />
              </div>
              <p className="text-xs">{(stats.precision * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recall</p>
              <div className="h-3 bg-gray-200 rounded">
                <div className="h-3 rounded" style={{ width: `${(stats.recall * 100).toFixed(1)}%`, backgroundColor: METRIC_COLORS.recall }} />
              </div>
              <p className="text-xs">{(stats.recall * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">F1 Score</p>
              <div className="h-3 bg-gray-200 rounded">
                <div className="h-3 rounded" style={{ width: `${(stats.f1_score * 100).toFixed(1)}%`, backgroundColor: METRIC_COLORS.f1 }} />
              </div>
              <p className="text-xs">{(stats.f1_score * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-dashboard-text mt-2">
                Mean Average Precision (mAP): {(stats.mean_average_precision * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2 text-dashboard-text">Confusion Matrix by Class</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confusionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="class" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="TP" stackId="a" fill={STATUS_COLORS[0]} />
                <Bar dataKey="FP" stackId="a" fill={STATUS_COLORS[1]} />
                <Bar dataKey="FN" stackId="a" fill={STATUS_COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default EvaluationAnalyticsPanel;
