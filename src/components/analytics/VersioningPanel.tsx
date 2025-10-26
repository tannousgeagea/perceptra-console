import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { GitBranch, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Version } from '@/types/dashboard';
import { fetchVersions } from './api';
import { Button } from '@/components/ui/ui/button';
import { formatDistance } from 'date-fns';

interface VersioningPanelProps {
  projectId: string;
}

const VersioningPanel: React.FC<VersioningPanelProps> = ({ projectId }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchVersions(projectId);
        setVersions(data);
      } catch (error) {
        console.error("Error loading versions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const toggleVersionDetails = (versionId: number) => {
    if (expandedVersion === versionId) {
      setExpandedVersion(null);
    } else {
      setExpandedVersion(versionId);
    }
  };

  if (loading) {
    return (
      <DashboardCard title="Version History" icon={GitBranch}>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-pulse">Loading version data...</div>
        </div>
      </DashboardCard>
    );
  }

  if (!versions.length) {
    return (
      <DashboardCard title="Version History" icon={GitBranch}>
        <div className="text-muted-foreground">No versions available</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Version History" icon={GitBranch}>
      <div className="space-y-2">
        {versions.map((version, index) => {
          const isExpanded = expandedVersion === version.id;
          const isFirst = index === 0;
          const isPrevious = index === 1;
          
          return (
            <div 
              key={version.id} 
              className={`border rounded-lg overflow-hidden 
                ${isFirst ? 'border-dashboard-blue bg-blue-50' : 'border-border'}
                ${isPrevious ? 'bg-gray-50' : ''}
              `}
            >
              <div 
                className="flex flex-wrap items-center justify-between gap-2 p-3 cursor-pointer"
                onClick={() => toggleVersionDetails(version.id)}
              >
                <div className="flex items-center space-x-3">
                  {isFirst && (
                    <span className="px-2 py-0.5 text-xs bg-dashboard-blue text-white rounded">Current</span>
                  )}
                  
                  <div>
                    <div className="font-medium">{version.version_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistance(new Date(version.created_at), new Date(), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm">{version.image_count} images</span>
                  
                  {version.download_url && (
                    <Button size="sm" variant="outline" asChild className="h-8">
                      <a href={version.download_url} download>
                        <Download className="h-4 w-4 mr-1" />
                        <span>Download</span>
                      </a>
                    </Button>
                  )}
                  
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-3 pt-0 border-t">
                  <p>{version.description}</p>
                  
                  {index > 0 && (
                    <div className="mt-2 pt-2 border-t border-dashed">
                      <h4 className="text-sm font-medium mb-1">Changes from previous version</h4>
                      <div className="text-sm">
                        <span className="text-green-600">+{version.image_count - versions[index - 1].image_count}</span> 
                        {' '}images added
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};

export default VersioningPanel;