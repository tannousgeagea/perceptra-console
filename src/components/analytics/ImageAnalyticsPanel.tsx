import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { Image } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ImageStats } from '@/types/dashboard';
import { fetchImageStats } from './api';
import { format, parseISO } from 'date-fns';

interface ImageAnalyticsPanelProps {
  projectId: string;
}

const ImageAnalyticsPanel: React.FC<ImageAnalyticsPanelProps> = ({ projectId }) => {
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchImageStats(projectId);
        setStats(data);
      } catch (error) {
        console.error("Error loading image stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <DashboardCard title="Image Analytics" icon={Image}>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-pulse">Loading image data...</div>
        </div>
      </DashboardCard>
    );
  }

  if (!stats) {
    return (
      <DashboardCard title="Image Analytics" icon={Image}>
        <div className="text-red-500">Error loading image data</div>
      </DashboardCard>
    );
  }

  // Prepare pie chart data
  const pieData = [
    { name: 'Unannotated', value: stats.status_breakdown.unannotated },
    { name: 'Annotated', value: stats.status_breakdown.annotated },
    { name: 'Reviewed', value: stats.status_breakdown.reviewed },
    { name: 'Dataset', value: stats.status_breakdown.dataset },
  ];

  const COLORS = ['#e9ecef', '#74c0fc', '#4dabf7', '#228be6'];
  
  // Prepare line chart data
  const trendData = stats.upload_trend.map(item => ({
    date: format(parseISO(item.date), 'MMM yyyy'),
    count: item.count
  }));

  return (
    <DashboardCard title="Image Analytics" icon={Image}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{stats.total} Images</h3>
            <p className="text-muted-foreground">
              {stats.status_breakdown.null_marked} marked as null/invalid
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 text-dashboard-text">Image Status Distribution</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} images`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-dashboard-text">Upload Trend</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} images`, 'Count']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Images Uploaded" 
                    stroke="#228be6" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default ImageAnalyticsPanel;