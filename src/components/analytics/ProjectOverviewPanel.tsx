import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import StatCard from './StatCard';
import { Database, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/ui/badge';
import { Separator } from '@/components/ui/ui/separator';
import { Project, ProjectStats } from '@/types/dashboard';
import { fetchProjectSummary, fetchProjectStats } from './api';

interface ProjectOverviewPanelProps {
  projectId: string;
}

const ProjectOverviewPanel: React.FC<ProjectOverviewPanelProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectData, statsData] = await Promise.all([
          fetchProjectSummary(projectId),
          fetchProjectStats(projectId)
        ]);
        
        setProject(projectData);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading project data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <DashboardCard title="Project Overview" icon={Database}>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-pulse">Loading project data...</div>
        </div>
      </DashboardCard>
    );
  }

  if (!project || !stats) {
    return (
      <DashboardCard title="Project Overview" icon={Database}>
        <div className="text-red-500">Error loading project data</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Project Overview" icon={Database}>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{project.name}</h2>
          <p className="text-muted-foreground mt-1">{project.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary">{project.type}</Badge>
            <Badge variant="outline">{project.visibility_level}</Badge>
            <Badge variant="outline" className="bg-dashboard-blue/10 text-dashboard-blue">
              {project.current_version.version_number}
            </Badge>
          </div>
        </div>

        <Separator />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total Images" 
            value={stats.total_images} 
          />
          <StatCard 
            label="Annotated" 
            value={stats.annotated_images} 
            change={{ 
              value: Math.round((stats.annotated_images / stats.total_images) * 100), 
              isPositive: true 
            }} 
          />
          <StatCard 
            label="Reviewed" 
            value={stats.reviewed_images} 
            change={{ 
              value: Math.round((stats.reviewed_images / stats.total_images) * 100), 
              isPositive: true 
            }} 
          />
          <StatCard 
            label="Finalized" 
            value={stats.finalized_images} 
            change={{ 
              value: Math.round((stats.finalized_images / stats.total_images) * 100), 
              isPositive: true 
            }} 
          />
        </div>

        <Separator />
        
        <div>
          <h3 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Metadata</span>
          </h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(project.metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-dashed border-border pb-1">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default ProjectOverviewPanel;