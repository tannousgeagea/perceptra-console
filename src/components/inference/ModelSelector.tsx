
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { Input } from '@/components/ui/ui/input';
import { Search } from 'lucide-react';
import { ModelItem } from '@/types/models';

interface ModelSelectorProps {
  selectedModel: ModelItem | null;
  setSelectedModel: (model: ModelItem | null) => void;
  comparisonModel: ModelItem | null;
  setComparisonModel: (model: ModelItem | null) => void;
  isComparisonMode: boolean;
}

const mockModels: ModelItem[] = [
  {
    id: 'yolov8n',
    name: 'YOLOv8 Nano',
    version: '8.0.1',
    category: 'Object Detection',
    description: 'Ultra-fast object detection',
    accuracy: 0.87,
    speed: 'fast'
  },
  {
    id: 'yolov8s',
    name: 'YOLOv8 Small',
    version: '8.0.1',
    category: 'Object Detection',
    description: 'Balanced speed and accuracy',
    accuracy: 0.91,
    speed: 'medium'
  },
  {
    id: 'yolov8m',
    name: 'YOLOv8 Medium',
    version: '8.0.1',
    category: 'Object Detection',
    description: 'High accuracy detection',
    accuracy: 0.94,
    speed: 'slow'
  },
  {
    id: 'sam',
    name: 'Segment Anything',
    version: '1.0',
    category: 'Segmentation',
    description: 'Universal image segmentation',
    accuracy: 0.96,
    speed: 'medium'
  }
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  comparisonModel,
  setComparisonModel,
  isComparisonMode
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredModels = mockModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ModelCard = ({ model, isSelected, onClick }: { model: ModelItem, isSelected: boolean, onClick: () => void }) => (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{model.name}</h4>
        <Badge variant="secondary" className="text-xs">v{model.version}</Badge>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{model.description}</p>
      <div className="flex justify-between items-center">
        <Badge variant="outline" className="text-xs">{model.category}</Badge>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Acc: {(model.accuracy * 100).toFixed(0)}%</span>
          <div className={`w-2 h-2 rounded-full ${
            model.speed === 'fast' ? 'bg-green-500' :
            model.speed === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Model Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Primary Model
            </label>
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
          </div>

          {isComparisonMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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