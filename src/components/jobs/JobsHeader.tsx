import { Button } from "@/components/ui/ui/button";
import { Plus, RefreshCw, Download, ArrowLeft } from "lucide-react";
import { Badge } from '@/components/ui/ui/badge';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/ui/input";
import { useNavigate } from "react-router-dom";

interface JobsHeaderProps {
  projectId: string;
  totalJobs: number;
  reviewedJobs: number;
  processingJobs: number;
  onRefresh: () => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}

export function JobsHeader({
  projectId,
  totalJobs,
  reviewedJobs,
  processingJobs,
  onRefresh,
  searchQuery,
  setSearchQuery,
}: JobsHeaderProps) {
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
              <h1 className="text-3xl font-bold">Annotate</h1>
              <p className="text-muted-foreground mt-1">
                Manage and assign jobs before annotation
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Search jobs, users..."
                className="pl-9 bg-slate-100 border-slate-200 focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total:</span>
            <Badge variant="secondary">{totalJobs}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Reviewed:</span>
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">{reviewedJobs}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Processing:</span>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{processingJobs}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Pending:</span>
            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{processingJobs}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
