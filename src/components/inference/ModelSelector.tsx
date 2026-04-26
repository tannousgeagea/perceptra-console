import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { Input } from '@/components/ui/ui/input';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Search } from 'lucide-react';
import { ModelItem } from '@/types/models';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';

interface ModelSelectorProps {
  projectId?: string;
  selectedModel: ModelItem | null;
  setSelectedModel: (model: ModelItem | null) => void;
  comparisonModel: ModelItem | null;
  setComparisonModel: (model: ModelItem | null) => void;
  isComparisonMode: boolean;
}

function useDeployedModels(projectId?: string) {
  return useQuery<ModelItem[]>({
    queryKey: ['deployed-models', projectId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/models/projects/${projectId}/models`);
      if (!res.ok) throw new Error('Failed to fetch models');
      const data: any[] = await res.json();
      return data
        .filter((m) => m.has_production_version)
        .map((m): ModelItem => ({
          id: m.id,
          name: m.name,
          version: m.production_version_number ? `v${m.production_version_number}` : '',
          category: m.task ?? 'Object Detection',
          description: m.description ?? '',
          accuracy: 0,
          speed: 'medium',
          version_id: m.production_version_id,
        }));
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
}

const ModelCard = ({
  model,
  isSelected,
  onClick,
}: {
  model: ModelItem;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <div
    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
      isSelected
        ? 'border-primary bg-primary/5'
        : 'border-border hover:border-muted-foreground/40'
    }`}
    onClick={onClick}
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-medium text-sm">{model.name}</h4>
      {model.version && (
        <Badge variant="secondary" className="text-xs">{model.version}</Badge>
      )}
    </div>
    {model.description && (
      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{model.description}</p>
    )}
    <Badge variant="outline" className="text-xs">{model.category}</Badge>
  </div>
);

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  projectId,
  selectedModel,
  setSelectedModel,
  comparisonModel,
  setComparisonModel,
  isComparisonMode,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { data: models = [], isLoading } = useDeployedModels(projectId);

  const filteredModels = models.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Model Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Primary Model</label>
            {!projectId ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Select a project to load models.
              </p>
            ) : isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : filteredModels.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No deployed models found.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredModels.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isSelected={selectedModel?.id === model.id}
                    onClick={() => setSelectedModel(model)}
                  />
                ))}
              </div>
            )}
          </div>

          {isComparisonMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Comparison Model
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredModels.map((model) => (
                  <ModelCard
                    key={`comp-${model.id}`}
                    model={model}
                    isSelected={comparisonModel?.id === model.id}
                    onClick={() => setComparisonModel(model)}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
