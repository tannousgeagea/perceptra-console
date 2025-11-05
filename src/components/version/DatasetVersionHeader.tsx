import { Button } from "@/components/ui/ui/button";
import { Plus, RefreshCw, Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DatasetVersionsHeaderProps {
  projectId: string;
  totalVersions: number;
  readyVersions: number;
  processingVersions: number;
  onRefresh: () => void;
  onCreateVersion: () => void;
}

export function DatasetVersionsHeader({
  projectId,
  totalVersions,
  readyVersions,
  processingVersions,
  onRefresh,
  onCreateVersion,
}: DatasetVersionsHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="border-b bg-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/projects/${projectId}/dataset`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Dataset Versions</h1>
              <p className="text-muted-foreground mt-1">
                Manage and export dataset snapshots for training
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={onCreateVersion}>
              <Plus className="h-4 w-4" />
              Create Version
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background rounded-lg p-4 border">
            <div className="text-sm text-muted-foreground mb-1">Total Versions</div>
            <div className="text-2xl font-bold">{totalVersions}</div>
          </div>
          <div className="bg-background rounded-lg p-4 border">
            <div className="text-sm text-muted-foreground mb-1">Ready</div>
            <div className="text-2xl font-bold text-green-600">{readyVersions}</div>
          </div>
          <div className="bg-background rounded-lg p-4 border">
            <div className="text-sm text-muted-foreground mb-1">Processing</div>
            <div className="text-2xl font-bold text-yellow-600">{processingVersions}</div>
          </div>
          <div className="bg-background rounded-lg p-4 border">
            <div className="text-sm text-muted-foreground mb-1">Pending</div>
            <div className="text-2xl font-bold text-muted-foreground">
              {totalVersions - readyVersions - processingVersions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
