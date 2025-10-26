import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { Tag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AnnotationStats } from '@/types/dashboard';
import { fetchAnnotationStats } from './api';

interface AnnotationAnalyticsPanelProps {
  projectId: string;
}

const AnnotationAnalyticsPanel: React.FC<AnnotationAnalyticsPanelProps> = ({ projectId }) => {
  const [stats, setStats] = useState<AnnotationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAnnotationStats(projectId);
        setStats(data);
      } catch (error) {
        console.error("Error loading annotation stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <DashboardCard title="Annotation Analytics" icon={Tag}>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-pulse">Loading annotation data...</div>
        </div>
      </DashboardCard>
    );
  }

  if (!stats) {
    return (
      <DashboardCard title="Annotation Analytics" icon={Tag}>
        <div className="text-red-500">Error loading annotation data</div>
      </DashboardCard>
    );
  }

  // Prepare source breakdown pie chart data
  const sourceData = [
    { name: 'Manual', value: stats.source_breakdown.manual },
    { name: 'Model Generated', value: stats.source_breakdown.model_generated },
  ];

  // Prepare review status pie chart data
  const reviewData = [
    { name: 'Approved', value: stats.review_status.approved },
    { name: 'Pending', value: stats.review_status.pending },
    { name: 'Rejected', value: stats.review_status.rejected },
  ];

  const SOURCE_COLORS = ['#4c6ef5', '#12b886'];
  const REVIEW_COLORS = ['#40c057', '#fab005', '#fa5252'];

  return (
    <DashboardCard title="Annotation Analytics" icon={Tag}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{stats.total} Annotations</h3>
            <p className="text-muted-foreground">
              Average {stats.average_per_image.toFixed(1)} annotations per image
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-dashboard-text">Annotation Class Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.class_distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value) => [`${value} annotations`, 'Count']}
                  labelFormatter={(label) => `Class: ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  name="Annotations" 
                  fill="#228be6"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  {stats.class_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 text-dashboard-text">Annotation Source</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} annotations`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-dashboard-text">Review Status</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {reviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={REVIEW_COLORS[index % REVIEW_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} annotations`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default AnnotationAnalyticsPanel;