import { Button } from "@/components/ui/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

interface DatasetVersionsHeaderProps {
  totalVersions: number;
  readyVersions: number;
  processingVersions: number;
  onRefresh: () => void;
  onCreateVersion: () => void;
}

export function DatasetVersionsHeader({
  totalVersions,
  readyVersions,
  processingVersions,
  onRefresh,
  onCreateVersion,
}: DatasetVersionsHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="p-6">
        <PageHeader
          className="mb-6"
          title="Dataset Versions"
          description="Manage and export dataset snapshots for training"
          actions={
            <>
              <Button variant="outline" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={onCreateVersion}>
                <Plus className="h-4 w-4" />
                Create Version
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
