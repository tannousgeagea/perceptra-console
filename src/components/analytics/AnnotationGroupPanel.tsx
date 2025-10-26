import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { Layers, CheckCircle } from 'lucide-react';
import { AnnotationGroup } from '@/types/dashboard';
import { fetchAnnotationGroups } from './api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';

interface AnnotationGroupPanelProps {
  projectId: string;
}

const AnnotationGroupPanel: React.FC<AnnotationGroupPanelProps> = ({ projectId }) => {
  const [groups, setGroups] = useState<AnnotationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAnnotationGroups(projectId);
        setGroups(data);
      } catch (error) {
        console.error("Error loading annotation groups:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <DashboardCard title="Annotation Groups & Classes" icon={Layers}>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-pulse">Loading annotation groups...</div>
        </div>
      </DashboardCard>
    );
  }

  if (!groups.length) {
    return (
      <DashboardCard title="Annotation Groups & Classes" icon={Layers}>
        <div className="text-muted-foreground">No annotation groups available</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Annotation Groups & Classes" icon={Layers}>
      <Tabs defaultValue={groups[0].id.toString()}>
        <TabsList className="w-full justify-start overflow-auto">
          {groups.map(group => (
            <TabsTrigger key={group.id} value={group.id.toString()}>
              {group.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {groups.map(group => (
          <TabsContent key={group.id} value={group.id.toString()}>
            <div className="space-y-3 mt-4">
              <h3 className="text-lg font-medium">{group.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.classes.map(cls => (
                  <div key={cls.id} className="flex items-center p-3 border rounded-lg">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: cls.color }}
                    />
                    <div className="flex-grow">
                      <div className="font-medium text-sm">{cls.name}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{cls.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </DashboardCard>
  );
};

export default AnnotationGroupPanel;