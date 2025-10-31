import { ViewMode } from '@/types/image';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/ui/button';
import { Grid3x3, Table2, Database, Upload } from 'lucide-react';

interface DataLakeHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalImages: number;
}

export function DataLakeHeader({ viewMode, onViewModeChange, totalImages }: DataLakeHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">DataLake</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalImages.toLocaleString()} {totalImages === 1 ? 'image' : 'images'}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate("/upload")}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className="gap-2"
        >
          <Grid3x3 className="w-4 h-4" />
          Grid
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('table')}
          className="gap-2"
        >
          <Table2 className="w-4 h-4" />
          Table
        </Button>
      </div>
    </div>
  );
}
