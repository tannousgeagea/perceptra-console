import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { AugmentationStats } from '@/types/dashboard';
import { fetchAugmentationStats } from './api';

interface AugmentationPanelProps {
  projectId: string;
}

const AugmentationPanel: React.FC<AugmentationPanelProps> = ({ projectId }) => {
  const [stats, setStats] = useState<AugmentationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAugmentationStats(projectId);
        setStats(data);
      } catch (error) {
        console.error("Error loading augmentation stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <DashboardCard title="Augmentation Analytics" icon={RefreshCw}>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-pulse">Loading augmentation data...</div>
        </div>
      </DashboardCard>
    );
  }

  if (!stats) {
    return (
      <DashboardCard title="Augmentation Analytics" icon={RefreshCw}>
        <div className="text-red-500">Error loading augmentation data</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Augmentation Analytics" icon={RefreshCw}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{stats.total} Augmentations</h3>
            <p className="text-muted-foreground">
              Applied across {stats.version_distribution.length} versions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 text-dashboard-text">Augmentation Types</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.types}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} augmentations`, 'Count']} />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Count" 
                    fill="#8b5cf6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-dashboard-text">Distribution Across Versions</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.version_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="version_number" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} augmentations`, 'Count']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Augmentations" 
                    stroke="#8b5cf6" 
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

export default AugmentationPanel;