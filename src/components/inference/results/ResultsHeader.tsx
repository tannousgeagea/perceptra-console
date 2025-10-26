import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Eye, EyeOff, Download, Maximize } from 'lucide-react';

interface ResultsHeaderProps {
  showOverlay: boolean;
  onToggleOverlay: () => void;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  showOverlay,
  onToggleOverlay
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Inference Results
      </h2>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleOverlay}
        >
          {showOverlay ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showOverlay ? 'Hide' : 'Show'} Overlay
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <Maximize className="w-4 h-4 mr-2" />
          Fullscreen
        </Button>
      </div>
    </div>
  );
};