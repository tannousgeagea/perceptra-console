import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Download, Upload, RefreshCw } from 'lucide-react';

interface ProjectDatasetHeaderProps {
  total: number;
  annotated: number;
  unannotated: number;
  reviewed: number;
  selectedCount: number;
  onRefresh: () => void;
  onUpload: () => void;
}

export function ProjectDatasetHeader({
  total,
  annotated,
  unannotated,
  reviewed,
  selectedCount,
  onRefresh,
  onUpload,
}: ProjectDatasetHeaderProps) {

  return (
    <div className="flex flex-col gap-4 pb-6 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Data Lake
          </Button> */}
          <div>
            <h1 className="text-3xl font-bold">Project Dataset</h1>
            <p className="text-muted-foreground mt-1">
              Manage your project images and annotations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button variant="outline" size="sm" disabled={selectedCount === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export ({selectedCount})
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Total:</span>
          <Badge variant="secondary">{total}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Annotated:</span>
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{annotated}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Reviewed:</span>
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">{reviewed}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Unannotated:</span>
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{unannotated}</Badge>
        </div>
      </div>
    </div>
  );
}
